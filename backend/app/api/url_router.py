"""
url_router.py

This file defines the HTTP endpoints for URL analysis only
No business logic. No ML imports.
"""
from fastapi import APIRouter, Depends

from app.core.url_checker import UrlChecker
from app.schemas.url import UrlAnalyzeRequest, UrlAnalyzeResponse

router = APIRouter(prefix="/analyze", tags=["url"])


def get_url_checker() -> UrlChecker:
    """Dependency injection for UrlChecker."""
    return UrlChecker()


@router.post(
    "/url",
    response_model=UrlAnalyzeResponse,
    summary="Analyze a URL for phishing threat signals",
)
def analyze_url(
    request: UrlAnalyzeRequest,
    checker: UrlChecker = Depends(get_url_checker),
) -> UrlAnalyzeResponse:
    """Accept one URL and return risk score + signals."""
    return checker.check(request)