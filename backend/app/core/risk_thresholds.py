"""
risk_thresholds.py

Shared risk-score cutoffs for email and URL classification.

SAFE is the same for both. SUSPICIOUS ceilings differ on purpose:
- Email (ML): borderline invite/notification scores (~70-80) stay "suspicious"
  so trusted-looking mail is not labeled phishing too aggressively.
- URL (rules): additive signal weights reach "phishing" sooner; 70 matches
  the heuristic scoring scale in url_checker.
"""

# Shared: scores at or below this are "safe"
SAFE_MAX_SCORE = 30

# Email ML pipeline (core/email_analyzer.py)
EMAIL_SUSPICIOUS_MAX_SCORE = 85

# URL rule pipeline (core/url_checker.py)
URL_SUSPICIOUS_MAX_SCORE = 70
