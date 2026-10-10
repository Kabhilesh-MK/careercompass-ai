"""
CareerCompass — Unit Tests for Feature Engineering & Deterministic Normalization
Covers requirements 6, 9.
"""

import sys
from pathlib import Path
import pytest
import pandas as pd

ml_root = Path(__file__).resolve().parent.parent
if str(ml_root) not in sys.path:
    sys.path.insert(0, str(ml_root))

from src.utils.reproducibility import load_config
from src.data.load_data import load_raw_riasec
from src.features.skill_features import (
    normalize_skill_token,
    parse_skills_cell,
    MultiHotSkillEncoder,
)
from src.features.build_features import build_riasec_features


@pytest.fixture(scope="module")
def config():
    return load_config()


def test_06_skill_normalization_is_deterministic():
    """Test 6: Skill normalization is 100% deterministic and robust to casing and punctuation."""
    test_inputs = [
        ("Python", "python"),
        ("  Python  ", "python"),
        ("DATABASE DESIGN", "database_design"),
        ("Web Development", "web_development"),
        ("Data Analysis, Experimentation", ["data_analysis", "experimentation"]),
        ("AI, Simulation, MATLAB", ["ai", "simulation", "matlab"]),
        ("Cloud; Databases", ["cloud", "database_systems"]),
    ]

    for raw, expected in test_inputs:
        if isinstance(expected, list):
            tokens = parse_skills_cell(raw)
            assert tokens == expected, f"Expected {expected} for input '{raw}', got {tokens}"
        else:
            token = normalize_skill_token(raw)
            assert token == expected, f"Expected '{expected}' for input '{raw}', got '{token}'"


def test_06b_multihot_skill_encoder_consistency():
    """Test 6b: MultiHotSkillEncoder encodes skills consistently across multiple runs."""
    series = pd.Series([
        "Python, Web Development",
        "Python, Machine Learning",
        "Database Design, Cloud",
        "Python",
    ])
    encoder = MultiHotSkillEncoder()
    encoded1 = encoder.fit_transform(series)
    encoded2 = encoder.fit_transform(series)

    pd.testing.assert_frame_equal(encoded1, encoded2)
    assert "skill_python" in encoded1.columns
    assert encoded1["skill_python"].sum() == 3


def test_09_riasec_configs_contain_expected_columns(config):
    """Test 9: RIASEC benchmark dataset contains exactly the expected Config A and Config B columns."""
    df_raw = load_raw_riasec(config)
    df_a, df_b, y = build_riasec_features(df_raw, config)

    expected_a = config["riasec_dataset"]["config_a_features"]
    expected_b = config["riasec_dataset"]["config_b_features"]

    assert list(df_a.columns) == expected_a, f"Config A columns mismatch: {list(df_a.columns)} vs {expected_a}"
    assert list(df_b.columns) == expected_b, f"Config B columns mismatch: {list(df_b.columns)} vs {expected_b}"
    assert len(df_a.columns) == 5, "Config A must have exactly 5 features"
    assert len(df_b.columns) == 11, "Config B must have exactly 11 features"
    assert len(y) == 2400, "Expected 2400 labels in RIASEC benchmark"
    assert y.nunique() == 6, "Expected 6 vocational classes in RIASEC benchmark"
