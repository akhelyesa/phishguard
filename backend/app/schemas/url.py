"""
url.py (schemas)

This file defines the shape of URL analysis requests and responses
No ML. No business logic. No FastAPI routes.
"""
from enum import Enum

from pydantic import BaseModel, Field, field_validator

# Named limit — reject absurdly long URLs before rule checks run
MAX_URL_LENGTH = 2_048


class UrlRiskClassification(str, Enum):
    SAFE = "safe"
    SUSPICIOUS = "suspicious"
    PHISHING = "phishing"


class UrlAnalyzeRequest(BaseModel):
    """Client sends one URL to check."""

    url: str = Field(
        ...,
        min_length=1,
        max_length=MAX_URL_LENGTH,
        description="URL to analyze",
    )

    @field_validator("url", mode="before")
    @classmethod
    def strip_whitespace(cls, value: object) -> object:
        """Trim URL before length checks."""
        return value.strip() if isinstance(value, str) else value


class UrlSignal(BaseModel):
    """One threat signal found during analysis."""

    code: str = Field(..., description="Machine-friendly signal id")
    message: str = Field(..., description="Human-readable explanation")
    weight: int = Field(..., ge=0, description="How much this adds to the risk score")


class UrlAnalyzeResponse(BaseModel):
    """API response for a single URL check."""

    url: str
    risk_score: float = Field(..., ge=0, le=100)
    classification: UrlRiskClassification
    signals: list[UrlSignal] = Field(default_factory=list)
    explanation: str
