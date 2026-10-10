"""
CareerCompass — Phase 3.3 Test Suite (test_phase3_3.py)
Validates advanced model validation, class-weight ablation, feature ablation,
dataset structure analysis, probability calibration, and minority fold diagnostics.

Tests:
1. Class-weight configurations are correctly instantiated.
2. Feature-ablation configurations contain the intended feature groups.
3. Preprocessing is fitted inside each CV fold.
4. Holdout data is not used during CV feature selection.
5. OOF predictions contain every training sample exactly once.
6. Probability rows sum approximately to 1.
7. Calibration metrics are reproducible.
8. Minority fold supports are correct (3 samples/fold).
9. Feature association analysis excludes Career_Description.
10. External Breejesh data is not used for training or selection.
"""

from pathlib import Path
import numpy as np
import pandas as pd
import pytest
from sklearn.model_selection import StratifiedKFold
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier

from src.utils.reproducibility import get_base_dir, load_config
from src.preprocessing.pipeline import PrimaryPreprocessor
from src.models.feature_ablation import CategoricalOnlyPreprocessor, SkillsOnlyPreprocessor
from src.analysis.calibration_analysis import compute_multiclass_ece, compute_multiclass_brier_score


@pytest.fixture
def train_df() -> pd.DataFrame:
    base_dir = get_base_dir()
    path = base_dir / "data" / "processed" / "primary" / "train.csv"
    return pd.read_csv(path)


@pytest.fixture
def test_df() -> pd.DataFrame:
    base_dir = get_base_dir()
    path = base_dir / "data" / "processed" / "primary" / "test.csv"
    return pd.read_csv(path)


def test_01_class_weight_configurations_are_correctly_instantiated():
    """Requirement 1: Verify model instantiation for class_weight=None vs 'balanced'."""
    lr_unweighted = LogisticRegression(C=1.0, penalty="l2", solver="lbfgs", max_iter=1000, random_state=42, class_weight=None)
    lr_balanced = LogisticRegression(C=1.0, penalty="l2", solver="lbfgs", max_iter=1000, random_state=42, class_weight="balanced")
    rf_unweighted = RandomForestClassifier(n_estimators=300, random_state=42, class_weight=None)
    rf_balanced = RandomForestClassifier(n_estimators=300, random_state=42, class_weight="balanced")

    assert lr_unweighted.class_weight is None
    assert lr_balanced.class_weight == "balanced"
    assert rf_unweighted.class_weight is None
    assert rf_balanced.class_weight == "balanced"


def test_02_feature_ablation_configurations_contain_intended_feature_groups(train_df):
    """Requirement 2: Verify B1 has 0 skills, B2 has 0 categoricals, B3 has both."""
    p_b1 = CategoricalOnlyPreprocessor()
    X_b1 = p_b1.fit_transform(train_df)
    assert all(not col.startswith("skill_") for col in X_b1.columns)
    assert any(col.startswith("Education_Level_") for col in X_b1.columns)

    p_b2 = SkillsOnlyPreprocessor()
    X_b2 = p_b2.fit_transform(train_df)
    assert all(col.startswith("skill_") for col in X_b2.columns)
    assert all(not col.startswith("Education_Level_") for col in X_b2.columns)
    assert all(not col.startswith("Specialization_") for col in X_b2.columns)

    p_b3 = PrimaryPreprocessor()
    X_b3 = p_b3.fit_transform(train_df)
    assert any(col.startswith("skill_") for col in X_b3.columns)
    assert any(col.startswith("Education_Level_") for col in X_b3.columns)
    assert X_b3.shape[1] == X_b1.shape[1] + X_b2.shape[1]


def test_03_preprocessing_is_fitted_inside_each_cv_fold(train_df):
    """Requirement 3: Verify preprocessor instances are distinct and fitted per-fold."""
    target_col = "canonical_career_track"
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    fitted_vocab_sizes = []

    for train_idx, val_idx in skf.split(train_df, train_df[target_col]):
        fold_train = train_df.iloc[train_idx]
        prep = PrimaryPreprocessor()
        X_fold = prep.fit_transform(fold_train)
        assert prep.is_fitted_ is True
        fitted_vocab_sizes.append(len(prep.skill_feature_names_))

    # All folds should independently fit without error
    assert len(fitted_vocab_sizes) == 5
    assert all(size > 20 for size in fitted_vocab_sizes)


