"""
loader.py — Loads config-driven files (checklist + prompt template) from disk.

Both files are read fresh on every call, so you can edit them without
restarting the server. Caching is intentionally omitted for simplicity —
the files are tiny and disk I/O is negligible compared to LLM call latency.
"""

import json
from pathlib import Path

# ---------------------------------------------------------------------------
# Paths (resolved relative to this file so they work from any working dir)
# ---------------------------------------------------------------------------

_CONFIG_DIR  = Path(__file__).parent
_PROJECT_DIR = _CONFIG_DIR.parents[1]   # project root (two levels up from config/)

CHECKLIST_PATH      = _CONFIG_DIR  / "checklist.json"
PROMPT_TEMPLATE_PATH = _PROJECT_DIR / "prompts" / "prompt_template.txt"


# ---------------------------------------------------------------------------
# Public loaders
# ---------------------------------------------------------------------------

def load_checklist() -> list[dict]:
    """
    Return the list of DPDP compliance checklist items.

    Each item is a dict with keys:
        id            : str — unique identifier (e.g. "consent_mechanism")
        requirement   : str — human-readable requirement description
        query         : str — retrieval query used to fetch relevant Act clauses
        sections_hint : list[str] — indicative Act sections (not used at runtime)
    """
    raw = CHECKLIST_PATH.read_text(encoding="utf-8")
    return json.loads(raw)


def load_prompt_template() -> str:
    """
    Return the raw prompt template string with three placeholders:
        {requirement}       — the checklist item requirement text
        {retrieved_clauses} — formatted retrieved DPDP Act clauses
        {policy_text}       — the startup's pasted privacy policy
    """
    return PROMPT_TEMPLATE_PATH.read_text(encoding="utf-8")
