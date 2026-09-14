"""
predictor.py

This file uses the trained phishing email model to score one email.

It:
1. Loads the saved feature extractor and ML model
2. Uses EmailFeatureExtractor to turn the email into numbers
3. Returns phishing probability, raw risk score (0-100), and SHAP contributors

Product policy (classification, trusted-host adjustment, explanations)
lives in core/email_analyzer.py — not here.

This file does NOT train the model.
This file does NOT handle HTTP.
"""
from pathlib import Path
from typing import Any

import joblib

# Paths & constants
MODELS_DIR = Path(__file__).resolve().parent / "models"
MODEL_PATH = MODELS_DIR / "phishing_model.pkl"

TOP_SHAP_FEATURES = 8  # how many SHAP contributors to return

_artifacts: dict[str, Any] | None = None


def load_artifacts(path: Path = MODEL_PATH) -> dict[str, Any]:
    """
    Load the fitted extractor and trained model from disk

    Args:
        path: Path to the .pkl saved by trainer.py

    Returns:
        Dict with keys "extractor" and "model"
    """
    if not path.exists():
        raise FileNotFoundError(
            f"Model not found at {path}. Run: python -m app.ml.trainer"
        )
    return joblib.load(path)


def get_artifacts() -> dict[str, Any]:
    """Return cached artifacts, loading from disk on first use."""
    global _artifacts
    if _artifacts is None:
        _artifacts = load_artifacts()
    return _artifacts


def explain_with_shap(
    model: Any,
    features: Any,
    feature_names: list[str],
    top_n: int = TOP_SHAP_FEATURES,
) -> list[dict[str, Any]]:
    """
    Rank features by how much they pushed the phishing score up.

    Args:
        model: Trained XGBClassifier.
        features: 2D array from extractor.transform (shape 1 x n_features).
        feature_names: Names aligned with feature columns.
        top_n: Max contributors to return.

    Returns:
        List of {"feature": str, "impact": float} sorted by impact descending.
        Empty list if SHAP fails (prediction still works).
    """
    try:
        import shap  # local import keeps startup light if unused
    except ImportError:
        return []

    try:
        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(features)

        # Binary XGBoost: sometimes list [class0, class1], sometimes single array
        if isinstance(shap_values, list):
            values = shap_values[1][0]  # class 1 = phishing
        else:
            values = shap_values[0]

        pairs: list[tuple[str, float]] = []
        for name, impact in zip(feature_names, values):
            impact_f = float(impact)
            # Only features that pushed TOWARD phishing
            if impact_f > 0:
                pairs.append((name, impact_f))

        pairs.sort(key=lambda item: item[1], reverse=True)
        return [
            {"feature": name, "impact": round(impact, 4)}
            for name, impact in pairs[:top_n]
        ]
    except Exception:
        # Never break scoring because explainability failed
        return []


def predict_email(text: str) -> dict[str, Any]:
    """
    Score one email using the saved extractor + model (raw ML output only).

    Returns dict with:
      - risk_score: float 0-100 from model probability (no policy adjustments)
      - phishing_probability: float 0-1
      - top_contributors: SHAP feature impacts toward phishing
    """
    if text is None or not str(text).strip():
        return {
            "risk_score": 0.0,
            "phishing_probability": 0.0,
            "top_contributors": [],
        }

    artifacts = get_artifacts()
    extractor = artifacts["extractor"]
    model = artifacts["model"]

    features = extractor.transform([text])
    proba = model.predict_proba(features)[0]
    phishing_probability = float(proba[1])
    risk_score = round(phishing_probability * 100, 1)

    feature_names = extractor.get_feature_names()
    top_contributors = explain_with_shap(model, features, feature_names)

    return {
        "risk_score": risk_score,
        "phishing_probability": phishing_probability,
        "top_contributors": top_contributors,
    }


def main() -> None:
    """Quick manual test (raw ML). Run: python -m app.ml.predictor"""
    samples = [
        "Hi team, the meeting notes are attached. See you tomorrow.",
        (
            "URGENT: Your account has been suspended. "
            "Verify immediately at http://secure-login-update.example/login "
            "or it will be locked!!!"
        ),
        (
            "Morina8700 invited you to Morina8700/BookMyHome. "
            "You can accept or decline this invitation. "
            "https://github.com/Morina8700/BookMyHome "
            "https://github.com/Morina8700"
        ),
    ]
    for sample in samples:
        result = predict_email(sample)
        print("---")
        print(sample[:80], "...")
        print(result)


if __name__ == "__main__":
    main()
