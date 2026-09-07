"""
main.py — FastAPI application entry point.

Start the server with:
    uvicorn backend.main:app --reload --port 8000

The RAG index is built (or loaded from cache) once at startup via the
lifespan event handler, so the first request is not slow.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.compliance import router as compliance_router
from backend.rag.index import get_index

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Lifespan: warm up the RAG index at startup
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Build or load the DPDP Act embedding index before the server starts
    accepting requests. This ensures the first /check call is not slow.
    """
    logger.info("Warming up RAG index...")
    get_index()
    logger.info("RAG index ready. Server accepting requests.")
    yield
    # (cleanup on shutdown, if needed in future)


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(
    title="AI Regulatory Compliance Checker",
    description=(
        "Checks startup privacy policies against India's DPDP Act 2023 "
        "using RAG-grounded dual-Gemini-model analysis."
    ),
    version="0.2.0",
    lifespan=lifespan,
)

# Allow requests from the React frontend dev server (localhost:5173)
# and any other local origin during development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

app.include_router(compliance_router, prefix="/api", tags=["Compliance"])


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@app.get("/health", tags=["Health"])
@app.get("/api/health", tags=["Health"])
def health():
    return {"status": "ok", "version": app.version}
