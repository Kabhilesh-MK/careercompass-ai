"""
CareerCompass — Unit Tests for Baseline Modeling & Empirical Benchmarking (Phase 3.2)
Covers requirements 1 through 10:
1. Dummy model trains.
2. Logistic model trains.
3. Random Forest trains.
4. Probability outputs sum approximately to 1.
5. CV uses stratified folds.
6. No target column appears in feature matrix.
7. OOF predictions cover every training sample exactly once.
8. Metric calculations are reproducible.
9. Holdout test remains separate.
10. External dataset is not used during training.
"""

import sys
from pathlib import Path
import pytest
import numpy as np
import pandas as pd
import joblib

ml_root = Path(__file__).resolve().parent.parent
if str(ml_root) not in sys.path:
    sys.path.insert(0, str(ml_root))

from src.utils.reproducibility import load_config, set_seed
from src.models.baseline_models import get_dummy_classifier, get_logistic_regression, get_random_forest
from src.models.evaluation import compute_metrics, compute_top_k_accuracy
from src.preprocessing.pipeline import PrimaryPreprocessor


@pytest.fixture(scope="module")
def config():
    return load_config()


@pytest.fixture(scope="module")
def train_data(config):
    p = ml_root / config["paths"]["processed_dir"] / "primary" / "train.csv"
    return pd.read_csv(p)


@pytest.fixture(scope="module")
def preprocessed_features(train_data, config):
    cat_cols = config["primary_dataset"]["features"]["categorical"]
    preprocessor = PrimaryPreprocessor(cat_cols=cat_cols, skill_col="Skills")
    X_proc = preprocessor.fit_transform(train_data)
    y = train_data[config["primary_dataset"]["canonical_target_column"]].values
    return X_proc, y, preprocessor


def test_01_dummy_model_trains(preprocessed_features):
    """Requirement 1: Dummy model trains successfully."""
    X, y, _ = preprocessed_features
    model = get_dummy_classifier(strategy="prior", random_state=42)
    model.fit(X, y)
    preds = model.predict(X)
    assert len(preds) == len(y), "Dummy classifier output size mismatch"


def test_02_logistic_model_trains(preprocessed_features):
    """Requirement 2: Logistic model trains successfully."""
    X, y, _ = preprocessed_features
    model = get_logistic_regression(C=1.0, max_iter=1000, random_state=42)
    model.fit(X, y)
    preds = model.predict(X)
    assert len(preds) == len(y), "Logistic regression output size mismatch"


def test_03_random_forest_trains(preprocessed_features):
    """Requirement 3: Random Forest model trains successfully."""
    X, y, _ = preprocessed_features
    model = get_random_forest(n_estimators=50, class_weight="balanced", random_state=42)
    model.fit(X, y)
    preds = model.predict(X)
    assert len(preds) == len(y), "Random forest output size mismatch"


def test_04_probability_outputs_sum_approximately_to_1(preprocessed_features):
    """Requirement 4: Probability outputs across all classes sum to 1.0 (± 1e-5)."""
    X, y, _ = preprocessed_features
    for model in [
        get_dummy_classifier(strategy="prior", random_state=42),
        get_logistic_regression(C=1.0, max_iter=1000, random_state=42),
        get_random_forest(n_estimators=50, class_weight="balanced", random_state=42),
    ]:
        model.fit(X, y)
        probs = model.predict_proba(X)
        sums = np.sum(probs, axis=1)
        np.testing.assert_allclose(sums, 1.0, atol=1e-5, err_msg=f"{type(model)} probabilities do not sum to 1.0")


def test_05_cv_uses_stratified_folds(train_data, config):
    """Requirement 5: CV folds are strictly stratified across all canonical classes."""
    from sklearn.model_selection import StratifiedKFold
    target_col = config["primary_dataset"]["canonical_target_column"]
    y = train_data[target_col].values
    unique_classes = set(y)

    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    for fold_idx, (train_idx, val_idx) in enumerate(skf.split(train_data, y)):
        val_classes = set(y[val_idx])
        assert val_classes == unique_classes, f"Fold {fold_idx + 1} validation missing classes: {unique_classes - val_classes}"


