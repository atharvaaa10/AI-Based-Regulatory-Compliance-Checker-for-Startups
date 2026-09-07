"""
models.py — Pydantic request/response schemas for the /check endpoint.

Keeping all data models in one file makes the contract between frontend
and backend explicit and easy to walk through in a presentation.
"""

from __future__ import annotations

from typing import Literal
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Request
# ---------------------------------------------------------------------------

class ComplianceRequest(BaseModel):
    """Body sent by the frontend to POST /check."""

    policy_text: str = Field(
        ...,
        min_length=50,
        description="The full text of the startup's privacy policy to evaluate.",
        examples=["We collect your name and email to provide our service..."],
    )


# ---------------------------------------------------------------------------
# Per-item result (one per checklist item, per model)
# ---------------------------------------------------------------------------

class ChecklistItemResult(BaseModel):
    """The compliance verdict for one checklist requirement from one model."""

    id: str = Field(..., description="Checklist item identifier, e.g. 'consent_mechanism'")
    requirement: str = Field(..., description="Human-readable requirement text")
    status: Literal["Met", "Partially Met", "Missing"] = Field(
        ..., description="Compliance status as determined by the model"
    )
    cited_sections: list[str] = Field(
        default_factory=list,
        description="DPDP Act section identifiers cited by the model (e.g. ['Section 6', 'Section 6(4)'])",
    )
    reason: str = Field(..., description="One-sentence explanation of the verdict")
    suggested_fix: str | None = Field(
        None,
        description="Actionable fix suggestion, or null if status is Met",
    )
    confidence: int = Field(
        ...,
        ge=0,
        le=100,
        description="Model's self-assessed confidence in its verdict (0–100)",
    )


# ---------------------------------------------------------------------------
# Per-model aggregated result
# ---------------------------------------------------------------------------

class ModelResult(BaseModel):
    """All checklist results for one model, plus its aggregate compliance score."""

    model_name: str = Field(..., description="Gemini model identifier used")
    score: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description=(
            "Weighted compliance score: Met=1 pt, Partially Met=0.5 pt, Missing=0 pt; "
            "expressed as a percentage of total checklist items."
        ),
    )
    results: list[ChecklistItemResult] = Field(
        ..., description="Per-item verdicts for every checklist requirement"
    )


# ---------------------------------------------------------------------------
# Disagreement detail
# ---------------------------------------------------------------------------

class AgreementDetail(BaseModel):
    """A single checklist item where the two models returned different statuses."""

    item_id: str
    requirement: str
    model_a_status: Literal["Met", "Partially Met", "Missing"]
    model_b_status: Literal["Met", "Partially Met", "Missing"]


# ---------------------------------------------------------------------------
# Top-level response
# ---------------------------------------------------------------------------

class ComplianceResponse(BaseModel):
    """Full response returned by POST /check."""

    model_a: ModelResult = Field(..., description="Results from gemini-3.7-flash (Model A)")
    model_b: ModelResult = Field(..., description="Results from gemini-3.5-flash (Model B)")
    agreement_rate: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Fraction of checklist items where both models returned the same status (0.0–1.0)",
    )
    disagreements: list[AgreementDetail] = Field(
        default_factory=list,
        description="Items where Model A and Model B disagreed",
    )
