"""Tests for model artifact loading, compatibility verification, and lifecycle guarantees."""

from pathlib import Path
from unittest.mock import MagicMock
import pytest

from app.config import settings
from app.services.model_service import (
    ModelService,
    EXPECTED_MODEL_FAMILY,
    EXPECTED_N_ESTIMATORS,
    EXPECTED_CLASS_WEIGHT,
    EXPECTED_RANDOM_STATE,
    EXPECTED_FEATURE_COUNT,
)
from app.utils.errors import ModelArtifactError, ModelCompatibilityError


def test_03_model_loads_successfully(initialize_model_service):
    """Test 3: Model loads and satisfies locked Candidate H hyperparameters."""
    svc = initialize_model_service
    assert svc.model is not None
    assert svc.model.__class__.__name__ == EXPECTED_MODEL_FAMILY
    assert svc.model.n_estimators == EXPECTED_N_ESTIMATORS
    assert svc.model.class_weight == EXPECTED_CLASS_WEIGHT
    assert svc.model.random_state == EXPECTED_RANDOM_STATE
    assert svc.model.n_features_in_ == EXPECTED_FEATURE_COUNT


def test_04_preprocessor_loads_successfully(initialize_model_service):
    """Test 4: Preprocessor loads and confirms fitted state with MultiHotSkillEncoder."""
    svc = initialize_model_service
    assert svc.preprocessor is not None
    assert svc.preprocessor.is_fitted_ is True
    assert hasattr(svc.preprocessor, "encoder")
    assert len(svc.preprocessor.encoder.vocabulary_) == EXPECTED_FEATURE_COUNT


def test_05_metadata_loads_successfully(initialize_model_service):
    """Test 5: Metadata loads successfully and reflects Candidate H properties."""
    svc = initialize_model_service
    metadata = svc.get_metadata()
    assert metadata is not None
    assert metadata.get("candidate_id") == "Candidate H"
    assert metadata.get("n_features") == 29
    assert len(metadata.get("class_labels", [])) == 4


def test_06_skill_vocabulary_contains_exact_29_dimensions(initialize_model_service):
    """Test 6: Skill vocabulary contains exactly 29 unique dimensions in canonical order."""
    svc = initialize_model_service
    vocab = svc.get_canonical_vocabulary()
    assert len(vocab) == 29
    assert len(set(vocab)) == 29
    assert vocab == sorted(vocab), "Skill vocabulary must be sorted deterministically."
    # Spot-check canonical technical skills
    for expected_skill in ["python", "ai", "programming", "cloud", "data_analysis", "web_development"]:
        assert expected_skill in vocab


def test_19_model_info_matches_metadata(client, initialize_model_service):
    """Test 19: /api/v1/model/info accurately reflects loaded metadata without exposing paths."""
    response = client.get("/api/v1/model/info")
    assert response.status_code == 200
    info = response.json()

    meta = initialize_model_service.get_metadata()
    assert info["model_version"] == "phase3.4"
    assert info["model_type"] == meta["model_type"]
    assert info["feature_configuration"] == "skills-only"
    assert info["feature_count"] == 29
    assert info["classes"] == meta["class_labels"]
    assert info["training_samples"] == meta["training_sample_count"]
    assert info["calibration"] == "uncalibrated"
    assert info["threshold_policy"] == "argmax"

    # Security check: Ensure internal file paths are never exposed in model info
    serialized_info = str(info)
    assert "C:\\" not in serialized_info
    assert "/Users/" not in serialized_info
    assert ".joblib" not in serialized_info


def test_20_model_artifacts_loaded_only_once(initialize_model_service):
    """Test 20: Model artifacts are loaded strictly once and subsequent calls do not re-read."""
    svc = initialize_model_service
    initial_model = svc.model
    initial_preprocessor = svc.preprocessor

    # Calling load_artifacts without force_reload should be a no-op
    svc.load_artifacts()
    assert svc.model is initial_model
    assert svc.preprocessor is initial_preprocessor


def test_21_inference_does_not_call_model_fit(initialize_model_service):
    """Test 21: Model inference strictly forbids calling model.fit()."""
    svc = initialize_model_service
    # Attach a spy mock on model.fit
    original_fit = svc.model.fit
    mock_fit = MagicMock()
    svc.model.fit = mock_fit

    try:
        svc.predict_proba("python, programming, ai")
        assert not mock_fit.called, "model.fit() must NEVER be called during inference."
    finally:
        svc.model.fit = original_fit


def test_22_inference_does_not_call_preprocessor_fit(initialize_model_service):
    """Test 22: Preprocessor inference strictly forbids calling preprocessor.fit() or fit_transform()."""
    svc = initialize_model_service
    original_fit = svc.preprocessor.fit
    original_fit_transform = svc.preprocessor.fit_transform
    mock_fit = MagicMock()
    mock_fit_transform = MagicMock()

    svc.preprocessor.fit = mock_fit
    svc.preprocessor.fit_transform = mock_fit_transform

    try:
        svc.predict_proba("python, programming, ai")
        assert not mock_fit.called, "preprocessor.fit() must NEVER be called during inference."
        assert not mock_fit_transform.called, "preprocessor.fit_transform() must NEVER be called during inference."
    finally:
        svc.preprocessor.fit = original_fit
        svc.preprocessor.fit_transform = original_fit_transform


def test_compatibility_validation_failure_on_missing_file():
    """Test that missing artifact files raise ModelArtifactError during startup."""
    service = ModelService()
    missing_path = Path("non_existent_model_12345.joblib")
    with pytest.raises(ModelArtifactError) as exc_info:
        service.load_artifacts(model_path=missing_path)
    assert "not found" in str(exc_info.value).lower()
