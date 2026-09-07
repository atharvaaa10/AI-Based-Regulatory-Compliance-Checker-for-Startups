# AI-Based Regulatory Compliance Checker for Startups

An automated, RAG-grounded regulatory audit platform that evaluates startup privacy policies against India's **Digital Personal Data Protection (DPDP) Act, 2023** using dual-model comparative LLM analysis (**Gemini 3.7 Flash** vs **Gemini 3.5 Flash**).

Built as a college project for a Prompt Engineering course.

---

## 🚀 Key Features

- **RAG-Grounded Statutory Analysis** — Indexes and retrieves verbatim clauses from the official Gazette text of the DPDP Act 2023 (78 section-aware chunks embedded locally with `all-MiniLM-L6-v2`).
- **Dual-Model Comparative Audit** — Simultaneously dispatches policy text to **Gemini 3.7 Flash** (Model A, contextual legal reasoning) and **Gemini 3.5 Flash** (Model B, strict literal baseline) to detect borderline compliance risks.
- **Agreement Index & Disagreement Filtering** — Automatically computes an agreement score and highlights divergent requirements where legal interpretations differ.
- **Batched Single-Prompt Architecture** — Evaluates all 15 statutory requirements in **1 API call per model (2 calls total)**, reducing latency to ~32s and avoiding free-tier rate limits (20 requests/day).
- **Zero Hallucination Constraint** — Strict prompt instruction restricts models to only cite section numbers literally present in the retrieved statutory context.
- **High-Fidelity PDF / Print Export** — Pixel-perfect print view preserving the executive header, agreement banner, circular score gauges, and all 15 cards with citations and confidence scores.
- **100% Free & Open-Source** — Runs entirely on free-tier Gemini API access, local PyTorch embeddings, and open-source tooling ($0.00 operational cost).

---

## 📊 Empirical Evaluation Benchmarks

| Benchmark Policy | Profile | Model A (`gemini-3.7-flash`) | Model B (`gemini-3.5-flash`) | Agreement Rate | Disagreements Observed |
|---|---|:---:|:---:|:---:|:---:|
| **QuickCart Technologies** | Heavily Non-Compliant (Early-Stage Quick-Commerce) | **23.3%** | **23.3%** | **100.0%** (15/15) | **0 items** (Stark omissions) |
| **FinPulse Technologies** | Moderately Compliant (Mid-Stage Fintech) | **60.0%** | **46.7%** | **73.3%** (11/15) | **4 items** (Nuanced strictness) |

### Disagreement Items in FinPulse:
1. `notice_before_collection`: Model A (**Met**) vs Model B (**Partially Met** — penalized lack of Section 5(1)(c) Board complaint notice).
2. `lawful_basis`: Model A (**Met**) vs Model B (**Partially Met** — demanded mapping specific data fields to Section 7 legitimate uses).
3. `data_retention_deletion`: Model A (**Met**) vs Model B (**Partially Met** — flagged absence of early deletion trigger upon consent withdrawal).
4. `security_safeguards`: Model A (**Met**) vs Model B (**Partially Met** — demanded technical operational specifics for organizational safeguards).

---

## 🛠️ Technology Stack

| Component | Technology | Description |
|---|---|---|
| **Frontend** | React 19, Vite 8, Tailwind CSS v4, Lucide React | Glassmorphic dark UI, interactive filters, print engine |
| **Backend API** | Python 3.12, FastAPI, Uvicorn, Pydantic v2 | Async REST API with warmup lifespan & retry logic |
| **RAG Embeddings** | `sentence-transformers/all-MiniLM-L6-v2` | 384-dimensional dense semantic vectors (local CPU/GPU) |
| **Vector Search** | NumPy Cosine Similarity Matrix | In-memory similarity search with disk caching |
| **LLM Inference** | Google GenAI SDK (`gemini-3.7-flash`, `gemini-3.5-flash`) | Batched JSON evaluation (`max_output_tokens=8192`) |
| **Legal Corpus** | Official Gazette Text of DPDP Act 2023 | 78 section-aware statutory chunks |

---

## 📁 Repository Structure

