"""
email_router.py

This file defines the HTTP endpoints for email phishing analysis.
No business logic. No ML imports.
"""
from fastapi import APIRouter, Depends

from app.core.email_analyzer import EmailAnalyzer
from app.schemas.email import EmailAnalyzeRequest, EmailAnalyzeResponse

router = APIRouter(prefix="/analyze", tags=["email"])


def get_email_analyzer() -> EmailAnalyzer:
    """
    Provide an EmailAnalyzer instance for route handlers.

    Pattern: dependency injection — FastAPI calls this and passes
    the result into the endpoint via Depends(...).
    """
    return EmailAnalyzer()


@router.post(
    "/email",
    response_model=EmailAnalyzeResponse,
    summary="Analyze an email for phishing risk",
)
def analyze_email(
    request: EmailAnalyzeRequest,
    analyzer: EmailAnalyzer = Depends(get_email_analyzer),
) -> EmailAnalyzeResponse:
    """
    Accept subject/body/optional URLs and return risk score + classification.

    Args:
        request: JSON body validated by Pydantic.
        analyzer: Injected email analysis service.

    Returns:
        Typed analysis response.
    """
    return analyzer.analyze(request)