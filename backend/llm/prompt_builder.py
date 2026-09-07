"""
prompt_builder.py — Assembles the final grounded prompt for one checklist item.

Responsibilities:
    1. Format the retrieved DPDP Act chunks into a numbered, readable block.
    2. Substitute the three placeholders in the template:
           {requirement}        — checklist item requirement text
           {retrieved_clauses}  — formatted retrieved clauses
           {policy_text}        — the startup's privacy policy text

This module has no side effects and no I/O — purely string transformation,
which makes it easy to unit-test and reason about independently.
"""


def format_retrieved_clauses(clauses: list[dict]) -> str:
    """
    Format a list of retrieved chunk dicts into a numbered block for the prompt.

    Each entry shows the section identifier, heading, and full clause text.
    The "[N]" prefix allows the citation-restriction rule in the prompt to work:
    the model is told to only cite identifiers that appear in these "[N] Section X"
    labels.

    Parameters
    ----------
    clauses : list of dicts with keys section_id, heading, text, score

    Returns
    -------
    A formatted multi-line string, ready for insertion into the prompt template.
    """
    parts = []
    for i, chunk in enumerate(clauses, start=1):
        entry = (
            f"[{i}] {chunk['section_id']} — {chunk['heading']}\n"
            f"{chunk['text']}"
        )
        parts.append(entry)
    return "\n\n".join(parts)


def build_prompt(
    template: str,
    requirement: str,
    clauses: list[dict],
    policy_text: str,
) -> str:
    """
    Return the single-item prompt string ready to send to the Gemini API.
    """
    retrieved_block = format_retrieved_clauses(clauses)
    return (
        template
        .replace("{requirement}", requirement)
        .replace("{retrieved_clauses}", retrieved_block)
        .replace("{policy_text}", policy_text.strip())
    )


def format_item_block(idx: int, total: int, item: dict, clauses: list[dict]) -> str:
    """
    Format a single checklist item with its requirement statement and
    grounding DPDP Act clauses into a structured markdown block.
    """
    clauses_text = format_retrieved_clauses(clauses)
    return (
        f"### REQUIREMENT [{idx:02d}/{total:02d}]: {item['id']}\n"
        f"**Requirement Statement:** {item['requirement']}\n\n"
        f"**Grounding DPDP Act Clauses (use ONLY these as legal reference):**\n"
        f"{clauses_text}"
    )


def build_batched_prompt(
    template: str,
    checklist: list[dict],
    item_clauses_map: dict[str, list[dict]],
    policy_text: str,
) -> str:
    """
    Assemble the comprehensive batched prompt containing all 15 checklist requirements,
    their respective retrieved DPDP Act clauses, and the startup's policy text.

    Parameters
    ----------
    template         : batched prompt template string (from loader.load_batched_prompt_template())
    checklist        : list of 15 checklist item dicts (from loader.load_checklist())
    item_clauses_map : dict mapping item_id -> list of retrieved clause dicts
    policy_text      : user's input privacy policy text

    Returns
    -------
    Complete batched prompt string ready for a single LLM call.
    """
    total = len(checklist)
    item_blocks = []
    for idx, item in enumerate(checklist, start=1):
        clauses = item_clauses_map.get(item["id"], [])
        item_blocks.append(format_item_block(idx, total, item, clauses))

    separator = "\n\n" + ("=" * 72) + "\n\n"
    requirements_block = separator.join(item_blocks)

    return (
        template
        .replace("{policy_text}", policy_text.strip())
        .replace("{batched_requirements_block}", requirements_block)
    )
