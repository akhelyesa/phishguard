"""
email_analyzer.py

Application service for email phishing analysis.

Orchestrates:
1. Combining subject/body/URLs into one text string
2. Calling the ML predictor for a raw risk score
3. Applying product policy (trusted hosts, classification, explanation)

No FastAPI. No training. No feature extraction details.
"""
from urllib.parse import urlparse

from app.core.risk_thresholds import EMAIL_SUSPICIOUS_MAX_SCORE, SAFE_MAX_SCORE
from app.ml.feature_extractor import (
    URL_PATTERN,
    URGENCY_WORDS,
    count_urls,
    count_urgency_words,
)
from app.ml.predictor import predict_email
from app.schemas.email import EmailAnalyzeRequest, EmailAnalyzeResponse

# When every extracted URL is on a trusted host, subtract this from the risk score
TRUSTED_HOST_SCORE_REDUCTION = 20

# Hosts that are usually legitimate in notification emails (exact or subdomain)
TRUSTED_HOSTS = frozenset(
    {
        "github.com",
        "google.com",
        "googleapis.com",
        "microsoft.com",
        "office.com",
        "live.com",
        "outlook.com",
        "apple.com",
        "icloud.com",
        "amazon.com",
        "aws.amazon.com",
        "linkedin.com",
        "facebook.com",
        "twitter.com",
        "x.com",
        "paypal.com",
        "wikipedia.org",
    }
)


def combine_email_text(request: EmailAnalyzeRequest) -> str:
    """
    Build one text string for the ML model from subject, body, and optional URLs.

    Args:
        request: Validated email analyze request.

    Returns:
        A single string the predictor can score.
    """
    parts: list[str] = []

    if request.subject and request.subject.strip():
        parts.append(request.subject.strip())

    parts.append(request.body.strip())

    if request.urls:
        # Include URLs in the text so TF-IDF / URL-count features can see them
        parts.append(" ".join(url.strip() for url in request.urls if url.strip()))

    return "\n".join(parts)


def classify_risk(score: float) -> str:
    """Map a 0-100 risk score to safe / suspicious / phishing (email policy)."""
    if score <= SAFE_MAX_SCORE:
        return "safe"
    if score <= EMAIL_SUSPICIOUS_MAX_SCORE:
        return "suspicious"
    return "phishing"


def _hostname_is_trusted(hostname: str | None) -> bool:
    """
    Return True if hostname matches a trusted registrable domain or subdomain.

    Args:
        hostname: e.g. "github.com" or "gist.github.com"

    Returns:
        Whether the host is on the allowlist.
    """
    if not hostname:
        return False
    host = hostname.lower().rstrip(".")
    if host in TRUSTED_HOSTS:
        return True
    return any(host.endswith(f".{trusted}") for trusted in TRUSTED_HOSTS)


def extract_url_hostnames(text: str) -> list[str]:
    """
    Extract hostnames from http(s) URLs in text.

    Args:
        text: Email subject/body text.

    Returns:
        List of hostnames (may be empty).
    """
    if not text:
        return []
    hosts: list[str] = []
    for match in URL_PATTERN.findall(text):
        parsed = urlparse(match)
        if parsed.hostname:
            hosts.append(parsed.hostname.lower())
    return hosts


def all_urls_trusted(text: str) -> bool:
    """
    Return True when the text has at least one URL and every URL host is trusted.

    Args:
        text: Email text.

    Returns:
        Whether all found URL hosts are on TRUSTED_HOSTS (or subdomains).
    """
    hosts = extract_url_hostnames(text)
    if not hosts:
        return False
    return all(_hostname_is_trusted(host) for host in hosts)


def apply_trusted_host_adjustment(text: str, risk_score: float) -> tuple[float, bool]:
    """
    Lower the risk score when every link points at a known-good host.

    Args:
        text: Email text.
        risk_score: Raw model score 0-100.

    Returns:
        (adjusted_score, whether_a_trusted_adjustment_was_applied)
    """
    if all_urls_trusted(text):
        adjusted = max(0.0, round(risk_score - TRUSTED_HOST_SCORE_REDUCTION, 1))
        return adjusted, True
    return risk_score, False


def build_explanation(
    text: str,
    score: float,
    label: str,
    *,
    trusted_links: bool = False,
) -> str:
    """
    Build a short plain-English reason for the score.

    Args:
        text: Original email text.
        score: Final risk score 0-100.
        label: safe / suspicious / phishing.
        trusted_links: True if score was softened for trusted hosts.
    """
    url_count = count_urls(text)
    urgency_count = count_urgency_words(text)

    parts: list[str] = [f"Classified as {label} with risk score {score:.0f}/100."]

    if trusted_links:
        parts.append(
            "All detected links point to known trusted domains, so the score was reduced."
        )

    if urgency_count > 0:
        cue_word = "cue" if urgency_count == 1 else "cues"
        parts.append(
            f"Found {urgency_count} urgency/security {cue_word} often seen in phishing."
        )
    if url_count > 0 and not trusted_links:
        url_word = "URL" if url_count == 1 else "URLs"
        parts.append(f"Found {url_count} {url_word} in the message.")
    elif url_count > 0 and trusted_links:
        url_word = "URL" if url_count == 1 else "URLs"
        parts.append(f"Found {url_count} trusted {url_word} in the message.")

    if label in ("suspicious", "phishing") and urgency_count == 0:
        parts.append(
            "The model scored this like a notification or invite. "
            "Verify the sender in the official app or website - links alone do not prove phishing."
        )

    if urgency_count == 0 and url_count == 0 and label == "safe":
        parts.append("Few common phishing signals detected in the text.")

    return " ".join(parts)


def find_highlight_words(text: str) -> list[str]:
    """Return urgency phrases that appear in the email (for the frontend)."""
    if not text:
        return []
    lowered = text.lower()
    found: list[str] = []
    for word in URGENCY_WORDS:
        if word in lowered and word not in found:
            found.append(word)
    return found


class EmailAnalyzer:
    """
    Application service for analyzing one email.

    Pattern: Service layer — business use case, no HTTP.
    """

    def analyze(self, request: EmailAnalyzeRequest) -> EmailAnalyzeResponse:
        """
        Analyze an email and return a typed API response.

        Args:
            request: Subject, body, and optional URLs.

        Returns:
            EmailAnalyzeResponse with score, label, explanation, highlights.
        """
        text = combine_email_text(request)

        if not text.strip():
            return EmailAnalyzeResponse(
                risk_score=0.0,
                classification="safe",
                explanation="Empty email: nothing to analyze.",
                highlight_words=[],
                phishing_probability=0.0,
                top_contributors=[],
            )

        raw = predict_email(text)
        risk_score, trusted_links = apply_trusted_host_adjustment(
            text,
            float(raw["risk_score"]),
        )
        label = classify_risk(risk_score)

        return EmailAnalyzeResponse(
            risk_score=risk_score,
            classification=label,
            explanation=build_explanation(
                text,
                risk_score,
                label,
                trusted_links=trusted_links,
            ),
            highlight_words=find_highlight_words(text),
            phishing_probability=float(raw["phishing_probability"]),
            top_contributors=raw.get("top_contributors", []),
        )


def main() -> None:
    """
    Quick smoke test (no HTTP server needed).
    Run from backend/:  python -m app.core.email_analyzer
    """
    analyzer = EmailAnalyzer()
    request = EmailAnalyzeRequest(
        subject="URGENT: account suspended",
        body="Verify immediately at http://evil.example/login or it will be locked!!!",
        urls=["http://evil.example/login"],
    )
    response = analyzer.analyze(request)
    print(response)


if __name__ == "__main__":
    main()
