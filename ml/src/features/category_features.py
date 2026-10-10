"""
CareerCompass — Categorical Feature Processing Module
Cleans categorical text fields (Education_Level, Specialization, Interests)
and builds scikit-learn OneHotEncoder pipelines with safe out-of-vocabulary handling.
"""

from typing import List, Dict, Any
import pandas as pd
import numpy as np
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer


def clean_categorical_token(val: Any) -> str:
    """
    Cleans a single categorical value: strips whitespace, normalizes casing if needed.
    """
    if pd.isna(val) or val is None:
        return "Unknown"
    val_str = str(val).strip()
    return val_str if val_str else "Unknown"


def clean_categorical_dataframe(df: pd.DataFrame, cat_cols: List[str]) -> pd.DataFrame:
    """
    Cleans all categorical columns in a dataframe in place or returns a copy.
    """
    df_clean = df.copy()
    for col in cat_cols:
        if col in df_clean.columns:
            df_clean[col] = df_clean[col].apply(clean_categorical_token)
    return df_clean


def build_categorical_pipeline(cat_cols: List[str]) -> Pipeline:
    """
    Builds a robust scikit-learn Pipeline for categorical features:
    1. SimpleImputer with constant 'Unknown'
    2. OneHotEncoder with handle_unknown='ignore' to guarantee zero leakage
       and robust handling of unseen categories during test/transfer evaluation.
    """
    encoder = OneHotEncoder(
        handle_unknown="ignore",
        sparse_output=False,
        dtype=np.float32,
    )
    pipeline = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="constant", fill_value="Unknown")),
        ("onehot", encoder)
    ])
    return pipeline
