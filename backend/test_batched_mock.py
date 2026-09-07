"""
test_batched_mock.py — Verifies batched prompt construction and response parsing
using realistic mock LLM responses. No real Gemini API calls are made.
"""

import json
from pathlib import Path
from backend.config.loader import load_checklist, load_batched_prompt_template
from backend.llm.prompt_builder import build_batched_prompt
from backend.rag.retriever import retrieve_relevant_clauses
from backend.api.compliance import _extract_json_array, _parse_batched_results, _compute_score
from backend.schemas.models import ComplianceResponse, ModelResult, AgreementDetail

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

# Realistic mock model response for QuickCart
MOCK_MODEL_A_RAW = json.dumps([
    {
        "id": "purpose_specification",
        "status": "Partially Met",
        "cited_sections": ["Section 4", "Section 7"],
        "reason": "The policy lists general purposes like order processing and promotions, but lacks precise statutory purpose specifications.",
        "suggested_fix": "Clearly itemize specific lawful purposes for each category of personal data collected under Section 4.",
        "confidence": 85
    },
    {
        "id": "consent_mechanism",
        "status": "Missing",
        "cited_sections": ["Section 6(1)"],
        "reason": "The policy does not describe how explicit, informed, and unconditional consent is obtained prior to data processing.",
        "suggested_fix": "Add an explicit consent mechanism detailing how affirmative consent is obtained before collecting data.",
        "confidence": 100
    },
    {
        "id": "notice_before_collection",
        "status": "Partially Met",
        "cited_sections": ["Section 5"],
        "reason": "The policy informs users of collected data types and usage, but omits information on how to exercise rights or file a complaint with the Board.",
        "suggested_fix": "Include explicit notice informing Data Principals of rights withdrawal procedures and Board complaint mechanisms.",
        "confidence": 95
    },
    {
        "id": "consent_withdrawal",
        "status": "Missing",
        "cited_sections": ["Section 6(4)", "Section 6(5)"],
        "reason": "The policy provides no mechanism for Data Principals to withdraw consent.",
        "suggested_fix": "Add a dedicated section detailing how consent can be withdrawn with comparable ease to how it was given.",
        "confidence": 100
    },
    {
        "id": "lawful_basis",
        "status": "Partially Met",
        "cited_sections": ["Section 4", "Section 7"],
        "reason": "The policy mentions uses for service improvement and promotions without clarifying lawful grounds or explicit consent.",
        "suggested_fix": "Explicitly identify lawful processing grounds under Section 4 and Section 7 for each processing activity.",
        "confidence": 90
    },
    {
        "id": "data_minimisation",
        "status": "Partially Met",
        "cited_sections": ["Section 4", "Section 6"],
        "reason": "The policy collects device location and marketing data without stating that collection is strictly restricted to necessary data.",
        "suggested_fix": "Affirm that data collection is strictly limited to what is necessary for fulfilling specified order delivery purposes.",
        "confidence": 90
    },
    {
        "id": "data_retention_deletion",
        "status": "Missing",
        "cited_sections": ["Section 8(7)"],
        "reason": "The policy completely omits any data retention period or process for erasure when the purpose is fulfilled.",
        "suggested_fix": "State specific data retention periods and describe how personal data is securely erased or anonymized.",
        "confidence": 100
    },
    {
        "id": "security_safeguards",
        "status": "Partially Met",
        "cited_sections": ["Section 8(5)"],
        "reason": "The policy mentions encryption for payments and industry-standard security, but omits broader technical and organizational measures.",
        "suggested_fix": "Detail comprehensive technical and organizational safeguards implemented to prevent unauthorized access or breach.",
        "confidence": 90
    },
    {
        "id": "breach_notification",
        "status": "Missing",
        "cited_sections": ["Section 8(6)"],
        "reason": "The policy has no provision regarding intimation of personal data breaches to Data Principals or the Board.",
        "suggested_fix": "Add a breach notification procedure stating how and within what timeframe affected users and the Board will be notified.",
        "confidence": 100
    },
    {
        "id": "right_to_access",
        "status": "Missing",
        "cited_sections": ["Section 11"],
        "reason": "The policy does not describe how Data Principals can obtain a summary of processed personal data or third-party sharing details.",
        "suggested_fix": "Provide a procedure for Data Principals to request a summary of their personal data and identities of third parties.",
        "confidence": 100
    },
    {
        "id": "right_to_correction_erasure",
        "status": "Missing",
        "cited_sections": ["Section 12"],
        "reason": "The policy omits procedures for Data Principals to correct, update, or erase their personal data.",
        "suggested_fix": "Describe how Data Principals can submit requests for correction, updating, or erasure of personal data.",
        "confidence": 100
    },
    {
        "id": "grievance_redressal",
        "status": "Partially Met",
        "cited_sections": ["Section 13", "Section 8(10)"],
        "reason": "The policy provides a general support email under Contact Us but does not establish an official grievance redressal mechanism.",
        "suggested_fix": "Publish the contact details of a designated Grievance Officer and commit to resolving complaints within a specified timeframe.",
        "confidence": 95
    },
    {
        "id": "children_data_processing",
        "status": "Partially Met",
        "cited_sections": ["Section 9"],
        "reason": "The policy states services are not for children under 18, but does not state how age is verified or confirm no tracking is conducted.",
        "suggested_fix": "Describe verification procedures for minors and confirm that tracking or targeted advertising is not directed at children.",
        "confidence": 90
    },
    {
        "id": "third_party_data_sharing",
        "status": "Partially Met",
        "cited_sections": ["Section 8(2)"],
        "reason": "The policy lists delivery partners and payment processors but lacks details on binding contracts or data processor categories.",
        "suggested_fix": "Confirm that all data sharing with third-party processors is governed by valid contracts under Section 8(2).",
        "confidence": 85
    },
    {
        "id": "cross_border_transfer",
        "status": "Missing",
        "cited_sections": ["Section 16"],
        "reason": "The policy does not address whether personal data is transferred or processed outside India.",
        "suggested_fix": "State whether personal data is transferred outside India and the restrictions governing such transfers under Section 16.",
        "confidence": 100
    }
], indent=2)

