"""
index.py — Builds, caches, and loads the chunk embedding index.

Design
------
We store two files on disk next to the source text:
  1. chunks_cache.json  — the list of chunk dicts (section_id, heading, text, word_count)
  2. embeddings_cache.npy — the (N, 384) float32 embedding matrix for those chunks

On startup, index.py checks whether the cache is fresh (source file mtime has not
changed). If fresh, it loads from disk. If stale (or missing), it re-chunks the
source file and re-embeds all chunks, then saves both cache files.

Why numpy instead of FAISS?
  The DPDP Act has ~50-100 chunks. A brute-force numpy dot-product search over
  100 vectors takes microseconds. FAISS adds value only at millions of vectors —
  using it here would be over-engineering. (FAISS is listed in requirements.txt
  as an optional dependency for reference only.)
"""

import json
import time
from dataclasses import dataclass
from pathlib import Path

import numpy as np

from backend.rag.chunker import load_and_chunk
from backend.rag.embedder import embed

# ---------------------------------------------------------------------------
# Paths (relative to this file's parent directory)
# ---------------------------------------------------------------------------

_RAG_DIR = Path(__file__).parent
_DATA_DIR = _RAG_DIR.parent / "data"

DPDP_TEXT_PATH = _DATA_DIR / "dpdp_act_full_text.txt"
CHUNKS_CACHE_PATH = _RAG_DIR / "chunks_cache.json"
EMBEDDINGS_CACHE_PATH = _RAG_DIR / "embeddings_cache.npy"
MTIME_CACHE_PATH = _RAG_DIR / "source_mtime.txt"


# ---------------------------------------------------------------------------
# Data container
# ---------------------------------------------------------------------------

@dataclass
class ChunkIndex:
    """
    Holds all chunks and their embedding matrix in memory.

    Attributes
    ----------
    chunks     : list of chunk dicts from chunker.load_and_chunk()
    embeddings : np.ndarray of shape (N, 384), float32, L2-normalised
    """
    chunks: list[dict]
    embeddings: np.ndarray


# Module-level singleton — built once, reused across all retrieval calls.
_index: ChunkIndex | None = None


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def get_index() -> ChunkIndex:
    """
    Return the in-memory ChunkIndex, building and caching it if necessary.

    Call this once at application startup (or lazily on first retrieval).
    Subsequent calls return the cached object instantly.
    """
    global _index
    if _index is None:
        _index = _load_or_build_index()
    return _index


def rebuild_index() -> ChunkIndex:
    """
    Force a full rebuild of the index (ignoring any existing cache).
    Useful if you replace dpdp_act_full_text.txt and want to refresh without
    restarting the process.
    """
    global _index
    _index = _build_index()
    return _index


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _load_or_build_index() -> ChunkIndex:
    """Return a cached index if the source file hasn't changed; else rebuild."""
    if _cache_is_fresh():
        print("[index] Cache is up to date — loading from disk.")
        return _load_index_from_cache()

    print("[index] Cache is missing or stale — rebuilding index...")
    return _build_index()


def _cache_is_fresh() -> bool:
    """
    Check whether the on-disk cache was built from the current version of
    dpdp_act_full_text.txt by comparing modification timestamps.
    """
    if not (CHUNKS_CACHE_PATH.exists() and
            EMBEDDINGS_CACHE_PATH.exists() and
            MTIME_CACHE_PATH.exists()):
        return False

    cached_mtime = float(MTIME_CACHE_PATH.read_text().strip())
    current_mtime = DPDP_TEXT_PATH.stat().st_mtime
    return abs(cached_mtime - current_mtime) < 1.0   # 1-second tolerance


def _load_index_from_cache() -> ChunkIndex:
    """Deserialise chunks and embeddings from the cache files."""
    chunks = json.loads(CHUNKS_CACHE_PATH.read_text(encoding="utf-8"))
    embeddings = np.load(str(EMBEDDINGS_CACHE_PATH))
    print(f"[index] Loaded {len(chunks)} chunks from cache.")
    return ChunkIndex(chunks=chunks, embeddings=embeddings)


def _build_index() -> ChunkIndex:
    """
    Full rebuild pipeline:
      1. Chunk the source text
      2. Embed all chunks
      3. L2-normalise the embedding matrix (makes cosine sim == dot product)
      4. Save everything to disk
    """
    t0 = time.perf_counter()

    # Step 1: Chunk
    chunks = load_and_chunk(DPDP_TEXT_PATH)
    print(f"[index] Chunked into {len(chunks)} sections.")

    # Step 2: Embed
    texts = [c["text"] for c in chunks]
    print(f"[index] Embedding {len(texts)} chunks...")
    raw_embeddings = embed(texts)   # shape: (N, 384)

    # Step 3: L2-normalise so that dot product == cosine similarity
    norms = np.linalg.norm(raw_embeddings, axis=1, keepdims=True)
    norms = np.where(norms == 0, 1.0, norms)   # avoid divide-by-zero
    normalised = raw_embeddings / norms

    # Step 4: Save to disk
    _save_cache(chunks, normalised)

    elapsed = time.perf_counter() - t0
    print(f"[index] Index built and cached in {elapsed:.1f}s.")
    return ChunkIndex(chunks=chunks, embeddings=normalised)


def _save_cache(chunks: list[dict], embeddings: np.ndarray) -> None:
    """Write chunks JSON, embeddings .npy, and source mtime to disk."""
    CHUNKS_CACHE_PATH.write_text(
        json.dumps(chunks, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    np.save(str(EMBEDDINGS_CACHE_PATH), embeddings)
    MTIME_CACHE_PATH.write_text(str(DPDP_TEXT_PATH.stat().st_mtime))
    print(f"[index] Cache saved -> {CHUNKS_CACHE_PATH.parent}")
