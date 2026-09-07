"""
gemini_client.py — Thin wrapper around the Google Gemini generative AI SDK.

Two model singletons are initialised at module load time:
    MODEL_A — gemini-3.7-flash  (newer, used as the primary analysis model)
    MODEL_B — gemini-3.5-flash  (used as the comparison model)

Both are free-tier; no billing required.

The client reads GEMINI_API_KEY from the environment (loaded via python-dotenv
in main.py). If the key is missing, a clear error is raised at startup rather
than at the first API call.
"""

import os

import google.generativeai as genai
from dotenv import load_dotenv

# Load .env from the project root (two levels above this file: llm/ -> backend/ -> root)
from pathlib import Path
load_dotenv(dotenv_path=Path(__file__).parents[2] / ".env")

# ---------------------------------------------------------------------------
# Model identifiers
# ---------------------------------------------------------------------------

MODEL_A_NAME = "gemini-3.7-flash"
MODEL_B_NAME = "gemini-3.5-flash"

# ---------------------------------------------------------------------------
# SDK configuration and model singletons
# ---------------------------------------------------------------------------

_api_key = os.environ.get("GEMINI_API_KEY")
if not _api_key:
    raise EnvironmentError(
        "GEMINI_API_KEY is not set. "
        "Create a .env file in the project root with: GEMINI_API_KEY=your_key_here"
    )

genai.configure(api_key=_api_key)

# Generation config — low temperature for deterministic compliance judgements
_generation_config = genai.GenerationConfig(
    temperature=0.1,        # near-deterministic; high temp causes inconsistent JSON
    max_output_tokens=512,  # each response is a small JSON object
)

_model_a = genai.GenerativeModel(
    model_name=MODEL_A_NAME,
    generation_config=_generation_config,
)
_model_b = genai.GenerativeModel(
    model_name=MODEL_B_NAME,
    generation_config=_generation_config,
)


# ---------------------------------------------------------------------------
# Public call functions
# ---------------------------------------------------------------------------

def call_model_a(prompt: str) -> str:
    """
    Send a prompt to gemini-3.7-flash (Model A) and return the raw text response.

    Raises google.api_core.exceptions.GoogleAPIError on network/quota failures.
    """
    response = _model_a.generate_content(prompt)
    return response.text


def call_model_b(prompt: str) -> str:
    """
    Send a prompt to gemini-3.5-flash (Model B) and return the raw text response.

    Raises google.api_core.exceptions.GoogleAPIError on network/quota failures.
    """
    response = _model_b.generate_content(prompt)
    return response.text
