"""
Automated ML Artifact Integrity Verification for CareerCompass (Phase 7).

Verifies the integrity of the locked Candidate H Random Forest model,
preprocessor, and metadata. Fails if any attribute, hyperparameter,
dimension, vocabulary, or class label drifts or mutates.
"""

import json
from pathlib import Path
import joblib
import pytest
from sklearn.ensemble import RandomForestClassifier

from app.config import settings

EXPECTED_FAMILY = "RandomForestClassifier"
EXPECTED_N_ESTIMATORS = 300
EXPECTED_CLASS_WEIGHT = None
EXPECTED_RANDOM_STATE = 42
EXPECTED_N_FEATURES = 29
EXPECTED_CLASSES = [
    "AI & Machine Learning Engineering",
    "Cloud, DevOps & Systems Engineering",
    "Data Analytics & Business Intelligence",
    "Software Development & Engineering",
]
EXPECTED_VOCABULARY = [
    "ai",
    "autocad",
    "cad",
    "cloud",
    "communication",
    "critical_thinking",
    "data_analysis",
    "database_design",
    "database_systems",
    "design",
    "design_optimization",
    "excel",
    "experimentation",
    "lab_work",
    "machine_learning",
    "matlab",
    "negotiation",
    "observation",
    "plc",
    "power_analysis",
    "programming",
    "pscad",
    "python",
    "recording",
    "research",
    "sales",
    "simulation",
    "team_management",
    "web_development",
]


def test_artifact_files_exist():
    """Verify that model, preprocessor, and metadata files exist on disk."""
    model_path = settings.ml_model_path
    preprocessor_path = settings.ml_preprocessor_path
    metadata_path = settings.ml_metadata_path

    assert model_path.exists(), f"Model artifact missing at {model_path}"
    assert preprocessor_path.exists(), f"Preprocessor artifact missing at {preprocessor_path}"
    assert metadata_path.exists(), f"Metadata artifact missing at {metadata_path}"


def test_metadata_integrity():
    """Verify metadata json strictly matches locked specification."""
    with open(settings.ml_metadata_path, "r", encoding="utf-8") as f:
        meta = json.load(f)

    assert meta.get("candidate_id") == "Candidate H"
    assert meta.get("model_type") == EXPECTED_FAMILY
    assert meta.get("n_features") == EXPECTED_N_FEATURES
    assert meta.get("class_labels") == EXPECTED_CLASSES
    assert meta.get("n_classes") == 4
    assert meta.get("model_parameters", {}).get("n_estimators") == EXPECTED_N_ESTIMATORS
    assert meta.get("model_parameters", {}).get("random_state") == EXPECTED_RANDOM_STATE
    assert meta.get("model_parameters", {}).get("class_weight") is EXPECTED_CLASS_WEIGHT


def test_model_hyperparameters_and_attributes():
    """Verify loaded scikit-learn model object satisfies locked specifications."""
    model = joblib.load(settings.ml_model_path)

    assert isinstance(model, RandomForestClassifier), f"Expected RandomForestClassifier, got {type(model)}"
    assert model.__class__.__name__ == EXPECTED_FAMILY
    assert model.n_estimators == EXPECTED_N_ESTIMATORS
    assert model.class_weight is EXPECTED_CLASS_WEIGHT
    assert model.random_state == EXPECTED_RANDOM_STATE
    assert model.n_features_in_ == EXPECTED_N_FEATURES
    assert list(model.classes_) == EXPECTED_CLASSES
    assert len(model.estimators_) == EXPECTED_N_ESTIMATORS


def test_preprocessor_vocabulary_integrity():
    """Verify preprocessor vocabulary contains the exact 29 canonical skills."""
    preprocessor = joblib.load(settings.ml_preprocessor_path)
    assert hasattr(preprocessor, "is_fitted_") and preprocessor.is_fitted_ is True

    # Encoder vocabulary check
    vocab = getattr(preprocessor.encoder, "vocabulary_", None)
    assert vocab is not None, "Preprocessor encoder missing vocabulary_"
    assert len(vocab) == EXPECTED_N_FEATURES

    # Extract vocabulary tokens (handling both raw token and prefix formats)
    clean_tokens = sorted([v.replace("skill_", "") for v in vocab])
    assert clean_tokens == EXPECTED_VOCABULARY, (
        f"Vocabulary mismatch. Difference: {set(clean_tokens) ^ set(EXPECTED_VOCABULARY)}"
    )
