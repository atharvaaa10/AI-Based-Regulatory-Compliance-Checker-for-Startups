"""
gemini_client.py — Thin wrapper around the Google Gemini SDK (google-genai).

Two models are used:
    MODEL_A — gemini-3.7-flash  (primary analysis model)
    MODEL_B — gemini-3.5-flash  (comparison model)

Both are free-tier; no billing required.

Uses the current google-genai package (google.genai), which replaced the
deprecated google.generativeai package.

Free-tier rate limit: 5 requests per minute per model.
The compliance pipeline adds a 13-second inter-item delay to stay within limits.
"""

import os
from pathlib import Path

from google import genai
from google.genai import types
from dotenv import load_dotenv

# Load .env from the project root (two levels above: llm/ -> backend/ -> root)
load_dotenv(dotenv_path=Path(__file__).parents[2] / ".env")

# ---------------------------------------------------------------------------
# Model identifiers
# ---------------------------------------------------------------------------

MODEL_A_NAME = os.environ.get("GEMINI_MODEL_A", "gemini-3.7-flash")
MODEL_B_NAME = os.environ.get("GEMINI_MODEL_B", "gemini-3.5-flash")

# ---------------------------------------------------------------------------
# SDK client (stateless — one client, two model names)
# ---------------------------------------------------------------------------

_api_key = os.environ.get("GEMINI_API_KEY")
if not _api_key:
    raise EnvironmentError(
        "GEMINI_API_KEY is not set. "
        "Create a .env file in the project root with: GEMINI_API_KEY=your_key_here"
    )

_client = genai.Client(api_key=_api_key)

# Shared generation config:
#   temperature=0.1          → near-deterministic, consistent JSON output
#   max_output_tokens=2048   → generous budget (1024 caused truncation on long reason fields)
#   response_mime_type       → forces raw JSON output only — no chain-of-thought,
#                              no markdown fences, no reasoning text before the JSON.
#                              Critical for gemini-3.5-flash which does visible thinking.
_gen_config = types.GenerateContentConfig(
    temperature=0.1,
    max_output_tokens=2048,
    response_mime_type="application/json",
)


# ---------------------------------------------------------------------------
# Public call functions
# ---------------------------------------------------------------------------

def call_model_a(prompt: str) -> str:
    """
    Send a prompt to gemini-3.7-flash (Model A) and return the raw text response.
    Raises google.genai errors on network/quota failures (caught in compliance.py).
    """
    response = _client.models.generate_content(
        model=MODEL_A_NAME,
        contents=prompt,
        config=_gen_config,
    )
    return response.text


def call_model_b(prompt: str) -> str:
    """
    Send a prompt to gemini-3.5-flash (Model B) and return the raw text response.
    Raises google.genai errors on network/quota failures (caught in compliance.py).
    """
    response = _client.models.generate_content(
        model=MODEL_B_NAME,
        contents=prompt,
        config=_gen_config,
    )
    return response.text
