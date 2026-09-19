"""
score_smoke_emails.py

Score the fixed 5 smoke-test emails (same cases used after my_extra retrain).
Prints risk_score + classification via EmailAnalyzer (app policy).

Run from backend/:  python -m app.ml.score_smoke_emails
"""

import app.ml.predictor as predictor
from app.core.email_analyzer import EmailAnalyzer
from app.schemas.email import EmailAnalyzeRequest

# Fixed cases: name, expected_safe (True = want low risk), subject, body
SMOKE_EMAILS = [
    (
        "1_Wise",
        True,
        "Your Wise account is ready to go",
        (
            "Hello Elyesa, Your account is set up and ready to go. "
            "We've finished verifying your details, which means your Wise account "
            "is ready to go. Start exploring all the ways you can move and manage "
            "your money around the world"
        ),
    ),
    (
        "2_Billund_job",
        True,
        "Nyt fra din jobagent",
        (
            "Kære Elyesa Vi har følgende ledige jobs, som matcher din jobagent: "
            "Funktionsleder til markafdelingen i Billund Lufthavn Vi ser frem til "
            "at modtage din ansøgning elektronisk, hvis en eller flere af stillingerne "
            "har din interesse. Med venlig hilsen Billund Lufthavn A/S Hvis du ønsker "
            "at redigere dine indtastede oplysninger eller ikke længere ønsker at "
            "modtage påmindelser med nye stillinger, så log venligst ind i vores "
            "CV-database: https://bll.career.emply.com/da#login"
        ),
    ),
    (
        "3_Postnord",
        False,
        "Levering mislykkedes",
        (
            "Hi administrator, Postnord Levering mislykkedes Kære kunde. Vi kunne "
            "desværre ikke levere din forsendelse i dag, da den angivne leveringsadresse "
            "var ugyldig. Status: Returneret Gebyr: 27,00 kr. (kræves for ny levering) "
            "Opdater venligst dine leveringsoplysninger og vælg en ny leveringsdato via "
            "knappen herunder. https://rebrand.ly/cay8ov2 Når dine oplysninger er "
            "bekræftet, sender vi en ny e-mail med den opdaterede leveringsdato. "
            "Denne meddelelse er sendt af Kundeservice. Kontakt os, hvis du har sporgsmål."
        ),
    ),
    (
        "4_Apple_ID",
        False,
        "Your Apple ID has been locked",
        (
            "Your Apple ID was locked due to multiple failed login attempts from an "
            "unrecognized device. Unlock your account now to restore access to iCloud, "
            "App Store, and Find My iPhone. [Unlock Account]"
        ),
    ),
    (
        "5_Flight",
        True,
        "Your booking confirmation – Copenhagen to Berlin",
        (
            "Hi Elyesa, thanks for booking with us. Here are your flight details: "
            "Flight DY1234, departing Copenhagen (CPH) at 07:15, arriving Berlin (BER) "
            "at 08:35. Seat 14C, economy. Check-in opens 24 hours before departure — "
            "you can check in via our app or website. Please arrive at the airport at "
            "least 2 hours before departure for a smooth experience. If your plans "
            "change, you can manage your booking online. Safe travels, and thanks for "
            "flying with us."
        ),
    ),
]


def main() -> None:
    """Reload model from disk and score each smoke email."""
    predictor._artifacts = None  # force reload after retrain
    analyzer = EmailAnalyzer()

    print(f"{'name':18} {'score':>6}  {'label':12}  expected_safe")
    print("-" * 55)
    for name, expected_safe, subject, body in SMOKE_EMAILS:
        result = analyzer.analyze(
            EmailAnalyzeRequest(subject=subject, body=body, urls=None)
        )
        print(
            f"{name:18} {result.risk_score:6.1f}  "
            f"{result.classification.value:12}  {expected_safe}"
        )


if __name__ == "__main__":
    main()