```
├── backend/
│   ├── api/
│   │   └── compliance.py          # /api/check route, batched parser, scoring, and retry logic
│   ├── config/
│   │   ├── checklist.json         # 15 statutory requirements with search queries & hints
│   │   └── loader.py              # Configuration loaders
│   ├── data/
│   │   └── dpdp_act_full_text.txt # Full official DPDP Act 2023 text
│   ├── llm/
│   │   ├── gemini_client.py       # Google GenAI client config (gemini-3.7-flash vs 3.5-flash)
│   │   └── prompt_builder.py      # Combines policy, grounding clauses, and checklist into batched prompt
│   ├── rag/
│   │   ├── chunker.py             # Section-aware parser producing 78 statutory chunks
│   │   ├── embedder.py            # Local all-MiniLM-L6-v2 embedder (dim: 384)
│   │   ├── index.py               # Vector similarity index with disk caching (.npy + .json)
│   │   ├── retriever.py           # Cosine similarity retrieval (top-k clauses per query)
│   │   └── test_retrieval.py      # Standalone retrieval validation script
│   ├── schemas/
│   │   └── models.py              # Pydantic schemas (Request, Response, ItemResult, etc.)
│   ├── e2e_test.py                # Standalone E2E verification test for benchmarks
│   ├── main.py                    # FastAPI entrypoint, lifespan index warmup, and CORS
│   └── requirements.txt           # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/            # Navbar, InputForm, ProgressBar, ScoreGauge, RequirementCard, etc.
│   │   ├── constants/             # Sample policy benchmarks and cached empirical results
│   │   ├── services/api.js        # Frontend API client
│   │   ├── App.jsx                # Main application state machine
│   │   └── index.css              # Tailwind v4, glassmorphism tokens, and @media print CSS
│   ├── package.json
│   └── vite.config.js             # Vite config with @tailwindcss/vite and /api proxy
├── docs/
│   ├── project_report.md          # Comprehensive final project report & technical submission
│   └── phase2_evaluation_results.md# Empirical Phase 2 evaluation logs
├── prompts/
│   ├── prompt_template.txt        # Single-item prompt template (Phase 2 legacy)
│   └── prompt_template_batched.txt# Production batched prompt template (15 items / call)
└── README.md
```

---

## ⚡ Quickstart Guide

### 1. Prerequisites
- **Python 3.12+**
- **Node.js 18+** & `npm`
- **Google Gemini API Key** (Free tier from [Google AI Studio](https://aistudio.google.com/))

---

### 2. Backend Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/atharvaaa10/AI-Based-Regulatory-Compliance-Checker-for-Startups.git
   cd AI-Based-Regulatory-Compliance-Checker-for-Startups
   ```

2. **Install Python dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   cd ..
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the project root:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL_A=gemini-3.7-flash
   GEMINI_MODEL_B=gemini-3.5-flash
   ```

4. **Verify RAG Retrieval (Phase 1 Test):**
   ```bash
   python -m backend.rag.test_retrieval
   ```

5. **Start the FastAPI Backend Server:**
   ```bash
   python -m uvicorn backend.main:app --reload --port 8000
   ```
   - Health check: `http://localhost:8000/api/health` returns `{"status":"ok","version":"0.2.0"}`.

---

### 3. Frontend Setup

1. **Install Node dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the Vite Dev Server:**
   ```bash
   npm run dev
   ```

3. **Open the Application:**
   Navigate to [`http://localhost:5173`](http://localhost:5173) in your browser.

---

## 📋 15 Statutory Requirements Evaluated

| # | Requirement | Focus Sections |
|---|---|---|
| 01 | **Purpose Specification** | Section 4, Section 5, Section 6 |
| 02 | **Consent Mechanism** | Section 6(1), Section 6(10) |
| 03 | **Notice Before Collection** | Section 5, Section 13 |
| 04 | **Consent Withdrawal** | Section 6(4), Section 6(5), Section 6(6) |
| 05 | **Lawful Basis** | Section 4, Section 7 |
| 06 | **Data Minimisation** | Section 6(1), Section 4, Section 8(7) |
| 07 | **Retention & Erasure** | Section 8(7), Section 12 |
| 08 | **Security Safeguards** | Section 8(5) |
| 09 | **Breach Notification** | Section 8(6) |
| 10 | **Right to Access** | Section 11 |
| 11 | **Right to Correction & Erasure** | Section 12 |
| 12 | **Grievance Redressal** | Section 13, Section 8(10) |
| 13 | **Children's Data Restrictions** | Section 9 |
| 14 | **Third-Party Data Sharing** | Section 8(2), Section 11 |
| 15 | **Cross-Border Transfers** | Section 16, Section 3 |

---

## 📖 Detailed Documentation

- **[docs/project_report.md](docs/project_report.md):** Complete project report with architecture diagrams, RAG cosine similarity formulas, prompt engineering evolution, and limitation analysis.
- **[docs/phase2_evaluation_results.md](docs/phase2_evaluation_results.md):** Raw empirical logs and qualitative analysis for both QuickCart and FinPulse benchmarks.

---

## 📄 License & Attribution

This project is developed for educational and academic purposes under the Apache 2.0 / MIT license.  
Statutory text derived from the official Gazette of India publication of the **Digital Personal Data Protection Act, 2023 (Act No. 22 of 2023)**.
