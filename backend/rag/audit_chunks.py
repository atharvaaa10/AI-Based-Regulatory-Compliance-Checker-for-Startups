from backend.rag.chunker import load_and_chunk
chunks = load_and_chunk('backend/data/dpdp_act_full_text.txt')
print(f'Total chunks: {len(chunks)}')
print()

# Check which section numbers are present
import re
section_nums = []
for c in chunks:
    m = re.search(r'\d+', c['section_id'])
    if m:
        section_nums.append(int(m.group()))

detected = sorted(set(section_nums))
all_expected = list(range(1, 45))
missing = [n for n in all_expected if n not in detected]

for c in chunks:
    flag = ' *** LONG' if c['word_count'] > 350 else ''
    print(f"  {c['section_id']:15s} | {c['word_count']:4d} words | {c['heading'][:55]}{flag}")

print()
print(f"Detected section numbers: {detected}")
if missing:
    print(f"MISSING sections: {missing}")
else:
    print("All 44 sections (1-44) detected successfully.")
