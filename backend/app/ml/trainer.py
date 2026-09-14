"""
trainer.py

This file trains the phishing email model.

It:
1. Loads emails that are already labeled as phishing or legitimate
2. Uses EmailFeatureExtractor to turn the emails into numbers
3. Trains Logistic Regression + Random Forest baselines (comparison only)
4. Trains XGBoost (the model we save for inference)
5. Saves the trained XGBoost model so it can be used later

This file does NOT create the features itself
It uses EmailFeatureExtractor to do that

This file also does NOT handle web requests
"""
from pathlib import Path
from typing import Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, f1_score
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier

from app.ml.feature_extractor import EmailFeatureExtractor

# Paths & constants
# Find this file's Path/location → go to backend/ → find data/ and models/

BACKEND_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BACKEND_DIR / "data" / "archive"
MODELS_DIR = Path(__file__).resolve().parent / "models"
MODEL_PATH = MODELS_DIR / "phishing_model.pkl"

# Must match the column names in phishing_email.csv
TEXT_COLUMN = "text_combined"
LABEL_COLUMN = "label"

# Common defaults — named constants, not magic numbers
TEST_SIZE = 0.2 # Use 20% of the emails for testing. The remaining 80% will be used for training.
RANDOM_STATE = 42 # same split every run so results are repeatable
DEFAULT_CSV_NAME = "phishing_email.csv"


def load_dataset(csv_path: Path) -> Tuple[list[str], list[int]]:
    """
    Load a labeled email CSV with Pandas.

    Args:
        csv_path: Path to the CSV file.

    Returns:
        texts: List of email strings.
        labels: List of ints (0 = safe, 1 = phishing).

    Raises:
        FileNotFoundError: If the CSV does not exist.
        KeyError: If expected columns are missing.
    """
    if not csv_path.exists():
        raise FileNotFoundError(
            f"Dataset not found: {csv_path}\n"
            f"Put your CSV in {DATA_DIR} and update DEFAULT_CSV_NAME / column names."
        )

    df = pd.read_csv(csv_path)

    if TEXT_COLUMN not in df.columns or LABEL_COLUMN not in df.columns:
        raise KeyError(
            f"Expected columns '{TEXT_COLUMN}' and '{LABEL_COLUMN}'. "
            f"Found: {list(df.columns)}. Update TEXT_COLUMN / LABEL_COLUMN in trainer.py."
        )

    # Drop rows with missing text or label
    df = df.dropna(subset=[TEXT_COLUMN, LABEL_COLUMN])

    texts = df[TEXT_COLUMN].astype(str).tolist()
    labels = df[LABEL_COLUMN].astype(int).tolist()
    return texts, labels


def evaluate_baselines(
    X_train: np.ndarray,
    X_test: np.ndarray,
    y_train: list[int],
    y_test: list[int],
) -> None:
    """
    Train Logistic Regression and Random Forest on the same features.
    Prints holdout accuracy/F1 for comparison only — models are not saved.

    Args:
        X_train: Training feature matrix.
        X_test: Holdout feature matrix.
        y_train: Training labels.
        y_test: Holdout labels.
    """
    baselines = {
        "Logistic Regression": LogisticRegression(
            max_iter=1000,
            random_state=RANDOM_STATE,
        ),
        "Random Forest": RandomForestClassifier(
            n_estimators=100,
            max_depth=12,
            random_state=RANDOM_STATE,
            n_jobs=-1,
        ),
    }

    print("\n--- Baseline comparison (holdout) ---")
    for name, clf in baselines.items():
        clf.fit(X_train, y_train)
        y_pred = clf.predict(X_test)
        acc = accuracy_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        print(f"{name:22} accuracy={acc:.3f}  f1={f1:.3f}")


def train_model(
    texts: list[str],
    labels: list[int],
) -> tuple[EmailFeatureExtractor, XGBClassifier]:
    """
    Fit the feature extractor, compare baselines, train XGBoost, print metrics.

    Args:
        texts: Email strings.
        labels: 0/1 labels matching texts.

    Returns:
        fitted extractor and trained XGBoost classifier (the one we ship).
    """
    # Split BEFORE fitting TF-IDF so the test set doesn't leak into vocabulary
    X_train_text, X_test_text, y_train, y_test = train_test_split(
        texts,
        labels,
        test_size=TEST_SIZE,
        random_state=RANDOM_STATE,
        stratify=labels,  # keep phishing/safe ratio similar in both splits
    )

    extractor = EmailFeatureExtractor()
    X_train = extractor.fit_transform(X_train_text)
    X_test = extractor.transform(X_test_text)  # transform only — never fit on test

    # Brief asked for LR + RF baselines; comparison only, not saved for inference
    evaluate_baselines(X_train, X_test, y_train, y_test)

    model = XGBClassifier(
        n_estimators=100,
        max_depth=6,
        learning_rate=0.1,
        random_state=RANDOM_STATE,
        eval_metric="logloss",
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    print(f"{'XGBoost':22} accuracy={acc:.3f}  f1={f1:.3f}")
    print(classification_report(y_test, y_pred, target_names=["safe", "phishing"]))

    return extractor, model


def save_artifacts(
    extractor: EmailFeatureExtractor,
    model: XGBClassifier,
    path: Path = MODEL_PATH,
) -> Path:
    """
    Save extractor + model together so prediction uses the same features.

    Args:
        extractor: Fitted EmailFeatureExtractor.
        model: Trained XGBClassifier.
        path: Where to write the .pkl file.

    Returns:
        Path to the saved file.
    """
    path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"extractor": extractor, "model": model}, path)
    print(f"Saved artifacts to: {path}")
    return path


def main() -> None:
    """
    Entry point: load CSV → train → save.
    Run from backend/:  python -m app.ml.trainer
    """
    csv_path = DATA_DIR / DEFAULT_CSV_NAME
    texts, labels = load_dataset(csv_path)
    print(f"Loaded {len(texts)} emails from {csv_path}")

    extractor, model = train_model(texts, labels)
    save_artifacts(extractor, model)


if __name__ == "__main__":
    main()