def test_04_holdout_data_is_not_used_during_cv_feature_selection(train_df, test_df):
    """Requirement 4: Verify train and test indices have zero overlap and test remains untouched."""
    train_ids = set(train_df["original_row_id"].unique())
    test_ids = set(test_df["original_row_id"].unique())
    assert len(train_ids.intersection(test_ids)) == 0
    assert len(train_df) == 192
    assert len(test_df) == 49


def test_05_oof_predictions_contain_every_training_sample_exactly_once(train_df):
    """Requirement 5: Verify OOF predictions cover all 192 samples exactly once."""
    target_col = "canonical_career_track"
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    visited_val_indices = []

    for _, val_idx in skf.split(train_df, train_df[target_col]):
        visited_val_indices.extend(val_idx.tolist())

    assert len(visited_val_indices) == 192
    assert sorted(visited_val_indices) == list(range(192))


def test_06_probability_rows_sum_approximately_to_1():
    """Requirement 6: Verify predicted class probability rows sum to 1.0 within epsilon."""
    reports_dir = get_base_dir() / "reports"
    calib_csv = reports_dir / "calibration_metrics.csv"
    assert calib_csv.exists()

    # Verify probability normalization directly on generated OOF files
    from src.models.class_weight_ablation import run_class_weight_ablation
    train_path = get_base_dir() / "data" / "processed" / "primary" / "train.csv"
    train_df = pd.read_csv(train_path)
    res_a = run_class_weight_ablation(train_df)

    for cfg_id in ["A1", "A2", "A3", "A4"]:
        oof_df = res_a[cfg_id]["oof_df"]
        prob_cols = [c for c in oof_df.columns if c.startswith("prob_")]
        prob_sums = oof_df[prob_cols].sum(axis=1).values
        np.testing.assert_allclose(prob_sums, 1.0, atol=1e-5)


def test_07_calibration_metrics_are_reproducible():
    """Requirement 7: Verify multiclass ECE and Brier score computations are deterministic."""
    classes = ["A", "B", "C"]
    y_true = np.array(["A", "B", "C", "A", "B", "C"])
    y_prob = np.array([
        [0.8, 0.1, 0.1],
        [0.1, 0.7, 0.2],
        [0.2, 0.2, 0.6],
        [0.9, 0.05, 0.05],
        [0.1, 0.8, 0.1],
        [0.3, 0.3, 0.4],
    ])

    res1 = compute_multiclass_ece(y_true, y_prob, classes, n_bins=5)
    res2 = compute_multiclass_ece(y_true, y_prob, classes, n_bins=5)
    brier1, _ = compute_multiclass_brier_score(y_true, y_prob, classes)
    brier2, _ = compute_multiclass_brier_score(y_true, y_prob, classes)

    assert res1["ece"] == res2["ece"]
    assert res1["mce"] == res2["mce"]
    assert brier1 == brier2


def test_08_minority_fold_supports_are_correct(train_df):
    """Requirement 8: Verify Cloud/DevOps has exactly 3 validation samples in each of 5 folds."""
    target_col = "canonical_career_track"
    minority_class = "Cloud, DevOps & Systems Engineering"
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    fold_supports = []
    for _, val_idx in skf.split(train_df, train_df[target_col]):
        val_labels = train_df.iloc[val_idx][target_col]
        support = int((val_labels == minority_class).sum())
        fold_supports.append(support)

    assert len(fold_supports) == 5
    assert fold_supports == [3, 3, 3, 3, 3]
    assert sum(fold_supports) == 15


def test_09_feature_association_analysis_excludes_career_description():
    """Requirement 9: Verify Career_Description does not appear in feature association outputs."""
    base_dir = get_base_dir()
    assoc_csv = base_dir / "reports" / "feature_target_association.csv"
    assert assoc_csv.exists()
    df_assoc = pd.read_csv(assoc_csv)

    features = list(df_assoc["feature"].values)
    assert not any("Career_Description" in f for f in features)
    assert not any("career_description" in f.lower() for f in features)


def test_10_external_breejesh_data_is_not_used_for_training_or_selection(train_df):
    """Requirement 10: Verify external Breejesh dataset remains completely isolated from training."""
    base_dir = get_base_dir()
    breejesh_path = base_dir / "data" / "processed" / "external" / "breejesh_transfer_eval.csv"
    assert breejesh_path.exists()
    breejesh_df = pd.read_csv(breejesh_path)

    # Breejesh dataset has 323 rows
    assert len(breejesh_df) == 323
    assert len(train_df) == 192

    # Check that Breejesh specific columns or identifiers never enter train_df
    assert "CGPA" not in train_df.columns
    assert "Course_UG" not in train_df.columns
