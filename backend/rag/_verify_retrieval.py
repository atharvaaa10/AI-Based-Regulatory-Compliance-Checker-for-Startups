from backend.rag.retriever import retrieve_relevant_clauses

query = "right of data principal to access summary of personal data processed and sharing"
results = retrieve_relevant_clauses(query, top_k=5)

print(f"\nQuery: \"{query}\"\n")
print("Top-5 retrieved sections:")
for i, r in enumerate(results, 1):
    sid = r["section_id"]
    heading = r["heading"][:58]
    score = r["score"]
    marker = " <-- TARGET" if "Section 11" in sid else ""
    print(f"  Rank {i}: {sid:15s} score={score:.4f}  {heading}{marker}")

sec_ids = [r["section_id"] for r in results]
found = any("Section 11" in s for s in sec_ids)
print(f"\nSection 11 in top-5: {'YES - confirmed' if found else 'NO - needs fix'}")
