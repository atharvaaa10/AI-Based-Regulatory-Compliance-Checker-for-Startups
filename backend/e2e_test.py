"""
e2e_test.py — End-to-end test of the Phase 2 compliance pipeline.

Calls the full pipeline directly (no HTTP server needed):
  RAG retrieval -> prompt build -> dual Gemini calls -> JSON parse -> score

Run from project root:
    python -m backend.e2e_test
"""

import json
import time
import concurrent.futures
import sys
import re
import logging

logging.basicConfig(level=logging.WARNING)  # suppress info noise during test

from backend.config.loader import load_checklist, load_prompt_template
from backend.llm.gemini_client import call_model_a, call_model_b, MODEL_A_NAME, MODEL_B_NAME
from backend.llm.prompt_builder import build_prompt
from backend.rag.retriever import retrieve_relevant_clauses
from backend.api.compliance import _parse_result, _compute_score, _call_with_retry

SEP  = "=" * 72
ISEP = "-" * 72

# ---------------------------------------------------------------------------
# QuickCart sample policy
# ---------------------------------------------------------------------------

SAMPLE_POLICY = """
PRIVACY POLICY — QuickCart Technologies Pvt. Ltd.

Last updated: January 2026

QuickCart Technologies ("we", "us", "our") operates the QuickCart mobile
application and website. This policy explains how we handle your
information when you use our services.

Information We Collect:
When you sign up, we collect your name, email address, phone number,
and delivery address. We also collect your order history and payment
information to process transactions. Our app may access your device's
location to show nearby delivery options.

How We Use Your Information:
We use your information to process orders, send order updates, and
occasionally share offers and promotions via email or SMS. We may also
use your data to improve our services and personalize your shopping
experience.

Sharing of Information:
We may share your information with delivery partners and payment
processors to complete your orders. We do not sell your personal
information to third parties for marketing purposes.

Data Security:
We use industry-standard security measures to protect your data,
including encryption for payment information.

Children's Privacy:
Our services are not intended for children under 18.

Contact Us:
If you have questions about this policy, contact us at
support@quickcart.example.com.
"""


