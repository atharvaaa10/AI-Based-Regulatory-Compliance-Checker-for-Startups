"""
preview_prompt.py — Shows exactly what the filled-in prompt looks like for
each checklist item, using real retrieved DPDP Act clauses.

NO API calls are made. This is purely for prompt quality review before
wiring into the Gemini pipeline.

Run from project root:
    python -m backend.rag.preview_prompt
"""

import json
from pathlib import Path

from backend.rag.retriever import retrieve_relevant_clauses

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
CHECKLIST_PATH = Path("backend/config/checklist.json")
TEMPLATE_PATH  = Path("prompts/prompt_template.txt")

# ---------------------------------------------------------------------------
# A realistic sample policy for demo purposes
# ---------------------------------------------------------------------------
SAMPLE_POLICY = """
Privacy Policy — TechStart India Pvt. Ltd.

Last updated: August 2024

1. Introduction
TechStart India ("we", "us") provides a SaaS platform for small businesses.
This policy describes how we handle personal information.

2. Data We Collect
We collect your name, email address, phone number, and billing information
when you sign up for our service. We also collect usage data and cookies.

3. How We Use Your Data
Your data is used to provide and improve our services, send transactional
emails, and for customer support purposes.

4. Data Sharing
We share data with payment processors and cloud hosting providers who help
us deliver our services. We do not sell your personal data.

5. Data Security
We implement industry-standard security measures including encryption at
rest and in transit.

6. Contact Us
For any questions about this policy, contact privacy@techstart.in.
"""

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def format_retrieved_clauses(clauses: list[dict]) -> str:
    """Format retrieved chunks into a readable block for the prompt."""
    parts = []
    for i, c in enumerate(clauses, start=1):
        parts.append(
            f"[{i}] {c['section_id']} — {c['heading']}\n"
            f"{c['text']}\n"
            f"(Similarity score: {c['score']:.4f})"
        )
    return "\n\n".join(parts)


def build_prompt(template: str, requirement: str, clauses: list[dict], policy: str) -> str:
    retrieved_block = format_retrieved_clauses(clauses)
    return (
        template
        .replace("{requirement}", requirement)
        .replace("{retrieved_clauses}", retrieved_block)
        .replace("{policy_text}", policy.strip())
    )


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

SEP = "=" * 72

def main():
    checklist = json.loads(CHECKLIST_PATH.read_text(encoding="utf-8"))
    template  = TEMPLATE_PATH.read_text(encoding="utf-8")

    print(f"\n{SEP}")
    print("  PROMPT PREVIEW - DPDP Compliance Checker")
    print(f"  {len(checklist)} checklist items loaded")
    print(SEP)

    # Show summary table of all checklist items first
    print("\n  FULL CHECKLIST (15 items):\n")
    for i, item in enumerate(checklist, 1):
        hints = ", ".join(item["sections_hint"])
        print(f"  {i:02d}. [{item['id']}]")
        print(f"      Requirement : {item['requirement']}")
        print(f"      Query       : {item['query']}")
        print(f"      Act sections: {hints}")
        print()

    print(SEP)
    print("  EXAMPLE FILLED-IN PROMPT")
    print("  (Item #7: data_retention_deletion — showing full prompt + top-5 retrieved clauses)")
    print(SEP + "\n")

    # Pick item #7 (data_retention_deletion) as the example
    example = next(i for i in checklist if i["id"] == "data_retention_deletion")
    clauses = retrieve_relevant_clauses(example["query"], top_k=5)

    print(f"  Query used for retrieval:\n  \"{example['query']}\"\n")
    print(f"  Top-5 retrieved sections:")
    for c in clauses:
        print(f"    {c['section_id']:15s} | score: {c['score']:.4f} | {c['heading'][:55]}")
    print()

    full_prompt = build_prompt(template, example["requirement"], clauses, SAMPLE_POLICY)

    print("-" * 72)
    print("  COMPLETE PROMPT SENT TO GEMINI (verbatim):")
    print("-" * 72 + "\n")
    print(full_prompt)
    print("\n" + SEP)
    print("  Review complete. If prompt quality looks good, approve Phase 2 build.")
    print(SEP + "\n")


if __name__ == "__main__":
    main()
