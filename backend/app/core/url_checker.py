"""
url_checker.py

This file analyzes one URL for phishing-like threat signals.
No FastAPI. No email ML. Rule-based. Never fetches or visits the URL.
"""

from urllib.parse import urlparse

from app.core.risk_thresholds import SAFE_MAX_SCORE, URL_SUSPICIOUS_MAX_SCORE
from app.schemas.url import (
    UrlAnalyzeRequest,
    UrlAnalyzeResponse,
    UrlRiskClassification,
    UrlSignal,
)

WEIGHT_IP_HOST = 35
WEIGHT_NO_HTTPS = 15
WEIGHT_SHORTENER = 25
WEIGHT_AT_SYMBOL = 30
WEIGHT_MANY_SUBDOMAINS = 20
WEIGHT_SUSPICIOUS_TLD = 20
WEIGHT_LOGIN_KEYWORDS = 15
WEIGHT_LONG_URL = 10
WEIGHT_BRAND_IMPERSONATION = 28
WEIGHT_SECURITY_WORDS_IN_HOST = 16
WEIGHT_HYPHENATED_HOST = 8
WEIGHT_EXECUTABLE_PATH = 26

SHORTENER_DOMAINS = {
    "bit.ly",
    "tinyurl.com",
    "t.co",
    "goo.gl",
    "ow.ly",
    "is.gd",
    "buff.ly",
    "rebrand.ly",
    "rb.gy",
    "cutt.ly",
}

SUSPICIOUS_TLDS = {
    ".tk",
    ".ml",
    ".ga",
    ".cf",
    ".gq",
    ".xyz",
    ".top",
    ".click",
    ".link",
    ".zip",
    ".mov",
    ".rest",
    ".country",
}

LOGIN_KEYWORDS = (
    "login",
    "verify",
    "secure",
    "account",
    "update",
    "password",
    "banking",
    "signin",
    "confirm",
    "billing",
    "payment",
)

# Brand names often abused in fake domains (checked against host only)
IMPERSONATED_BRANDS = (
    "paypal",
    "apple",
    "microsoft",
    "netflix",
    "amazon",
    "google",
    "dhl",
    "fedex",
    "chase",
    "coinbase",
    "binance",
    "instagram",
    "facebook",
    "linkedin",
    "outlook",
    "office365",
)

# Hosts we treat as known-good for brand matching
TRUSTED_ROOTS = {
    "google.com",
    "microsoft.com",
    "apple.com",
    "paypal.com",
    "amazon.com",
    "github.com",
    "linkedin.com",
    "netflix.com",
    "dropbox.com",
    "stripe.com",
    "wikipedia.org",
    "office.com",
    "live.com",
    "outlook.com",
}


def _normalize_url(url: str) -> str:
    """Add a scheme if missing so urlparse can read host/path."""
    text = url.strip()
    if not text:
        return text
    if "://" not in text:
        text = "http://" + text
    return text


def _host_is_ip(hostname: str | None) -> bool:
    """Return True if hostname looks like an IPv4 address."""
    if not hostname:
        return False
    parts = hostname.split(".")
    if len(parts) != 4:
        return False
    return all(part.isdigit() and 0 <= int(part) <= 255 for part in parts)


def _root_domain(hostname: str) -> str:
    """Best-effort registrable domain (last two labels)."""
    parts = [part for part in hostname.split(".") if part]
    if len(parts) < 2:
        return hostname
    return ".".join(parts[-2:])