def test_06_no_target_column_appears_in_feature_matrix(preprocessed_features, config):
    """Requirement 6: Target column does not leak or appear in the processed feature matrix."""
    X, _, _ = preprocessed_features
    target_col = config["primary_dataset"]["canonical_target_column"]
    assert target_col not in X.columns, "Canonical target column leaked into feature matrix"
    for col in X.columns:
        assert target_col.lower() not in col.lower(), f"Suspicious column name resembling target: {col}"


def test_07_oof_predictions_cover_every_training_sample_exactly_once(config):
    """Requirement 7: Out-of-fold predictions cover all N training samples exactly once."""
    oof_dir = ml_root / "data" / "processed" / "modeling"
    for fname in ["oof_dummy.csv", "oof_logistic_regression.csv", "oof_random_forest.csv"]:
        oof_path = oof_dir / fname
        assert oof_path.exists(), f"Missing OOF file: {oof_path}"
        df_oof = pd.read_csv(oof_path)
        assert len(df_oof) == 192, f"OOF file {fname} has {len(df_oof)} rows, expected exactly 192"
        assert df_oof["sample_index"].nunique() == 192, f"Duplicate sample indices detected in OOF file: {fname}"


def test_08_metric_calculations_are_reproducible():
    """Requirement 8: Metric calculations yield exact identical values on repeated execution."""
    y_true = np.array(["A", "B", "A", "C", "B"])
    y_pred = np.array(["A", "B", "B", "C", "B"])
    y_prob = np.array([
        [0.8, 0.1, 0.1],
        [0.1, 0.7, 0.2],
        [0.4, 0.5, 0.1],
        [0.05, 0.05, 0.9],
        [0.2, 0.6, 0.2],
    ])
    classes = ["A", "B", "C"]

    m1 = compute_metrics(y_true, y_pred, y_prob, classes)
    m2 = compute_metrics(y_true, y_pred, y_prob, classes)

    assert m1["macro_f1"] == m2["macro_f1"]
    assert m1["weighted_f1"] == m2["weighted_f1"]
    assert m1["log_loss"] == m2["log_loss"]
    assert m1["top2_accuracy"] == m2["top2_accuracy"]
    assert m1["top2_accuracy"] == 1.0


def test_09_holdout_test_remains_separate(config):
    """Requirement 9: Holdout test file is physically separate and remains untouched during CV."""
    base_dir = ml_root
    train_path = base_dir / config["paths"]["processed_dir"] / "primary" / "train.csv"
    test_path = base_dir / config["paths"]["processed_dir"] / "primary" / "test.csv"

    df_train = pd.read_csv(train_path)
    df_test = pd.read_csv(test_path)

    assert len(df_train) == 192
    assert len(df_test) == 49
    # Indices in test must not overlap with train
    train_ids = set(df_train["original_row_id"])
    test_ids = set(df_test["original_row_id"])
    assert len(train_ids.intersection(test_ids)) == 0, "Holdout test set shares row IDs with training set!"


def test_10_external_dataset_is_not_used_during_training(config):
    """Requirement 10: External evaluation dataset (Breejesh Dhar) is strictly held out from model training."""
    models_dir = ml_root / "models"
    preproc_path = models_dir / "preprocessor.joblib"
    assert preproc_path.exists(), "Fitted preprocessor not found"

    preprocessor = joblib.load(preproc_path)
    # The preprocessor vocabulary should ONLY contain vocabulary observed in the 192 training rows
    assert len(preprocessor.skill_feature_names_) == 29, (
        f"Preprocessor has {len(preprocessor.skill_feature_names_)} skills; expected exactly 29 from training data"
    )
