"""Career prediction engine.

Loads the saved best model and preprocessor on first use (lazy singleton).
Exposes predict() which returns:
  • predicted_career (str)
  • confidence (float 0–100)
  • top_5_careers (list of {career, probability})
"""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

import joblib
import numpy as np
from loguru import logger

from ml.utils.paths import ENCODER_PATH, METRICS_PATH, MODEL_PATH, SAVED_MODELS_DIR
from ml.preprocessing.preprocessor import PREPROCESSOR_PATH, transform_input


# ---------------------------------------------------------------------------
# Artifact loading — cached singletons
# ---------------------------------------------------------------------------

@lru_cache(maxsize=1)
def _load_model() -> Any:
    if not MODEL_PATH.exists():
        _auto_train()
    logger.info(f"Loading model from {MODEL_PATH}")
    return joblib.load(MODEL_PATH)


@lru_cache(maxsize=1)
def _load_label_encoder() -> Any:
    if not ENCODER_PATH.exists():
        _auto_train()
    return joblib.load(ENCODER_PATH)


@lru_cache(maxsize=1)
def _load_preprocessor() -> Any:
    if not PREPROCESSOR_PATH.exists():
        _auto_train()
    return joblib.load(PREPROCESSOR_PATH)


@lru_cache(maxsize=1)
def _load_metrics() -> dict[str, Any]:
    if METRICS_PATH.exists():
        with METRICS_PATH.open() as fh:
            return json.load(fh)
    return {}


def _auto_train() -> None:
    """Trigger the full training pipeline if saved artifacts are missing."""
    logger.warning("Saved ML artifacts not found — running training pipeline …")
    from ml.training.run_training import run
    run()
    # Bust LRU caches so freshly-written files are loaded
    _load_model.cache_clear()
    _load_label_encoder.cache_clear()
    _load_preprocessor.cache_clear()
    _load_metrics.cache_clear()


def reload_artifacts() -> None:
    """Force-reload all cached ML artifacts (useful after retraining)."""
    _load_model.cache_clear()
    _load_label_encoder.cache_clear()
    _load_preprocessor.cache_clear()
    _load_metrics.cache_clear()
    logger.info("ML artifact caches cleared — will reload on next predict().")


# ---------------------------------------------------------------------------
# Prediction
# ---------------------------------------------------------------------------

def predict(profile: dict[str, Any]) -> dict[str, Any]:
    """Predict career for a student profile dict.

    Parameters
    ----------
    profile:
        Dict with skill scores and profile features matching the training
        feature set (missing keys default to 0).

    Returns
    -------
    dict with keys:
        predicted_career, confidence, top_5_careers, model_name, metrics_summary
    """
    model = _load_model()
    le = _load_label_encoder()
    preprocessor = _load_preprocessor()

    X = transform_input(profile, preprocessor=preprocessor)

    # Probability vector
    if hasattr(model, "predict_proba"):
        proba = model.predict_proba(X)[0]
    else:
        # For models without predict_proba (e.g. SVM with default settings)
        pred_idx = model.predict(X)[0]
        proba = np.zeros(len(le.classes_))
        proba[pred_idx] = 1.0

    # Map class indices to career names
    career_proba: list[dict[str, Any]] = [
        {"career": le.classes_[i], "probability": round(float(p) * 100, 2)}
        for i, p in enumerate(proba)
    ]
    career_proba.sort(key=lambda x: x["probability"], reverse=True)

    predicted_career: str = career_proba[0]["career"]
    confidence: float = career_proba[0]["probability"]

    metrics = _load_metrics()

    return {
        "predicted_career": predicted_career,
        "confidence": confidence,
        "top_5_careers": career_proba[:5],
        "all_predictions": career_proba,
        "model_name": metrics.get("production_model", metrics.get("best_model", "Unknown")),
        "model_accuracy": (
            metrics.get("test_metrics", {}).get("accuracy")
            if isinstance(metrics.get("test_metrics"), dict)
            else metrics.get("best_test_accuracy", 0.0)
        ),
    }
