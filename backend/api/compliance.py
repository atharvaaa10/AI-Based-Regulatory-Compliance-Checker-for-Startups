"""
compliance.py — POST /check route handler.

Flow for each request:
  For every checklist item (15 total):
    1. Retrieve top-5 relevant DPDP Act clauses via RAG
    2. Build grounded prompt (requirement + clauses + policy text)
    3. Call Model A (gemini-3.7-flash) and Model B (gemini-3.5-flash) concurrently
    4. Parse each model's JSON response into a ChecklistItemResult

  After all items:
    5. Compute weighted compliance score for each model
    6. Calculate agreement rate and list disagreements
    7. Return ComplianceResponse

Concurrency strategy:
  - Model A and B are called concurrently per item (ThreadPoolExecutor, 2 workers).
  - Items are processed sequentially to respect free-tier rate limits.
  Total latency ≈ 15 items × ~3s per pair ≈ ~45s. Acceptable for a demo.
"""

import json
import re
import time
import concurrent.futures
import logging

from fastapi import APIRouter, HTTPException

from backend.config.loader import load_checklist, load_prompt_template, load_batched_prompt_template
from backend.llm.gemini_client import call_model_a, call_model_b, MODEL_A_NAME, MODEL_B_NAME
from backend.llm.prompt_builder import build_prompt, build_batched_prompt
from backend.rag.retriever import retrieve_relevant_clauses
from backend.schemas.models import (
    AgreementDetail,
    ChecklistItemResult,
    ComplianceRequest,
    ComplianceResponse,
    ModelResult,
)

logger = logging.getLogger(__name__)
router = APIRouter()

# ---------------------------------------------------------------------------
# Rate-limit retry helper
# ---------------------------------------------------------------------------

def _call_with_retry(fn, prompt: str, max_retries: int = 3) -> str:
    """
    Call a Gemini API function, retrying on 429 rate-limit errors and 503 transient spikes.
    """
    for attempt in range(max_retries):
        try:
            return fn(prompt)
        except Exception as exc:
            err_str = str(exc)
            is_rate_limit = (
                "429" in err_str
                or "quota" in err_str.lower()
                or "resource_exhausted" in err_str.lower()
            )
            is_transient_error = (
                "503" in err_str
                or "500" in err_str
                or "unavailable" in err_str.lower()
                or "high demand" in err_str.lower()
            )

            if not (is_rate_limit or is_transient_error) or attempt == max_retries - 1:
                raise

            if is_rate_limit:
                delay_match = (
                    re.search(r"retryDelay':\s*'(\d+)", err_str)
                    or re.search(r"Please retry in (\d+(?:\.\d+)?)s", err_str)
                    or re.search(r"retry_delay\s*\{[^}]*seconds:\s*(\d+)", err_str)
                )
                sleep_secs = int(float(delay_match.group(1))) + 2 if delay_match else 30 * (attempt + 1)
                logger.warning(
                    "Rate limit hit (attempt %d/%d). Sleeping %ds...",
                    attempt + 1, max_retries, sleep_secs,
                )
            else:
                sleep_secs = 5 * (attempt + 1)
                logger.warning(
                    "Transient server error %s (attempt %d/%d). Sleeping %ds...",
                    exc, attempt + 1, max_retries, sleep_secs,
                )

            time.sleep(sleep_secs)

    raise RuntimeError("Exceeded max retries for Gemini API call")


# ---------------------------------------------------------------------------
# JSON extraction helpers
# ---------------------------------------------------------------------------

def _extract_json_array(raw: str) -> list[dict]:
    """
    Parse the model's batched response into a list of JSON dicts.
    Handles raw JSON arrays, code-fenced JSON arrays, wrapped objects like {"results": [...]},
    or embedded array blocks.
    """
    text = raw.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    text = text.strip()

    res = None
    try:
        res = json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\[\s*\{.*\}\s*\]", text, re.DOTALL)
        if match:
            try:
                res = json.loads(match.group())
            except json.JSONDecodeError:
                pass
        if res is None:
            match_obj = re.search(r"\{.*\}", text, re.DOTALL)
            if match_obj:
                try:
                    res = json.loads(match_obj.group())
                except json.JSONDecodeError:
                    pass

    # If wrapped in a dict e.g. {"results": [...]}
    if isinstance(res, dict):
        for val in res.values():
            if isinstance(val, list) and len(val) > 0 and isinstance(val[0], dict):
                return val

    if isinstance(res, list):
        return [item for item in res if isinstance(item, dict)]

    raise ValueError(f"No valid JSON array found in model response: {text[:300]!r}")


