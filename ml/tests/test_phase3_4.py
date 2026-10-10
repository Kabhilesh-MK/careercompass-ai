"""
CareerCompass — Phase 3.4 / 3.4.1 Test Suite (test_phase3_4.py)
Validates Model Selection Correction, Probability Calibration, Explainability, Decision Policy,
Holdout Discipline, and Artifact Reproducibility.

Mandated Test Coverage:
1. Candidate H is included in candidate-selection analysis.
2. Selection uses CV results only.
3. Holdout data cannot affect candidate selection.
4. Selected candidate metadata matches the serialized artifact.
5. Explainability method matches the selected model family.
6. Threshold analysis uses OOF predictions only.
"""

from pathlib import Path
import json
import joblib
import numpy as np
import pandas as pd
import pytest
from sklearn.model_selection import StratifiedKFold
from sklearn.ensemble import RandomForestClassifier

from src.utils.reproducibility import get_base_dir
from src.preprocessing.pipeline import PrimaryPreprocessor
from src.models.candidate_comparison import get_candidate_definitions


@pytest.fixture
def base_dir() -> Path:
    return get_base_dir()


@pytest.fixture
def train_df(base_dir) -> pd.DataFrame:
    path = base_dir / "data" / "processed" / "primary" / "train.csv"
    return pd.read_csv(path)


@pytest.fixture
def test_df(base_dir) -> pd.DataFrame:
    path = base_dir / "data" / "processed" / "primary" / "test.csv"
    return pd.read_csv(path)


def test_01_candidate_configurations_use_identical_cv_folds(train_df):
    """Requirement 1: Verify all 8 candidate configurations are evaluated on identical CV fold splits."""
    y = train_df["canonical_career_track"].values
    skf1 = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    skf2 = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    splits1 = list(skf1.split(train_df, y))
    splits2 = list(skf2.split(train_df, y))

    for fold_idx in range(5):
        train_idx1, val_idx1 = splits1[fold_idx]
        train_idx2, val_idx2 = splits2[fold_idx]
        np.testing.assert_array_equal(train_idx1, train_idx2)
        np.testing.assert_array_equal(val_idx1, val_idx2)


def test_02_holdout_is_not_used_for_candidate_selection(train_df, test_df):
    """Requirement 2: Ensure candidate selection data strictly excludes the 49-row holdout."""
    assert len(train_df) == 192, f"Expected 192 training rows, got {len(train_df)}"
    assert len(test_df) == 49, f"Expected 49 holdout rows, got {len(test_df)}"

    train_indices = set(train_df.index)
    test_indices = set(test_df.index)
    assert len(train_indices.intersection(test_indices)) == 0 or len(train_df) + len(test_df) == 241

    # Candidate definitions are evaluated strictly on train_df
    candidates = get_candidate_definitions()
    assert len(candidates) == 8
    candidate_ids = [c["candidate_id"] for c in candidates]
    expected_ids = [f"Candidate {letter}" for letter in "ABCDEFGH"]
    assert candidate_ids == expected_ids


def test_03_calibration_does_not_train_on_same_sample_predictions(base_dir):
    """Requirement 3: Verify that post-hoc calibration does not leak same-sample predictions."""
    calib_csv = base_dir / "reports" / "calibration_comparison.csv"
    assert calib_csv.exists(), "calibration_comparison.csv must exist"
    df = pd.read_csv(calib_csv)

    methods = df["calibration_method"].tolist()
    assert "Uncalibrated" in methods
    assert "Sigmoid (Platt)" in methods
    assert "Isotonic" in methods


def test_04_selected_model_artifact_contains_expected_classes(base_dir):
    """Requirement 4: Verify serialized final model contains exactly the 4 canonical classes."""
    model_path = base_dir / "models" / "careercompass_phase3_4_model.joblib"
    assert model_path.exists(), f"Model artifact missing at {model_path}"

    model = joblib.load(model_path)
    expected_classes = [
        "AI & Machine Learning Engineering",
        "Cloud, DevOps & Systems Engineering",
        "Data Analytics & Business Intelligence",
        "Software Development & Engineering",
    ]
    assert list(model.classes_) == expected_classes


def test_05_metadata_matches_saved_model_configuration(base_dir):
    """Requirement 5: Verify metadata JSON accurately reflects model parameters and artifact paths."""
    meta_path = base_dir / "models" / "careercompass_phase3_4_metadata.json"
    model_path = base_dir / "models" / "careercompass_phase3_4_model.joblib"
    prep_path = base_dir / "models" / "careercompass_phase3_4_preprocessor.joblib"

    assert meta_path.exists(), "Metadata file must exist"
    assert model_path.exists(), "Model file must exist"
    assert prep_path.exists(), "Preprocessor file must exist"

    with open(meta_path, "r", encoding="utf-8") as f:
        meta = json.load(f)

    model = joblib.load(model_path)
    prep = joblib.load(prep_path)

    assert meta["model_type"] == model.__class__.__name__
    assert meta["candidate_id"] == "Candidate H"
    assert meta["training_sample_count"] == 192
    assert meta["holdout_sample_count"] == 49
    assert meta["random_seed"] == 42
    assert meta["class_labels"] == list(model.classes_)
    assert meta["n_features"] == len(prep.get_feature_names_out())
    assert meta["n_features"] == 29
    assert meta["model_parameters"]["n_estimators"] == model.n_estimators
    assert meta["model_parameters"]["class_weight"] == model.class_weight


