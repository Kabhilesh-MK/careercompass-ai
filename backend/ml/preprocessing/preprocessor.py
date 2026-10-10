"""Data preprocessing pipeline with strict leakage prevention.

Guarantees:
-----------
1. train_test_split occurs strictly BEFORE transformer fitting.
2. StandardScaler and imputers are fitted only on training folds.
3. Categorical encoders learn category maps only from pre-specified valid sets
   or training subsets, handling unseen values safely.
4. Preprocessing is encapsulated inside sklearn ColumnTransformer/Pipeline.

Run:
    python -m ml.preprocessing.preprocessor
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from loguru import logger
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder, OrdinalEncoder, StandardScaler

from ml.utils.paths import (
    DATASET_PATH, ENCODER_PATH, FEATURES_PATH, SAVED_MODELS_DIR,
)
from ml.dataset.generate_dataset import (
    TECHNICAL_SKILLS, SOFT_SKILLS, PROFILE_FEATURES,
    INTEREST_OPTIONS, DOMAIN_OPTIONS, RANDOM_SEED,
)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

CATEGORICAL_COLS: list[str] = ["Interest", "Preferred Domain"]
NUMERICAL_COLS: list[str] = TECHNICAL_SKILLS + SOFT_SKILLS + PROFILE_FEATURES
ALL_FEATURE_COLS: list[str] = NUMERICAL_COLS + CATEGORICAL_COLS
TARGET_COL: str = "career_label"

PREPROCESSOR_PATH: Path = SAVED_MODELS_DIR / "preprocessor.pkl"


# ---------------------------------------------------------------------------
# Pipeline builder
# ---------------------------------------------------------------------------

def build_preprocessor(feature_cols: list[str] | None = None) -> ColumnTransformer:
    """Return an unfitted ColumnTransformer tailored to the specified feature subset.

    Encapsulates median imputation + StandardScaler for numerical features,
    and most-frequent imputation + OrdinalEncoder for categorical features.
    """
    if feature_cols is None:
        feature_cols = ALL_FEATURE_COLS

    active_num = [c for c in feature_cols if c in NUMERICAL_COLS]
    active_cat = [c for c in feature_cols if c in CATEGORICAL_COLS]

    transformers = []
    if active_num:
        num_pipeline = Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ])
        transformers.append(("num", num_pipeline, active_num))

    if active_cat:
        # Construct category list matching active_cat order
        cat_categories = []
        for col in active_cat:
            if col == "Interest":
                cat_categories.append(INTEREST_OPTIONS)
            elif col == "Preferred Domain":
                cat_categories.append(DOMAIN_OPTIONS)
            else:
                cat_categories.append("auto")

        cat_pipeline = Pipeline([
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("encoder", OrdinalEncoder(
                categories=cat_categories,
                handle_unknown="use_encoded_value",
                unknown_value=-1,
            )),
        ])
        transformers.append(("cat", cat_pipeline, active_cat))

    return ColumnTransformer(transformers=transformers, remainder="drop")


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def load_dataset(path: Path = DATASET_PATH) -> pd.DataFrame:
    """Load raw CSV. Auto-generates it if missing."""
    if not path.exists():
        logger.warning(f"Dataset not found at {path}. Generating …")
        from ml.dataset.generate_dataset import generate_dataset
        generate_dataset()
    df = pd.read_csv(path, index_col="student_id")
    logger.info(f"Loaded dataset: {df.shape}")
    return df


def preprocess(
    df: pd.DataFrame,
    feature_cols: list[str] | None = None,
    test_size: float = 0.2,
    save: bool = True,
) -> dict[str, Any]:
    """Preprocess data with strict test-set isolation.

    Steps:
    1. Extract features X and target y.
    2. Encode target labels via LabelEncoder.
    3. Perform stratified train_test_split BEFORE any feature fitting.
    4. Fit ColumnTransformer on X_train only.
    5. Transform X_train and X_test independently.
    6. Persist artifacts if save=True.
    """
    if feature_cols is None:
        feature_cols = ALL_FEATURE_COLS

    # 1. Extract raw features and target
    X = df[feature_cols].copy()
    y_raw = df[TARGET_COL].copy().fillna("Software Engineer")

    # 2. Encode target
    le = LabelEncoder()
    y = le.fit_transform(y_raw)

    # 3. Train / test split FIRST (Strict Isolation)
    X_train_df, X_test_df, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=RANDOM_SEED, stratify=y
    )

    logger.info(
        f"Isolated split — Train: {len(X_train_df)}, Test: {len(X_test_df)}, "
        f"Features: {len(feature_cols)}, Classes: {len(le.classes_)}"
    )

    # 4. Build & fit preprocessor ONLY on X_train_df
    preprocessor = build_preprocessor(feature_cols)
    X_train = preprocessor.fit_transform(X_train_df)

    # 5. Transform X_test_df without fitting
    X_test = preprocessor.transform(X_test_df)

    # 6. Persist artifacts
    if save:
        SAVED_MODELS_DIR.mkdir(parents=True, exist_ok=True)
        joblib.dump(le, ENCODER_PATH)
        joblib.dump(preprocessor, PREPROCESSOR_PATH)
        with FEATURES_PATH.open("w", encoding="utf-8") as fh:
            json.dump(feature_cols, fh)
        logger.info(f"Saved preprocessor → {PREPROCESSOR_PATH}")
        logger.info(f"Saved label encoder → {ENCODER_PATH}")
        logger.info(f"Saved feature names ({len(feature_cols)}) → {FEATURES_PATH}")

    return {
        "X_train": X_train,
        "X_test": X_test,
        "y_train": y_train,
        "y_test": y_test,
        "X_train_df": X_train_df,
        "X_test_df": X_test_df,
        "preprocessor": preprocessor,
        "label_encoder": le,
        "feature_names": feature_cols,
    }


def transform_input(
    raw: dict[str, Any],
    preprocessor: ColumnTransformer | None = None,
    feature_cols: list[str] | None = None,
) -> np.ndarray:
    """Transform a single student profile dict into a feature vector.

    Loads the saved preprocessor and feature names from disk if not provided.
    """
    if preprocessor is None:
        preprocessor = joblib.load(PREPROCESSOR_PATH)

    if feature_cols is None:
        if FEATURES_PATH.exists():
            with FEATURES_PATH.open("r", encoding="utf-8") as fh:
                feature_cols = json.load(fh)
        else:
            feature_cols = ALL_FEATURE_COLS

    filled: dict[str, Any] = {}
    for col in feature_cols:
        if col in NUMERICAL_COLS:
            filled[col] = float(raw.get(col, 0.0))
        elif col in CATEGORICAL_COLS:
            default = INTEREST_OPTIONS[0] if col == "Interest" else DOMAIN_OPTIONS[0]
            filled[col] = raw.get(col, default)
        else:
            filled[col] = raw.get(col, 0.0)

    df_input = pd.DataFrame([filled])
    return preprocessor.transform(df_input)