def _collect_signals(url: str) -> list[UrlSignal]:
    """
    Run rule checks and return any triggered signals.

    Args:
        url: Raw URL string from the client.

    Returns:
        List of UrlSignal objects (may be empty).
    """
    normalized = _normalize_url(url)
    parsed = urlparse(normalized)
    hostname = (parsed.hostname or "").lower()
    path_and_query = f"{parsed.path} {parsed.query}".lower()
    root = _root_domain(hostname) if hostname else ""
    signals: list[UrlSignal] = []

    if _host_is_ip(hostname):
        signals.append(
            UrlSignal(
                code="ip_hostname",
                message="Hostname is an IP address (common in phishing links).",
                weight=WEIGHT_IP_HOST,
            )
        )

    if parsed.scheme.lower() != "https":
        signals.append(
            UrlSignal(
                code="no_https",
                message="URL does not use HTTPS.",
                weight=WEIGHT_NO_HTTPS,
            )
        )

    if hostname in SHORTENER_DOMAINS or root in SHORTENER_DOMAINS:
        signals.append(
            UrlSignal(
                code="url_shortener",
                message="URL uses a known shortener (destination is hidden).",
                weight=WEIGHT_SHORTENER,
            )
        )

    if "@" in normalized:
        signals.append(
            UrlSignal(
                code="at_symbol",
                message="URL contains '@', which can hide the real host.",
                weight=WEIGHT_AT_SYMBOL,
            )
        )

    labels = [part for part in hostname.split(".") if part]
    if not _host_is_ip(hostname) and len(labels) >= 4:
        signals.append(
            UrlSignal(
                code="many_subdomains",
                message="Hostname has many subdomains.",
                weight=WEIGHT_MANY_SUBDOMAINS,
            )
        )

    if any(hostname.endswith(tld) for tld in SUSPICIOUS_TLDS):
        signals.append(
            UrlSignal(
                code="suspicious_tld",
                message="Domain uses a TLD often abused in phishing.",
                weight=WEIGHT_SUSPICIOUS_TLD,
            )
        )

    if "-" in hostname and not _host_is_ip(hostname):
        signals.append(
            UrlSignal(
                code="hyphenated_host",
                message="Hyphenated domain can be used to imitate a brand name.",
                weight=WEIGHT_HYPHENATED_HOST,
            )
        )

    is_trusted = root in TRUSTED_ROOTS or hostname in TRUSTED_ROOTS
    for brand in IMPERSONATED_BRANDS:
        if brand in hostname and not is_trusted:
            signals.append(
                UrlSignal(
                    code="brand_impersonation",
                    message=f'Hostname mentions "{brand}" but is not a known official domain.',
                    weight=WEIGHT_BRAND_IMPERSONATION,
                )
            )
            break

    security_host_words = ("secure", "login", "verify", "update", "account", "billing", "confirm")
    if any(word in hostname for word in security_host_words) and not is_trusted:
        signals.append(
            UrlSignal(
                code="security_words_in_host",
                message="Domain uses security-sounding words to look official.",
                weight=WEIGHT_SECURITY_WORDS_IN_HOST,
            )
        )

    if any(word in path_and_query or word in hostname for word in LOGIN_KEYWORDS):
        signals.append(
            UrlSignal(
                code="login_keywords",
                message="URL contains login/verify/account-style keywords.",
                weight=WEIGHT_LOGIN_KEYWORDS,
            )
        )

    if any(parsed.path.lower().endswith(ext) for ext in (".exe", ".zip", ".scr", ".apk", ".js")):
        signals.append(
            UrlSignal(
                code="executable_path",
                message="Link path looks like a downloadable file that can run on a device.",
                weight=WEIGHT_EXECUTABLE_PATH,
            )
        )

    if len(normalized) > 75:
        signals.append(
            UrlSignal(
                code="long_url",
                message="URL is unusually long.",
                weight=WEIGHT_LONG_URL,
            )
        )

    return signals


def _score_from_signals(signals: list[UrlSignal]) -> float:
    """Sum weights and cap at 100."""
    total = sum(signal.weight for signal in signals)
    return float(min(100, total))


def _classify(score: float) -> UrlRiskClassification:
    if score <= SAFE_MAX_SCORE:
        return UrlRiskClassification.SAFE
    if score <= URL_SUSPICIOUS_MAX_SCORE:
        return UrlRiskClassification.SUSPICIOUS
    return UrlRiskClassification.PHISHING


def _explanation(
    score: float,
    classification: UrlRiskClassification,
    signals: list[UrlSignal],
    hostname: str,
) -> str:
    host_label = hostname or "this link"
    if not signals:
        return (
            f"Classified as {classification.value} with risk score {score:.0f}/100. "
            f"No strong threat signals found for {host_label}."
        )
    if classification == UrlRiskClassification.PHISHING:
        return (
            f"Classified as phishing with risk score {score:.0f}/100. "
            f"{host_label} shows several patterns used by fake sign-in pages."
        )
    if classification == UrlRiskClassification.SUSPICIOUS:
        return (
            f"Classified as suspicious with risk score {score:.0f}/100. "
            f"Treat {host_label} with care until you confirm it another way."
        )
    return (
        f"Classified as safe with risk score {score:.0f}/100. "
        f"Few warning signs found for {host_label}."
    )


class UrlChecker:
    """
    Application service for URL threat-signal analysis.

    Pattern: Service layer, same idea as EmailAnalyzer, different job (SRP).
    """

    def check(self, request: UrlAnalyzeRequest) -> UrlAnalyzeResponse:
        """
        Analyze one URL and return score, label, and signals.

        Args:
            request: Validated URL request.

        Returns:
            UrlAnalyzeResponse for the API.
        """
        normalized = _normalize_url(request.url)
        hostname = (urlparse(normalized).hostname or "").lower()
        signals = _collect_signals(request.url)
        risk_score = _score_from_signals(signals)
        classification = _classify(risk_score)

        return UrlAnalyzeResponse(
            url=request.url,
            risk_score=risk_score,
            classification=classification,
            signals=signals,
            explanation=_explanation(risk_score, classification, signals, hostname),
        )


def main() -> None:
    """Smoke test: python -m app.core.url_checker"""
    checker = UrlChecker()
    samples = [
        "https://www.wikipedia.org/wiki/Phishing",
        "http://192.168.1.10/login/verify",
        "http://bit.ly/abc123",
        "http://secure-paypal-verify.account-check.top/login",
    ]
    for sample in samples:
        print("---")
        print(checker.check(UrlAnalyzeRequest(url=sample)))


if __name__ == "__main__":
    main()
