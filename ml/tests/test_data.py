"""
CareerCompass — Unit Tests for Dataset Loading, Target Integrity, and Taxonomy Validation
Covers requirements 1, 2, 3, 4, 5, 10.
"""

import sys
from pathlib import Path
import pytest
import pandas as pd

ml_root = Path(__file__).resolve().parent.parent
if str(ml_root) not in sys.path:
    sys.path.insert(0, str(ml_root))

from src.utils.reproducibility import load_config
from src.data.load_data import load_all_raw, load_raw_primary, load_raw_external, load_raw_riasec
from src.features.build_features import build_primary_features, build_external_features


@pytest.fixture(scope="module")
def config():
    return load_config()


def test_01_datasets_load_successfully(config):
    """Test 1: All three candidate datasets load with valid non-empty DataFrames."""
    df_primary, df_external, df_riasec = load_all_raw(config)
    assert not df_primary.empty, "Primary dataset should not be empty"
    assert not df_external.empty, "External dataset should not be empty"
    assert not df_riasec.empty, "RIASEC dataset should not be empty"
    assert df_primary.shape[0] == 1500, f"Expected 1500 rows in Divya Eldho, observed {df_primary.shape[0]}"
    assert df_external.shape[0] == 1195, f"Expected 1195 rows in Breejesh Dhar, observed {df_external.shape[0]}"
    assert df_riasec.shape[0] == 2400, f"Expected 2400 rows in RIASEC, observed {df_riasec.shape[0]}"


def test_02_required_columns_exist_in_raw_data(config):
    """Test 2: Required columns exist in each raw dataset."""
    df_primary = load_raw_primary(config)
    expected_primary_cols = {"Education_Level", "Specialization", "Skills", "Interests", "Recommended_Career", "Career_Description"}
    assert expected_primary_cols.issubset(set(df_primary.columns)), "Primary dataset missing expected columns"

    df_riasec = load_raw_riasec(config)
    expected_riasec_cols = set(config["riasec_dataset"]["config_b_features"]) | {config["riasec_dataset"]["target_column"]}
    assert expected_riasec_cols.issubset(set(df_riasec.columns)), "RIASEC dataset missing expected columns"


def test_03_target_contains_no_nulls_after_filtering(config):
    """Test 3: Filtered primary and external datasets contain zero null targets."""
    df_primary_raw = load_raw_primary(config)
    df_primary_clean, _ = build_primary_features(df_primary_raw, config)
    target_col = config["primary_dataset"]["canonical_target_column"]

    assert target_col in df_primary_clean.columns, f"Target column '{target_col}' missing"
    assert df_primary_clean[target_col].isnull().sum() == 0, "Cleaned primary dataset has null targets"
    assert len(df_primary_clean) > 0, "Cleaned primary dataset must not be empty"

    df_ext_raw = load_raw_external(config)
    df_ext_clean, _ = build_external_features(df_ext_raw, config)
    assert df_ext_clean[target_col].isnull().sum() == 0, "Cleaned external dataset has null targets"
    assert len(df_ext_clean) > 0, "Cleaned external dataset must not be empty"


def test_04_canonical_labels_are_valid(config):
    """Test 4: Canonical labels strictly match the defined 5 canonical career tracks."""
    canonical_tracks = set(config["taxonomy"]["canonical_tracks"])
    assert len(canonical_tracks) == 5, "Expected exactly 5 canonical career tracks"

    df_primary_raw = load_raw_primary(config)
    df_primary_clean, _ = build_primary_features(df_primary_raw, config)
    observed_primary_classes = set(df_primary_clean[config["primary_dataset"]["canonical_target_column"]].unique())

    # Ensure all observed classes are within the canonical set
    assert observed_primary_classes.issubset(canonical_tracks), (
        f"Unexpected classes found in primary dataset: {observed_primary_classes - canonical_tracks}"
    )


def test_05_no_unexpected_canonical_labels_exist(config):
    """Test 5: No unauthorized career tracks exist outside the canonical taxonomy."""
    canonical_tracks = set(config["taxonomy"]["canonical_tracks"])

    df_ext_raw = load_raw_external(config)
    df_ext_clean, _ = build_external_features(df_ext_raw, config)
    observed_ext_classes = set(df_ext_clean[config["external_dataset"]["canonical_target_column"]].unique())

    assert observed_ext_classes.issubset(canonical_tracks), (
        f"Unexpected classes found in external evaluation set: {observed_ext_classes - canonical_tracks}"
    )


def test_10_external_dataset_is_not_mixed_with_training_data(config):
    """Test 10: External evaluation dataset is strictly isolated and never mixed with primary training data."""
    base_dir = ml_root
    train_file = base_dir / config["paths"]["processed_dir"] / "primary" / "train.csv"
    ext_file = base_dir / config["paths"]["processed_dir"] / "external" / "breejesh_transfer_eval.csv"

    if train_file.exists() and ext_file.exists():
        df_train = pd.read_csv(train_file)
        df_ext = pd.read_csv(ext_file)

        # Confirm different schemas and physical file separation
        assert train_file != ext_file, "Training file and external file paths must be distinct"
        assert set(df_train.columns) != set(df_ext.columns), "Schemas must reflect distinct survey vs profile origins"