def _parse_batched_results(
    checklist: list[dict],
    raw: str,
) -> list[ChecklistItemResult]:
    """
    Convert a raw batched model response string into a list of ChecklistItemResult objects.
    Maps results to checklist items by item['id'] first, with index-based fallback.
    Provides robust per-item defaults on any individual item parse anomaly.
    """
    try:
        items_data = _extract_json_array(raw)
    except Exception as exc:
        logger.warning("Failed to extract JSON array from batched response: %s", exc)
        items_data = []

    by_id = {
        d.get("id"): d
        for d in items_data
        if isinstance(d, dict) and d.get("id")
    }

    results: list[ChecklistItemResult] = []
    for idx, item in enumerate(checklist):
        item_id = item["id"]
        req_text = item["requirement"]

        # 1. Lookup by ID
        data = by_id.get(item_id)
        # 2. Fallback to index if available
        if not data and idx < len(items_data) and isinstance(items_data[idx], dict):
            data = items_data[idx]

        if not data:
            results.append(
                ChecklistItemResult(
                    id=item_id,
                    requirement=req_text,
                    status="Missing",
                    cited_sections=[],
                    reason="Model response omitted this checklist item.",
                    suggested_fix="Please retry evaluation — item was missing from batched output.",
                    confidence=0,
                )
            )
            continue

        raw_status = str(data.get("status", "Missing")).strip()
        status = "Missing"
        for candidate in ("Met", "Partially Met", "Missing"):
            if raw_status.lower() == candidate.lower():
                status = candidate
                break

        cited = data.get("cited_sections", [])
        if isinstance(cited, str):
            cited = [cited]
        cited_sections = [str(c).strip() for c in cited if str(c).strip()]

        raw_conf = data.get("confidence", 50)
        try:
            confidence = max(0, min(100, int(raw_conf)))
        except (ValueError, TypeError):
            confidence = 50

        results.append(
            ChecklistItemResult(
                id=item_id,
                requirement=req_text,
                status=status,
                cited_sections=cited_sections,
                reason=str(data.get("reason", "")).strip() or "No specific reason provided.",
                suggested_fix=str(data.get("suggested_fix", "")).strip() or None if status != "Met" else None,
                confidence=confidence,
            )
        )

    return results


# ---------------------------------------------------------------------------
# Scoring helper
# ---------------------------------------------------------------------------

def _compute_score(results: list[ChecklistItemResult]) -> float:
    """
    Weighted compliance score as a percentage:
        Met          = 1.0 point
        Partially Met = 0.5 points
        Missing      = 0.0 points

    Score = (total points / total items) × 100, rounded to 1 decimal.
    """
    if not results:
        return 0.0
    weights = {"Met": 1.0, "Partially Met": 0.5, "Missing": 0.0}
    total_points = sum(weights.get(r.status, 0.0) for r in results)
    return round(total_points / len(results) * 100, 1)


# ---------------------------------------------------------------------------
# Route
# ---------------------------------------------------------------------------

@router.post(
    "/check",
    response_model=ComplianceResponse,
    summary="Check a privacy policy against the DPDP Act 2023 (Batched)",
    description=(
        "Accepts a startup's privacy policy text and evaluates it against all "
        "15 DPDP Act 2023 compliance requirements in a single batched prompt per model. "
        "Returns per-item verdicts, weighted scores, and a model agreement rate."
    ),
)
def check_compliance(request: ComplianceRequest) -> ComplianceResponse:
    checklist = load_checklist()
    template  = load_batched_prompt_template()

    # Step 1: Pre-retrieve relevant clauses for all 15 checklist items
    item_clauses_map: dict[str, list[dict]] = {}
    for item in checklist:
        item_clauses_map[item["id"]] = retrieve_relevant_clauses(item["query"], top_k=4)

    # Step 2: Build single comprehensive batched prompt
    batched_prompt = build_batched_prompt(
        template,
        checklist,
        item_clauses_map,
        request.policy_text,
    )

    # Step 3: Call both models in parallel (1 call per model!)
    try:
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
            future_a = executor.submit(_call_with_retry, call_model_a, batched_prompt)
            future_b = executor.submit(_call_with_retry, call_model_b, batched_prompt)
            raw_a = future_a.result(timeout=120)
            raw_b = future_b.result(timeout=120)
    except concurrent.futures.TimeoutError:
        raise HTTPException(
            status_code=504,
            detail="Gemini API timed out during compliance evaluation. Please retry.",
        )
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Gemini API error: {exc}",
        )

    # Step 4: Parse batched response JSON arrays into ChecklistItemResult lists
    results_a = _parse_batched_results(checklist, raw_a)
    results_b = _parse_batched_results(checklist, raw_b)

    # Step 5: Calculate agreement rate
    n = len(checklist)
    matched = sum(1 for a, b in zip(results_a, results_b) if a.status == b.status)
    agreement_rate = round(matched / n, 4) if n else 0.0

    # Step 6: Identify disagreements
    disagreements = [
        AgreementDetail(
            item_id=a.id,
            requirement=a.requirement,
            model_a_status=a.status,
            model_b_status=b.status,
        )
        for a, b in zip(results_a, results_b)
        if a.status != b.status
    ]

    return ComplianceResponse(
        model_a=ModelResult(
            model_name=MODEL_A_NAME,
            score=_compute_score(results_a),
            results=results_a,
        ),
        model_b=ModelResult(
            model_name=MODEL_B_NAME,
            score=_compute_score(results_b),
            results=results_b,
        ),
        agreement_rate=agreement_rate,
        disagreements=disagreements,
    )