def run_e2e():
    checklist = load_checklist()
    template  = load_prompt_template()

    print(f"\n{SEP}")
    print(f"  E2E TEST — QuickCart Technologies Privacy Policy")
    print(f"  {len(checklist)} checklist items | Models: {MODEL_A_NAME} vs {MODEL_B_NAME}")
    print(SEP)

    results_a = []
    results_b = []
    item_times = []

    for idx, item in enumerate(checklist, 1):
        t_item = time.perf_counter()
        print(f"\n  [{idx:02d}/{len(checklist)}] {item['id']} ... ", end="", flush=True)

        clauses   = retrieve_relevant_clauses(item["query"], top_k=5)
        prompt    = build_prompt(template, item["requirement"], clauses, SAMPLE_POLICY)
        ctx_sids  = [c["section_id"] for c in clauses]   # valid section IDs for citation check

        try:
            with concurrent.futures.ThreadPoolExecutor(max_workers=2) as ex:
                fa = ex.submit(_call_with_retry, call_model_a, prompt)
                fb = ex.submit(_call_with_retry, call_model_b, prompt)
                raw_a = fa.result(timeout=120)
                raw_b = fb.result(timeout=120)
        except Exception as e:
            print(f"API ERROR: {e}")
            sys.exit(1)

        ra = _parse_result(item, raw_a)
        rb = _parse_result(item, raw_b)
        results_a.append((ra, ctx_sids))
        results_b.append((rb, ctx_sids))

        elapsed = time.perf_counter() - t_item
        item_times.append(elapsed)
        print(f"A={ra.status[:2]}({ra.confidence})  B={rb.status[:2]}({rb.confidence})  [{elapsed:.1f}s]")

        # Inter-item delay to respect 5 RPM free-tier rate limit
        if item is not checklist[-1]:
            print(f"       (waiting 13s for rate limit...)")
            time.sleep(13)

    # -----------------------------------------------------------------------
    # Full results table
    # -----------------------------------------------------------------------
    print(f"\n{SEP}")
    print("  FULL RESULTS")
    print(SEP)

    all_results_a = [r for r, _ in results_a]
    all_results_b = [r for r, _ in results_b]

    STATUS_MAP = {"Me": "Met", "Pa": "Partially Met", "Mi": "Missing"}

    print(f"\n  {'Item':<30} {'Model A':<16} {'Model B':<16} {'Agree'}")
    print(f"  {ISEP}")
    for (ra, _), (rb, _) in zip(results_a, results_b):
        agree = "YES" if ra.status == rb.status else "NO *"
        a_str = f"{ra.status} ({ra.confidence}%)"
        b_str = f"{rb.status} ({rb.confidence}%)"
        print(f"  {ra.id:<30} {a_str:<16} {b_str:<16} {agree}")

    # -----------------------------------------------------------------------
    # Per-item detail with citation check
    # -----------------------------------------------------------------------
    print(f"\n{SEP}")
    print("  DETAILED OUTPUT + CITATION SPOT-CHECK")
    print(SEP)

    SPOT_CHECK_IDS = {"consent_withdrawal", "data_retention_deletion", "breach_notification"}

    for (ra, ctx_sids), (rb, _) in zip(results_a, results_b):
        is_spot = ra.id in SPOT_CHECK_IDS
        marker  = "  *** SPOT-CHECK ***" if is_spot else ""
        print(f"\n  {ISEP}")
        print(f"  Item: {ra.id}{marker}")
        print(f"  Requirement: {ra.requirement}")
        print(f"  Context sections available: {ctx_sids}")
        print()
        print(f"  MODEL A ({MODEL_A_NAME})")
        print(f"    Status     : {ra.status}")
        print(f"    Confidence : {ra.confidence}%")
        print(f"    Cited      : {ra.cited_sections}")
        print(f"    Reason     : {ra.reason}")
        print(f"    Fix        : {ra.suggested_fix}")
        if is_spot:
            bad = [s for s in ra.cited_sections if s not in ctx_sids]
            print(f"    Citation check: {'PASS - all cited sections in context' if not bad else 'FAIL - hallucinated: ' + str(bad)}")
        print()
        print(f"  MODEL B ({MODEL_B_NAME})")
        print(f"    Status     : {rb.status}")
        print(f"    Confidence : {rb.confidence}%")
        print(f"    Cited      : {rb.cited_sections}")
        print(f"    Reason     : {rb.reason}")
        print(f"    Fix        : {rb.suggested_fix}")
        if is_spot:
            bad = [s for s in rb.cited_sections if s not in ctx_sids]
            print(f"    Citation check: {'PASS - all cited sections in context' if not bad else 'FAIL - hallucinated: ' + str(bad)}")

    # -----------------------------------------------------------------------
    # Aggregate
    # -----------------------------------------------------------------------
    score_a = _compute_score(all_results_a)
    score_b = _compute_score(all_results_b)
    n = len(checklist)
    matched = sum(1 for a, b in zip(all_results_a, all_results_b) if a.status == b.status)
    agreement_rate = round(matched / n * 100, 1)
    disagreements = [(a.id, a.status, b.status) for a, b in zip(all_results_a, all_results_b) if a.status != b.status]

    total_time = sum(item_times)
    avg_time   = total_time / len(item_times)

    print(f"\n{SEP}")
    print("  AGGREGATE SUMMARY")
    print(SEP)
    print(f"  Model A score   : {score_a}%  ({MODEL_A_NAME})")
    print(f"  Model B score   : {score_b}%  ({MODEL_B_NAME})")
    print(f"  Agreement rate  : {agreement_rate}%  ({matched}/{n} items)")
    if disagreements:
        print(f"  Disagreements   ({len(disagreements)} items):")
        for item_id, sa, sb in disagreements:
            print(f"    {item_id}: A={sa}  B={sb}")
    else:
        print("  Disagreements   : None")
    print()
    print(f"  Total time      : {total_time:.1f}s")
    print(f"  Avg per item    : {avg_time:.1f}s  (both models concurrent per item)")
    print(f"  UX note         : {'Loading indicator STRONGLY recommended (>20s)' if total_time > 20 else 'Acceptable, progress bar still recommended'}")
    print(f"\n{SEP}\n")

    # -----------------------------------------------------------------------
    # Full raw JSON (for copy-paste / report)
    # -----------------------------------------------------------------------
    full_json = {
        "model_a": {
            "model_name": MODEL_A_NAME,
            "score": score_a,
            "results": [
                {
                    "id": r.id,
                    "requirement": r.requirement,
                    "status": r.status,
                    "cited_sections": r.cited_sections,
                    "reason": r.reason,
                    "suggested_fix": r.suggested_fix,
                    "confidence": r.confidence,
                }
                for r in all_results_a
            ],
        },
        "model_b": {
            "model_name": MODEL_B_NAME,
            "score": score_b,
            "results": [
                {
                    "id": r.id,
                    "requirement": r.requirement,
                    "status": r.status,
                    "cited_sections": r.cited_sections,
                    "reason": r.reason,
                    "suggested_fix": r.suggested_fix,
                    "confidence": r.confidence,
                }
                for r in all_results_b
            ],
        },
        "agreement_rate": round(matched / n, 4),
        "disagreements": [
            {"item_id": item_id, "model_a_status": sa, "model_b_status": sb}
            for item_id, sa, sb in disagreements
        ],
    }

    print("  RAW JSON RESPONSE:")
    print(ISEP)
    print(json.dumps(full_json, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    run_e2e()
