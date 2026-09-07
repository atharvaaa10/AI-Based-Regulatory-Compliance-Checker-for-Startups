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
import concurrent.futures
import logging

from fastapi import APIRouter, HTTPException

from backend.config.loader import load_checklist, load_prompt_template
from backend.llm.gemini_client import call_model_a, call_model_b, MODEL_A_NAME, MODEL_B_NAME
from backend.llm.prompt_builder import build_prompt
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
# JSON extraction helpers
# ---------------------------------------------------------------------------

def _extract_json(raw: str) -> dict:
    """
    Parse the model's response as JSON.

    Models sometimes wrap JSON in markdown code fences or add preamble text.
    This function handles both the clean case and the wrapped case.
    """
    text = raw.strip()

    # Remove markdown code fences if present (```json ... ``` or ``` ... ```)
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    text = text.strip()

    # Try direct parse first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Fallback: find the first {...} block in the response
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    raise ValueError(f"No valid JSON found in model response: {text[:300]!r}")


def _parse_result(item: dict, raw: str) -> ChecklistItemResult:
    """
    Convert a raw model response string into a ChecklistItemResult.

    On any parse failure, returns a safe fallback result so that one
    bad model response doesn't crash the entire /check request.
    """
    try:
        data = _extract_json(raw)
        return ChecklistItemResult(
            id=item["id"],
            requirement=item["requirement"],
            status=data.get("status", "Missing"),
            cited_sections=data.get("cited_sections", []),
            reason=data.get("reason", "Model returned an unparseable response."),
            suggested_fix=data.get("suggested_fix") or None,
            confidence=max(0, min(100, int(data.get("confidence", 50)))),
        )
    except Exception as exc:
        logger.warning("Failed to parse model response for item '%s': %s", item["id"], exc)
        return ChecklistItemResult(
            id=item["id"],
            requirement=item["requirement"],
            status="Missing",
            cited_sections=[],
            reason=f"Error parsing model response: {exc}",
            suggested_fix="Please retry this check — the model returned an unexpected format.",
            confidence=0,
        )


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
    summary="Check a privacy policy against the DPDP Act 2023",
    description=(
        "Accepts a startup's privacy policy text and evaluates it against "
        "15 DPDP Act 2023 compliance requirements using two Gemini models in parallel. "
        "Returns per-item verdicts, weighted scores, and a model agreement rate."
    ),
)
def check_compliance(request: ComplianceRequest) -> ComplianceResponse:
    checklist = load_checklist()
    template  = load_prompt_template()

    results_a: list[ChecklistItemResult] = []
    results_b: list[ChecklistItemResult] = []

    for item in checklist:
        logger.info("Checking item: %s", item["id"])

        # Step 1: Retrieve top-5 relevant DPDP Act clauses
        clauses = retrieve_relevant_clauses(item["query"], top_k=5)

        # Step 2: Build grounded prompt
        prompt = build_prompt(template, item["requirement"], clauses, request.policy_text)

        # Step 3: Call both models concurrently
        try:
            with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
                future_a = executor.submit(call_model_a, prompt)
                future_b = executor.submit(call_model_b, prompt)
                raw_a = future_a.result(timeout=60)
                raw_b = future_b.result(timeout=60)
        except concurrent.futures.TimeoutError:
            raise HTTPException(
                status_code=504,
                detail=f"Gemini API timed out on checklist item '{item['id']}'. Please retry.",
            )
        except Exception as exc:
            raise HTTPException(
                status_code=502,
                detail=f"Gemini API error on item '{item['id']}': {exc}",
            )

        # Step 4: Parse responses
        results_a.append(_parse_result(item, raw_a))
        results_b.append(_parse_result(item, raw_b))

    # Step 5: Agreement rate
    n = len(checklist)
    matched = sum(1 for a, b in zip(results_a, results_b) if a.status == b.status)
    agreement_rate = round(matched / n, 4) if n else 0.0

    # Step 6: Disagreement list
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
