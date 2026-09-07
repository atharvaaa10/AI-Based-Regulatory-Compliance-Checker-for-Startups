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
    Return the fully-assembled prompt string ready to send to the Gemini API.

    Parameters
    ----------
    template     : raw prompt template string (from loader.load_prompt_template())
    requirement  : the checklist item requirement text
    clauses      : top-k retrieved DPDP Act chunks (from retrieve_relevant_clauses())
    policy_text  : the user's pasted startup privacy policy

    Returns
    -------
    Complete prompt string with all three placeholders substituted.
    """
    retrieved_block = format_retrieved_clauses(clauses)
    return (
        template
        .replace("{requirement}", requirement)
        .replace("{retrieved_clauses}", retrieved_block)
        .replace("{policy_text}", policy_text.strip())
    )
