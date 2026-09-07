"""
retriever.py — The single public retrieval function used by the rest of the app.

Usage
-----
    from backend.rag.retriever import retrieve_relevant_clauses

    results = retrieve_relevant_clauses("data deletion and retention requirements", top_k=3)
    for r in results:
        print(r["section_id"], r["score"])
        print(r["text"])

How it works
------------
1. Embed the query with the same model used to embed the chunks.
2. L2-normalise the query vector (matches how chunk vectors are stored).
3. Compute dot-product similarity between the query and every chunk vector.
   Because both are L2-normalised, dot product == cosine similarity.
4. Return the top-k chunks sorted by descending similarity score.

Complexity: O(N) where N = number of chunks (~50-100 for DPDP Act).
No FAISS, no approximate search — exact brute-force is fast enough at this scale.
"""

import numpy as np

from backend.rag.embedder import embed
from backend.rag.index import get_index


def retrieve_relevant_clauses(
    query: str,
    top_k: int = 5,
) -> list[dict]:
    """
    Return the top-k most relevant DPDP Act chunks for a given query.

    Parameters
    ----------
    query  : natural-language compliance query, e.g.
             "data deletion and retention requirements"
    top_k  : number of chunks to return (default 3)

    Returns
    -------
    List of dicts, each containing:
        section_id : str   — e.g. "Section 8(1)"
        heading    : str   — full section heading with title
        text       : str   — the clause body text
        score      : float — cosine similarity score in [0, 1]

    Results are sorted by score descending (most relevant first).
    """
    if not query.strip():
        return []

    index = get_index()

    # --- Embed and normalise the query ---
    query_vec = embed([query])            # shape: (1, 384)
    norm = np.linalg.norm(query_vec)
    if norm > 0:
        query_vec = query_vec / norm      # L2-normalise to match chunk vectors

    # --- Cosine similarity via dot product ---
    # index.embeddings shape: (N, 384), already L2-normalised
    scores = index.embeddings @ query_vec.T   # shape: (N, 1)
    scores = scores.flatten()                 # shape: (N,)

    # --- Select top-k indices ---
    # np.argpartition is O(N) — faster than full sort for large N,
    # but since N ≈ 100 here, np.argsort is equally fast and simpler.
    top_k = min(top_k, len(scores))
    top_indices = np.argsort(scores)[::-1][:top_k]

    # --- Build result list ---
    results = []
    for idx in top_indices:
        chunk = index.chunks[idx]
        results.append({
            "section_id": chunk["section_id"],
            "heading":    chunk["heading"],
            "text":       chunk["text"],
            "score":      float(round(scores[idx], 4)),
        })

    return results
