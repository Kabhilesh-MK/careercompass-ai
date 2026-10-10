"""
CareerCompass — Unit Tests for Splitting Reproducibility & Leakage Prevention
Covers requirements 7, 8.
"""

import sys
from pathlib import Path
import pytest
import pandas as pd
import numpy as np

ml_root = Path(__file__).resolve().parent.parent
if str(ml_root) not in sys.path:
    sys.path.insert(0, str(ml_root))

from src.utils.reproducibility import load_config
from src.data.load_data import load_raw_primary
from src.features.build_features import build_primary_features
from src.data.split_data import split_primary_dataset
from src.preprocessing.pipeline import PrimaryPreprocessor


@pytest.fixture(scope="module")
def config():
    return load_config()


@pytest.fixture(scope="module")
def primary_clean(config):
    df_raw = load_raw_primary(config)
    df_clean, _ = build_primary_features(df_raw, config)
    return df_clean


def test_07_train_test_split_is_reproducible(primary_clean, config):
    """Test 7: Train/test split is strictly reproducible across repeated executions."""
    train1, test1, meta1 = split_primary_dataset(primary_clean, config)
    train2, test2, meta2 = split_primary_dataset(primary_clean, config)

    # Identical indices
    assert meta1["train_indices"] == meta2["train_indices"], "Train indices changed across identical runs"
    assert meta1["test_indices"] == meta2["test_indices"], "Test indices changed across identical runs"
    pd.testing.assert_frame_equal(train1, train2)
    pd.testing.assert_frame_equal(test1, test2)


def test_07b_stratification_preserves_class_proportions(primary_clean, config):
    """Test 7b: Stratified split maintains class representation across both train and test partitions."""
    train, test, meta = split_primary_dataset(primary_clean, config)
    target_col = config["primary_dataset"]["canonical_target_column"]

    train_classes = set(train[target_col].unique())
    test_classes = set(test[target_col].unique())
    all_classes = set(primary_clean[target_col].unique())

    # Every single class in the dataset must be present in both train and test
    assert train_classes == all_classes, "Train set missing one or more canonical classes"
    assert test_classes == all_classes, "Test set missing one or more canonical classes"


def test_08_preprocessing_does_not_leak_target(primary_clean, config):
    """Test 8: Preprocessing pipeline does not use or leak target column."""
    train, test, _ = split_primary_dataset(primary_clean, config)
    target_col = config["primary_dataset"]["canonical_target_column"]

    preprocessor = PrimaryPreprocessor(
        cat_cols=config["primary_dataset"]["features"]["categorical"],
        skill_col="Skills"
    )
    preprocessor.fit(train)

    feature_names = preprocessor.get_feature_names_out()

    # Verify target column is NOT in feature names
    assert target_col not in feature_names, f"Target column '{target_col}' leaked into feature space"
    for feat in feature_names:
        assert target_col.lower() not in feat.lower(), f"Potential target leakage in feature: {feat}"


def test_08b_preprocessing_transforms_test_without_error(primary_clean, config):
    """Test 8b: Preprocessor fitted on train transforms test set cleanly with matching dimensions."""
    train, test, _ = split_primary_dataset(primary_clean, config)

    preprocessor = PrimaryPreprocessor(
        cat_cols=config["primary_dataset"]["features"]["categorical"],
        skill_col="Skills"
    )
    X_train_proc = preprocessor.fit_transform(train)
    X_test_proc = preprocessor.transform(test)

    assert X_train_proc.shape[1] == X_test_proc.shape[1], (
        f"Feature dimension mismatch between train ({X_train_proc.shape[1]}) and test ({X_test_proc.shape[1]})"
    )
    assert not X_train_proc.isnull().any().any(), "Transformed train matrix contains NaNs"
    assert not X_test_proc.isnull().any().any(), "Transformed test matrix contains NaNs"
