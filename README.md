# AI-Based Regulatory Compliance Checker for Startups

A web application that checks startup privacy policies against India's **Digital Personal Data Protection (DPDP) Act 2023** using Google Gemini LLMs and a RAG (Retrieval-Augmented Generation) pipeline.

Built as a college project for a Prompt Engineering course.

---

## Features

- **RAG-Grounded Analysis** — retrieves the most relevant DPDP Act clauses for each compliance check, so the LLM reasons from actual law text, not a static summary
- **Dual-Model Comparison** — `gemini-2.5-flash` (Model A) and `gemini-2.0-flash` (Model B) independently analyse the same policy; results shown side-by-side
- **Agreement Rate** — the app reports how often the two models agree and lists disagreements
- **Structured Report** — each requirement is rated Met / Partially Met / Missing with reasons and suggested fixes
- **Config-Driven** — compliance checklist and prompt template live in editable files, not hardcoded logic
- **100% Free** — uses only free-tier Gemini API and a local embedding model (no paid APIs, no vector DB)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.12, FastAPI |
| Embeddings | `all-MiniLM-L6-v2` via `sentence-transformers` (local, free) |
| Vector search | NumPy cosine similarity |
| LLM | Google Gemini API (free tier) |
| Frontend | React + Tailwind CSS |

---

## Project Structure

```
regulatory-compliance-checker/
├── backend/
│   ├── main.py                  # FastAPI entry point
│   ├── requirements.txt
│   ├── api/                     # Route handlers
│   ├── rag/                     # Chunking, embedding, retrieval
│   │   ├── chunker.py
│   │   ├── embedder.py
│   │   ├── index.py
│   │   ├── retriever.py
│   │   └── test_retrieval.py
│   ├── llm/                     # Gemini client + prompt builder
│   ├── config/                  # Checklist YAML + config loader
│   ├── schemas/                 # Pydantic models
│   └── data/
│       └── dpdp_act_full_text.txt   # Full DPDP Act 2023 text
├── frontend/                    # React app (Phase 3)
├── prompts/                     # Prompt templates
└── README.md
```

---

## Setup — Phase 1 (RAG Retrieval)

### Prerequisites
- Python 3.12+
- pip

### Install dependencies

```bash
cd backend
pip install -r requirements.txt
```

> **Note:** `sentence-transformers` will download the `all-MiniLM-L6-v2` model (~90 MB) on first run. This is cached locally and not committed to the repo.

### Test retrieval

```bash
# From the project root
python -m backend.rag.test_retrieval
```

This chunks the DPDP Act text, embeds all clauses, and runs 6 sample queries to verify retrieval quality. The embedding index is cached to disk after the first run for fast subsequent starts.

---

## Phase Roadmap

| Phase | Status | Description |
|---|---|---|
| Phase 1 | ✅ Done | RAG retrieval foundation (chunking, embedding, retrieval) |
| Phase 2 | 🔜 Next | FastAPI `/check` route + Gemini dual-model pipeline |
| Phase 3 | 🔜 Planned | React + Tailwind frontend |

---

## Embedding Cache

The files `backend/rag/embeddings_cache.npy`, `chunks_cache.json`, and `source_mtime.txt` are excluded from git (see `.gitignore`). They are auto-generated on first run. If you update `dpdp_act_full_text.txt`, delete these files to force a rebuild, or just run the test script — it detects the change automatically via file mtime.
