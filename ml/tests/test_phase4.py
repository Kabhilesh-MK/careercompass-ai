"""
CareerCompass — Phase 4 ML Tests (test_phase4.py)
Validates Candidate H Calibration Study, Artifact Separation,
SHAP TreeExplainer Local Additivity, and Model State Immutability.
"""

from pathlib import Path
import json
import joblib
import numpy as np
import pandas as pd
import pytest
shap = pytest.importorskip("shap")

from src.utils.reproducibility import get_base_dir
from src.models.feature_ablation import SkillsOnlyPreprocessor


@pytest.fixture
def base_dir() -> Path:
    return get_base_dir()


@pytest.fixture
def train_df(base_dir) -> pd.DataFrame:
    path = base_dir / "data" / "processed" / "primary" / "train.csv"
    return pd.read_csv(path)


def test_01_candidate_h_locked_model_parameters(base_dir):
    """Verify Candidate H production model artifact preserves locked hyperparameters."""
    model_path = base_dir / "models" / "careercompass_phase3_4_model.joblib"
    meta_path = base_dir / "models" / "careercompass_phase3_4_metadata.json"

    assert model_path.is_file(), "Candidate H model artifact must exist."
    assert meta_path.is_file(), "Phase 3.4 metadata artifact must exist."

    with open(meta_path, "r", encoding="utf-8") as f:
        meta = json.load(f)

    assert meta["candidate_id"] == "Candidate H"
    assert meta["model_type"] == "RandomForestClassifier"
    assert meta["model_parameters"]["n_estimators"] == 300
    assert meta["model_parameters"]["class_weight"] is None
    assert meta["model_parameters"]["random_state"] == 42
    assert meta["n_features"] == 29
    assert meta["n_classes"] == 4

    model = joblib.load(model_path)
    assert model.n_estimators == 300
    assert model.class_weight is None
    assert model.random_state == 42
    assert model.n_features_in_ == 29
    assert len(model.classes_) == 4


def test_02_calibration_study_report_and_csv_exist(base_dir):
    """Verify Phase 4 calibration report and comparison CSV were generated."""
    report_path = base_dir / "reports" / "phase_4_calibration_report.md"
    csv_path = base_dir / "reports" / "phase_4_calibration_comparison.csv"
    fig_path = base_dir / "reports" / "figures" / "phase_4_calibration_reliability.png"

    assert report_path.is_file(), "phase_4_calibration_report.md must exist."
    assert csv_path.is_file(), "phase_4_calibration_comparison.csv must exist."
    assert fig_path.is_file(), "phase_4_calibration_reliability.png must exist."

    df_csv = pd.read_csv(csv_path)
    methods = df_csv["method"].tolist()
    assert "Uncalibrated" in methods
    assert "Sigmoid (Platt)" in methods
    assert "Isotonic" in methods

    with open(report_path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "Final Calibration Decision" in content
    assert "5-Fold Stratified Cross-Validation" in content
    assert "Uncalibrated Candidate H" in content


def test_03_separate_calibration_artifact_created(base_dir):
    """Verify separate calibration post-processing artifact exists without overwriting Candidate H."""
    cal_iso_path = base_dir / "models" / "careercompass_phase4_isotonic_calibrator.joblib"
    assert cal_iso_path.is_file(), "Separate isotonic calibrator artifact must exist."

    # Verify locked production artifact is distinct
    prod_path = base_dir / "models" / "careercompass_phase3_4_model.joblib"
    assert cal_iso_path.resolve() != prod_path.resolve()


def test_04_shap_tree_explainer_local_additivity(base_dir):
    """Verify TreeExplainer satisfies exact additive efficiency property on Candidate H."""
    model_path = base_dir / "models" / "careercompass_phase3_4_model.joblib"
    prep_path = base_dir / "models" / "careercompass_phase3_4_preprocessor.joblib"

    model = joblib.load(model_path)
    prep = joblib.load(prep_path)

    df_sample = pd.DataFrame({"Skills": ["python, ai, programming"]})
    X = prep.transform(df_sample)

    explainer = shap.TreeExplainer(model)
    shap_vals = explainer.shap_values(X)
    probs = model.predict_proba(X)[0]

    # For each class, base value + sum(shap_vals) must equal predict_proba
    for c_idx in range(len(model.classes_)):
        expected_prob = probs[c_idx]
        base_val = explainer.expected_value[c_idx] if isinstance(explainer.expected_value, (list, np.ndarray)) else explainer.expected_value
        sum_shap = np.sum(shap_vals[0, :, c_idx])
        decomposed_prob = base_val + sum_shap
        np.testing.assert_allclose(
            decomposed_prob,
            expected_prob,
            rtol=1e-5,
            atol=1e-5,
            err_msg=f"SHAP local additivity failed for class {model.classes_[c_idx]}",
        )


def test_05_explanation_vocabulary_consistency(base_dir):
    """Verify feature attribution uses the exact 29-feature vocabulary."""
    prep_path = base_dir / "models" / "careercompass_phase3_4_preprocessor.joblib"
    prep = joblib.load(prep_path)

    vocab = sorted(list(prep.encoder.vocabulary_))
    assert len(vocab) == 29
    assert "python" in vocab
    assert "ai" in vocab
    assert "programming" in vocab