# Wrap Mock Model B in markdown code fences to test fence stripping robustness
MOCK_MODEL_B_RAW = "```json\n" + MOCK_MODEL_A_RAW + "\n```"

def test_pipeline():
    print("=" * 72)
    print("  TESTING BATCHED PIPELINE (Prompt Generation + Parsing)")
    print("=" * 72)

    checklist = load_checklist()
    template = load_batched_prompt_template()
    print(f"[1] Loaded checklist: {len(checklist)} items")

    print("[2] Retrieving grounding clauses for all 15 items...")
    item_clauses_map = {}
    for item in checklist:
        clauses = retrieve_relevant_clauses(item["query"], top_k=4)
        item_clauses_map[item["id"]] = clauses
    print("    Grounding clauses retrieved successfully.")

    print("[3] Assembling combined batched prompt...")
    batched_prompt = build_batched_prompt(
        template,
        checklist,
        item_clauses_map,
        SAMPLE_POLICY,
    )
    prompt_len_chars = len(batched_prompt)
    prompt_len_words = len(batched_prompt.split())
    approx_tokens = int(prompt_len_words * 1.3)
    print(f"    Prompt Length: {prompt_len_chars:,} chars | {prompt_len_words:,} words | ~{approx_tokens:,} tokens")

    # Save the generated prompt to disk for review
    prompt_save_path = Path(__file__).parent / "preview_batched_prompt.txt"
    prompt_save_path.write_text(batched_prompt, encoding="utf-8")
    print(f"    Saved full batched prompt text to: {prompt_save_path}")

    print("\n[4] Testing JSON array extraction & response parsing...")
    results_a = _parse_batched_results(checklist, MOCK_MODEL_A_RAW)
    results_b = _parse_batched_results(checklist, MOCK_MODEL_B_RAW)
    print(f"    Model A parsed items: {len(results_a)}/15")
    print(f"    Model B parsed items: {len(results_b)}/15 (with code fences stripped)")

    assert len(results_a) == 15, f"Expected 15 items, got {len(results_a)}"
    assert len(results_b) == 15, f"Expected 15 items, got {len(results_b)}"

    score_a = _compute_score(results_a)
    score_b = _compute_score(results_b)
    matched = sum(1 for a, b in zip(results_a, results_b) if a.status == b.status)
    agreement_rate = round(matched / len(checklist), 4)

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

    response = ComplianceResponse(
        model_a=ModelResult(model_name="gemini-3.7-flash", score=score_a, results=results_a),
        model_b=ModelResult(model_name="gemini-3.5-flash", score=score_b, results=results_b),
        agreement_rate=agreement_rate,
        disagreements=disagreements,
    )

    print(f"\n[5] ComplianceResponse generated successfully!")
    print(f"    Model A Score : {response.model_a.score}%")
    print(f"    Model B Score : {response.model_b.score}%")
    print(f"    Agreement Rate: {response.agreement_rate * 100}%")
    print(f"    Disagreements : {len(response.disagreements)}")
    print("\n" + "=" * 72)
    print("  ALL TESTS PASSED SUCCESSFULLY (0 real API calls made)")
    print("=" * 72)

if __name__ == "__main__":
    test_pipeline()