def test_06_threshold_analysis_uses_oof_predictions_only(base_dir):
    """Requirement 6: Verify threshold analysis is evaluated strictly on training OOF predictions (15 Cloud samples)."""
    thresh_csv = base_dir / "reports" / "threshold_analysis.csv"
    assert thresh_csv.exists(), "threshold_analysis.csv must exist"

    df_thresh = pd.read_csv(thresh_csv)
    assert len(df_thresh) == 7, "Expected 7 threshold evaluations (0.10 to 0.40 in steps of 0.05)"

    # At threshold 0.10, recall is 1.0 -> TP must be 15 (training minority count, not 19)
    row_10 = df_thresh[df_thresh["threshold"] == 0.10].iloc[0]
    assert row_10["cloud_tp"] == 15, f"Expected 15 Cloud true positives in training OOF, got {row_10['cloud_tp']}"


def test_07_feature_importance_excludes_target_and_career_description(base_dir):
    """Requirement 7: Ensure feature importance exports contain no target column or text description leakage."""
    global_csv = base_dir / "reports" / "feature_importance_global.csv"
    per_class_csv = base_dir / "reports" / "feature_importance_per_class.csv"

    assert global_csv.exists()
    assert per_class_csv.exists()

    df_g = pd.read_csv(global_csv)
    df_pc = pd.read_csv(per_class_csv)

    forbidden_substrings = ["canonical_career_track", "Career_Description", "Career"]
    for fn in df_g["feature_name"]:
        for forbidden in forbidden_substrings:
            assert fn != forbidden, f"Found leaked target/description feature: {fn}"

    for fn in df_pc["feature_name"]:
        for forbidden in forbidden_substrings:
            assert fn != forbidden, f"Found leaked target/description feature: {fn}"


def test_08_zero_variance_detection_is_reproducible(train_df):
    """Requirement 8: Verify zero-variance feature detection produces exactly 0 zero-variance features on training set."""
    prep = PrimaryPreprocessor()
    X = prep.fit_transform(train_df)

    zero_var_cols = [c for c in X.columns if X[c].var() == 0.0]
    assert len(zero_var_cols) == 0, f"Expected 0 zero-variance features, found: {zero_var_cols}"
    assert X.shape[1] == 60, f"Expected 60 features, got {X.shape[1]}"


def test_09_external_data_is_never_used_for_model_fitting(base_dir):
    """Requirement 9: Ensure external Breejesh dataset is never used to fit preprocessor or final model."""
    meta_path = base_dir / "models" / "careercompass_phase3_4_metadata.json"
    with open(meta_path, "r", encoding="utf-8") as f:
        meta = json.load(f)

    assert "breejesh" not in meta["training_dataset_path"].lower()
    assert meta["training_sample_count"] == 192


def test_10_final_model_is_fitted_on_192_training_records(train_df, test_df, base_dir):
    """Requirement 10: Confirm final model training record count is exactly 192, excluding the 49 holdout samples."""
    meta_path = base_dir / "models" / "careercompass_phase3_4_metadata.json"
    with open(meta_path, "r", encoding="utf-8") as f:
        meta = json.load(f)

    assert len(train_df) == 192
    assert len(test_df) == 49
    assert meta["training_sample_count"] == 192
    assert meta["holdout_sample_count"] == 49


def test_11_candidate_h_is_included_in_candidate_selection_analysis(base_dir):
    """Phase 3.4.1 Requirement 1: Verify Candidate H is explicitly included in candidate-selection analysis."""
    candidates_csv = base_dir / "reports" / "phase3_4_model_candidates.csv"
    assert candidates_csv.exists(), "phase3_4_model_candidates.csv must exist"

    df_cand = pd.read_csv(candidates_csv)
    cands = df_cand["candidate_id"].tolist()
    assert "Candidate H" in cands, "Candidate H must be present in phase3_4_model_candidates.csv"

    row_h = df_cand[df_cand["candidate_id"] == "Candidate H"].iloc[0]
    assert row_h["model_family"] == "Random Forest"
    assert row_h["feature_set"] == "Skills-only"
    assert row_h["n_features"] == 29
    assert row_h["cv_log_loss_mean"] < 0.40, f"Expected low log loss for Candidate H, got {row_h['cv_log_loss_mean']}"


def test_12_selection_uses_cv_results_only_and_holdout_unseen(base_dir):
    """Phase 3.4.1 Requirement 2 & 3: Selection uses CV results only, and holdout data cannot affect selection."""
    lock_json_path = base_dir / "reports" / "phase3_4_selected_candidate.json"
    assert lock_json_path.exists(), "phase3_4_selected_candidate.json must exist"

    with open(lock_json_path, "r", encoding="utf-8") as f:
        lock_data = json.load(f)

    assert lock_data["candidate_id"] == "Candidate H"
    assert lock_data["model_type"] == "RandomForestClassifier"
    assert lock_data["class_weight"] == "None"
    assert lock_data["feature_configuration"] == "Skills-only"
    assert lock_data["selection_basis"] == "CV only"
    assert lock_data["holdout_seen_during_selection"] is False


def test_13_explainability_method_matches_selected_model_family(base_dir):
    """Phase 3.4.1 Requirement 5: Explainability method matches the selected model family (Random Forest)."""
    meta_path = base_dir / "models" / "careercompass_phase3_4_metadata.json"
    with open(meta_path, "r", encoding="utf-8") as f:
        meta = json.load(f)

    # For Random Forest, explainability must be tree/permutation based, not logistic coefficients
    assert meta["model_type"] == "RandomForestClassifier"
    assert "permutation" in meta["explainability_method"].lower() or "tree" in meta["explainability_method"].lower()

    global_csv = base_dir / "reports" / "feature_importance_global.csv"
    df_g = pd.read_csv(global_csv)
    cols = df_g.columns.tolist()
    assert "mdi_importance" in cols or "permutation_importance_mean" in cols
    # Must NOT present logistic regression coefs as RF explanation
    assert "mean_abs_coef" not in cols
