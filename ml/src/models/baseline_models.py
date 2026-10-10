"""
CareerCompass — Baseline Model Factory (Phase 3.2)
Provides standardized, un-tuned baseline estimators for multi-class career classification:
1. Dummy Classifier (Prior baseline)
2. Multinomial Logistic Regression (L2-regularized linear baseline)
3. Random Forest Classifier (Balanced non-linear ensemble baseline)
"""

from typing import Dict, Any
from sklearn.dummy import DummyClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier


def get_dummy_classifier(strategy: str = "prior", random_state: int = 42) -> DummyClassifier:
    """
    Returns a Dummy baseline classifier predicting empirical prior probabilities.
    """
    return DummyClassifier(strategy=strategy, random_state=random_state)


def get_logistic_regression(
    C: float = 1.0,
    max_iter: int = 1000,
    random_state: int = 42,
    class_weight: str = None,
) -> LogisticRegression:
    """
    Returns an L2-regularized Multinomial Logistic Regression classifier.
    Solver 'lbfgs' natively supports multinomial log-loss.
    """
    return LogisticRegression(
        C=C,
        penalty="l2",
        solver="lbfgs",
        max_iter=max_iter,
        random_state=random_state,
        class_weight=class_weight,
    )


def get_random_forest(
    n_estimators: int = 300,
    class_weight: str = "balanced",
    random_state: int = 42,
    max_depth: int = None,
) -> RandomForestClassifier:
    """
    Returns a Random Forest non-linear baseline ensemble with balanced class weighting.
    """
    return RandomForestClassifier(
        n_estimators=n_estimators,
        class_weight=class_weight,
        random_state=random_state,
        max_depth=max_depth,
        n_jobs=-1,
    )


def get_model_by_name(name: str, random_state: int = 42) -> Any:
    """Factory helper to instantiate baseline models by string identifier."""
    name_clean = name.lower().replace(" ", "_").replace("-", "_")
    if "dummy" in name_clean:
        return get_dummy_classifier(random_state=random_state)
    elif "logistic" in name_clean:
        return get_logistic_regression(random_state=random_state)
    elif "forest" in name_clean or "rf" in name_clean:
        return get_random_forest(random_state=random_state)
    else:
        raise ValueError(f"Unknown model name: {name}")
