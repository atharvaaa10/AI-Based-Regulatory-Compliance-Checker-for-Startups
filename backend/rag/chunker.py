"""
chunker.py — Splits the DPDP Act full text into meaningful chunks.

Strategy:
  - Primary split: top-level "Section N" headings (e.g., "Section 4", "Section 8").
  - Secondary split: numbered sub-clauses "(1)", "(2)" inside very long sections,
    so that no single chunk is too large for the embedding model.
  - Each chunk is labelled with a human-readable section_id, e.g. "Section 8(1)".

The chunker is purely text-processing — no ML, no network calls.
"""

import re
from pathlib import Path
from typing import Optional

# ---------------------------------------------------------------------------
# Tunable constants
# ---------------------------------------------------------------------------

# Maximum number of words in a single chunk before we attempt sub-clause splitting.
# ~800 words ≈ ~1000 tokens — safely under MiniLM's 256-token window (it truncates
# at 256 tokens but averaging longer texts still works reasonably well).
MAX_WORDS_PER_CHUNK = 400

# Regex that matches a top-level Section heading line.
# Handles both formats found in DPDP Act text:
#   Old placeholder: "Section 4 Grounds for processing..."
#   Real Gazette:    "Section 4. Grounds for processing..."
# The optional \.? consumes the period after the number so section_id is
# always clean (e.g. "Section 4") and the title has no leading period.
SECTION_PATTERN = re.compile(
    r"^(Section\s+\d+)\.?\s*(.*)$",
    re.MULTILINE,
)

# Regex that matches a numbered sub-clause at the start of a line.
# Matches lines like: "(1) A Data Fiduciary…", "(2) The Board shall…"
SUB_CLAUSE_PATTERN = re.compile(
    r"(?m)(?=^\(\d+\)\s)",   # zero-width lookahead so we split before the "(N)"
)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def load_and_chunk(
    filepath: str | Path,
    max_words: int = MAX_WORDS_PER_CHUNK,
) -> list[dict]:
    """
    Read the DPDP Act text file and return a list of chunk dicts.

    Each dict has:
        section_id : str   — e.g. "Section 8" or "Section 8(1)"
        text       : str   — the clause body, stripped of excess whitespace
        word_count : int   — rough size indicator (useful for debugging)

    Parameters
    ----------
    filepath : path to dpdp_act_full_text.txt
    max_words : chunks longer than this are split further on sub-clause boundaries
    """
    raw_text = Path(filepath).read_text(encoding="utf-8")
    return _chunk_text(raw_text, max_words)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _chunk_text(text: str, max_words: int) -> list[dict]:
    """Core chunking logic — split by Section headings, then sub-clauses."""
    chunks: list[dict] = []

    # Find all Section heading positions
    matches = list(SECTION_PATTERN.finditer(text))

    if not matches:
        # Fallback: treat entire document as one chunk (shouldn't happen with DPDP text)
        return [_make_chunk("Full Document", text)]

    for i, match in enumerate(matches):
        section_label = match.group(1).strip()   # e.g. "Section 4"
        section_title = match.group(2).strip()   # e.g. "Short title, extent..."

        # Body text = everything between this heading and the next heading (or EOF)
        body_start = match.end()
        body_end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        body = text[body_start:body_end].strip()

        # Combine label + title into a readable header
        full_label = f"{section_label} — {section_title}" if section_title else section_label

        # If the section body is short enough, keep it as one chunk
        if _word_count(body) <= max_words:
            chunks.append(_make_chunk(section_label, body, heading=full_label))
            continue

        # Otherwise split on numbered sub-clauses: (1), (2), (3) …
        sub_chunks = _split_on_sub_clauses(section_label, body, full_label)
        chunks.extend(sub_chunks)

    return chunks


def _split_on_sub_clauses(
    section_label: str,
    body: str,
    heading: str,
) -> list[dict]:
    """
    Split section body on "(N)" sub-clause boundaries and return one chunk
    per sub-clause, labelled as e.g. "Section 8(1)".
    """
    parts = SUB_CLAUSE_PATTERN.split(body)
    # First part is any introductory text before the first "(1)"
    result: list[dict] = []

    for part in parts:
        part = part.strip()
        if not part:
            continue

        # Try to extract the sub-clause number from the start of the part
        sub_match = re.match(r"^\((\d+)\)", part)
        if sub_match:
            sub_num = sub_match.group(1)
            chunk_id = f"{section_label}({sub_num})"
        else:
            # Introductory paragraph — label it without a sub-clause number
            chunk_id = section_label

        result.append(_make_chunk(chunk_id, part, heading=heading))

    # If splitting produced nothing useful, return the original body as one chunk
    if not result:
        result = [_make_chunk(section_label, body, heading=heading)]

    return result


def _make_chunk(
    section_id: str,
    text: str,
    heading: Optional[str] = None,
) -> dict:
    """Construct a single chunk dict."""
    clean_text = _normalise_whitespace(text)
    return {
        "section_id": section_id,
        "heading": heading or section_id,
        "text": clean_text,
        "word_count": _word_count(clean_text),
    }


def _normalise_whitespace(text: str) -> str:
    """Collapse multiple blank lines; preserve single line breaks for readability."""
    # Collapse 3+ consecutive newlines down to 2
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _word_count(text: str) -> int:
    return len(text.split())
