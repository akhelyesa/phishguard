"""
email.py (schemas)

This file defines the shape of email analysis requests and responses
No ML. No business logic. No FastAPI routes.
"""
from enum import Enum
from typing import Annotated, Optional

from pydantic import BaseModel, Field, field_validator

# Named limits — reject oversized pastes before they hit the ML layer
MAX_SUBJECT_LENGTH = 500
MAX_BODY_LENGTH = 50_000
MAX_URL_LENGTH = 2_048
MAX_URLS_PER_REQUEST = 20

class RiskClassification(str, Enum):
    """Allowed classification labels returned by the API"""

    SAFE = "safe"
    SUSPICIOUS = "suspicious"
    PHISHING = "phishing"


class EmailAnalyzeRequest(BaseModel):
    """
    What the client sends when asking to analyze an email.

    Args (fields):
        subject: Email subject line.
        body: Email body text.
        urls: Optional list of URLs to include in analysis context.
    """

    subject: str = Field(
        default="",
        max_length=MAX_SUBJECT_LENGTH,
        description="Email subject line",
    )
    body: str = Field(
        ...,
        min_length=1,
        max_length=MAX_BODY_LENGTH,
        description="Email body (required)",
    )
    urls: Optional[list[Annotated[str, Field(max_length=MAX_URL_LENGTH)]]] = Field(
        default=None,
        max_length=MAX_URLS_PER_REQUEST,
        description="Optional URLs found in or related to the email",
    )

    @field_validator("subject", "body", mode="before")
    @classmethod
    def strip_whitespace(cls, value: object) -> object:
        """Trim text before length checks so whitespace-only body is rejected."""
        return value.strip() if isinstance(value, str) else value

class ShapContributor(BaseModel):
    """One feature that pushed the phishing score up (SHAP)."""

    feature: str = Field(..., description="TF-IDF term or handcrafted feature name")
    impact: float = Field(..., ge=0, description="Positive SHAP impact toward phishing")

class EmailAnalyzeResponse(BaseModel):
    """
    What the API returns after analyzing an email.

    Matches the keys from predict_email(), plus a combined text view
    the frontend can use for highlighting.
    """

    risk_score: float = Field(..., ge=0, le=100, description="Risk from 0 to 100")
    classification: RiskClassification
    explanation: str
    highlight_words: list[str] = Field(default_factory=list)
    phishing_probability: float = Field(..., ge=0, le=1)
    top_contributors: list[ShapContributor] = Field(
        default_factory=list,
        description="Top features that increased phishing risk (SHAP)",
    )
