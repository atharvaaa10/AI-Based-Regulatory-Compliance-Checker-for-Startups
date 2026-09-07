"""
test_retrieval.py — Standalone test script for the RAG retrieval pipeline.

Run from the project root:
    python -m backend.rag.test_retrieval

This script:
  1. Builds (or loads from cache) the chunk index.
  2. Runs several sample queries covering different DPDP Act topics.
  3. Pretty-prints the top-3 retrieved chunks for each query.

Use this to verify retrieval quality before wiring the retriever into
the FastAPI app or LLM prompt pipeline.
"""

import textwrap
from backend.rag.retriever import retrieve_relevant_clauses

# ---------------------------------------------------------------------------
# Sample queries — covering the main compliance areas in the DPDP Act
# ---------------------------------------------------------------------------

TEST_QUERIES = [
    "data deletion and retention requirements",
    "consent from data principal before processing",
    "penalties for personal data breach",
    "rights of data principal to access and correct data",
    "processing personal data of children",
    "cross-border transfer of personal data outside India",
]


# ---------------------------------------------------------------------------
# Display helpers
# ---------------------------------------------------------------------------

SEPARATOR = "=" * 72
INNER_SEP = "-" * 72


def print_results(query: str, results: list[dict]) -> None:
    print(SEPARATOR)
    print(f"  QUERY: \"{query}\"")
    print(SEPARATOR)

    if not results:
        print("  (no results returned)\n")
        return

    for rank, r in enumerate(results, start=1):
        print(f"\n  Rank #{rank}  |  {r['section_id']}  |  score: {r['score']:.4f}")
        print(f"  Heading: {r['heading']}")
        print(INNER_SEP)
        # Wrap long text for readability in terminal
        wrapped = textwrap.fill(r["text"], width=68, initial_indent="  ", subsequent_indent="  ")
        # Show first 400 chars to keep output readable
        if len(wrapped) > 400:
            print(wrapped[:400])
            print("  ... [truncated for display]")
        else:
            print(wrapped)

    print()


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    print("\n" + SEPARATOR)
    print("  DPDP Act RAG Retrieval - Phase 1 Test")
    print(SEPARATOR)
    print("  Building/loading index (this may take ~30s on first run)...\n")

    # Warm up the index (triggers build + caching if not already done)
    from backend.rag.index import get_index
    index = get_index()
    print(f"\n  Index ready. Total chunks: {len(index.chunks)}\n")

    # Print all chunk section IDs so you can see what was chunked
    print("  Chunks in index:")
    for i, chunk in enumerate(index.chunks):
        print(f"    [{i:02d}] {chunk['section_id']:20s}  ({chunk['word_count']} words)")
    print()

    # Run each test query
    for query in TEST_QUERIES:
        results = retrieve_relevant_clauses(query, top_k=3)
        print_results(query, results)

    print(SEPARATOR)
    print("  Test complete. Check scores above to verify retrieval quality.")
    print("  Expected: scores above 0.4 indicate good semantic match.")
    print(SEPARATOR + "\n")


if __name__ == "__main__":
    main()
