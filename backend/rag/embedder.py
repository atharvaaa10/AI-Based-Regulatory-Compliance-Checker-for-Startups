"""
embedder.py — Loads the local sentence-transformers model and exposes
a single embed() function used by index.py.

Model: all-MiniLM-L6-v2
  - 100% free, runs on CPU, ~90 MB one-time download
  - 384-dimensional output vectors
  - Well-cited in NLP literature (good for course report)
  - Cached automatically by sentence-transformers in ~/.cache/huggingface/

No API keys. No network calls after the first download.
"""

import numpy as np
from sentence_transformers import SentenceTransformer

# ---------------------------------------------------------------------------
# Model configuration
# ---------------------------------------------------------------------------

MODEL_NAME = "all-MiniLM-L6-v2"

# Module-level singleton — loaded once, reused for all embed() calls.
# This avoids re-loading the model on every retrieval request.
_model: SentenceTransformer | None = None


def get_model() -> SentenceTransformer:
    """
    Return the cached SentenceTransformer model, loading it on first call.

    The model is kept in memory for the lifetime of the process.
    Loading takes ~1-2 seconds on first call; subsequent calls are instant.
    """
    global _model
    if _model is None:
        print(f"[embedder] Loading model '{MODEL_NAME}' (first-time download may take ~30s)...")
        _model = SentenceTransformer(MODEL_NAME)
        print(f"[embedder] Model loaded. Embedding dimension: {_model.get_sentence_embedding_dimension()}")
    return _model


def embed(texts: list[str]) -> np.ndarray:
    """
    Embed a list of strings and return an (N, 384) float32 numpy array.

    Parameters
    ----------
    texts : list of strings to embed

    Returns
    -------
    np.ndarray of shape (len(texts), 384), dtype float32
    """
    if not texts:
        return np.empty((0, 384), dtype=np.float32)

    model = get_model()
    # show_progress_bar=False keeps output clean during retrieval
    vectors = model.encode(texts, show_progress_bar=False, convert_to_numpy=True)
    return vectors.astype(np.float32)
