"""
feature_extractor.py

This file turns email text into numbers that the ML model can use

This is the ONLY place in the codebase that knows how to turn
an email into numbers. Nothing else should do this job
(That's the Single Responsibility Principle from SOLID)
"""

import re
from typing import Iterable
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

# Constants
# Named constants instead of magic values buried in code
# Easy to update the word list without touching any logic

URGENCY_WORDS = (
    "urgent", "immediately", "verify", "suspended", "locked",
    "confirm", "update", "click here", "act now", "limited time",
    "password", "login", "secure", "alert", "warning",
    "unauthorized", "expires", "validate", "account", "billing",
)

DEFAULT_MAX_TFIDF_FEATURES = 5000

# Regex for http/https URLs 
URL_PATTERN = re.compile(r"https?://[^\s<>\"']+", re.IGNORECASE)


# Hand-crafted features (one job each) 

def count_urls(text: str) -> int:
    """
    Count the number of http/https URLs in the email.

    Args:
        text: The email text.

    Returns:
        Number of URL matches found.
    """
    if not text:
        return 0
    return len(URL_PATTERN.findall(text))


def count_urgency_words(text: str) -> int:
    """
    Count how many urgency / phishing cue phrases appear in the text.

    Args:
        text: The email text.

    Returns:
        The total number of urgency words/phrases found.
    """
    if not text:
        return 0
    lowered = text.lower()
    return sum(lowered.count(word) for word in URGENCY_WORDS)


def count_exclamation_marks(text: str) -> int:
    """
    Count exclamation marks — often overused in phishing.

    Args:
        text: The email text.

    Returns:
        Number of '!' characters.
    """
    if not text:
        return 0
    return text.count("!")


def text_length(text: str) -> int:
    """
    Character length of the email text.

    Args:
        text: The email text.

    Returns:
        Length in characters (0 if empty).
    """
    if not text:
        return 0
    return len(text)


def capital_letter_ratio(text: str) -> float:
    """
    Ratio of uppercase letters to all letters (A–Z / a–z).

    Args:
        text: The email text.

    Returns:
        Float from 0.0 (no capitals) to 1.0 (all letters uppercase).
        Returns 0.0 if there are no letters.
    """
    if not text:
        return 0.0
    letters = [c for c in text if c.isalpha()]
    if not letters:
        return 0.0
    uppercase = sum(1 for c in letters if c.isupper())
    return uppercase / len(letters)

def extract_handcrafted_features(text: str) -> np.ndarray:
    """
    Build a small numeric vector of hand-crafted signals for one email.

    Args:
        text: The email text.

    Returns:
        1D numpy array shaped (5,): [urls, urgency, exclamations, length, capitals].
    """
    return np.array(
        [
            count_urls(text),
            count_urgency_words(text),
            count_exclamation_marks(text),
            text_length(text),
            capital_letter_ratio(text),
        ],
        dtype=float,
    )


HANDCRAFTED_FEATURE_NAMES = (
    "url_count",
    "urgency_word_count",
    "exclamation_count",
    "text_length",
    "capital_letter_ratio",
)


# Combined extractor (TF-IDF + hand-crafted)

class EmailFeatureExtractor:
    """
    Converts emails into numbers using two types of features:

    1. TF-IDF features based on the words in the emails.
    2. Hand-crafted features such as URL count and urgency words.

    First, use fit() to learn from the training emails.
    Then, use transform() to convert emails into numbers.
    """
    def __init__(self, max_features: int = DEFAULT_MAX_TFIDF_FEATURES) -> None:
        """
        Create the extractor. Nothing is learned yet. We need to call fit() first.

        Args:
            max_features: Max number of TF-IDF word features to keep.
        """
        self.max_features = max_features
        self.vectorizer = TfidfVectorizer(
            max_features=max_features,
            stop_words="english",
            ngram_range=(1, 2),  # single words + short phrases like "click here"
            lowercase=True,
        )
        self._is_fitted = False

    def fit(self, texts: Iterable[str]) -> "EmailFeatureExtractor":
        """
        Learn the TF-IDF vocabulary from training emails.

        Args:
            texts: Collection of training email strings.

        Returns:
            self (so you can write extractor.fit(texts).transform(texts)).
        """
        self.vectorizer.fit(list(texts))
        self._is_fitted = True
        return self

    def transform(self, texts: Iterable[str]) -> np.ndarray:
        """
        Convert emails into a 2D feature matrix.

        Args:
            texts: Collection of email strings (one or many).

        Returns:
            2D numpy array of shape (n_emails, n_tfidf + 5).

        Raises:
            RuntimeError: If fit() was never called.
        """
        if not self._is_fitted:
            raise RuntimeError(
                "EmailFeatureExtractor must be fit() before transform(). "
                "Call fit() on your training emails first."
            )

        text_list = list(texts)
        tfidf_matrix = self.vectorizer.transform(text_list).toarray()

        handcrafted = np.vstack(
            [extract_handcrafted_features(t) for t in text_list]
        )

        # Axis 1 = side by side: [tfidf features | handcrafted features]
        return np.hstack([tfidf_matrix, handcrafted])

    def fit_transform(self, texts: Iterable[str]) -> np.ndarray:
        """
        Fit on texts, then transform the same texts (handy when training).

        Args:
            texts: Training email strings.

        Returns:
            2D feature matrix for those emails.
        """
        return self.fit(texts).transform(texts)

    def get_feature_names(self) -> list[str]:
        """
        Return column names matching transform() output order:
        TF-IDF terms first, then hand-crafted features.

        Returns:
            List of length n_tfidf + 5.

        Raises:
            RuntimeError: If fit() was never called.
        """
        if not self._is_fitted:
            raise RuntimeError("Call fit() before get_feature_names().")
        tfidf_names = list(self.vectorizer.get_feature_names_out())
        return tfidf_names + list(HANDCRAFTED_FEATURE_NAMES)