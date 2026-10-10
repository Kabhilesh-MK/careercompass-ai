"""
CareerCompass — Data Splitting Module
Executes strict 80/20 stratified train/test split on primary technical data
BEFORE any preprocessing or vectorization is fitted.
"""

from pathlib import Path
from typing import Dict, Any, Tuple
import json
import pandas as pd
from sklearn.model_selection import train_test_split

from src.utils.reproducibility import get_base_dir, load_config, set_seed


def split_primary_dataset(
    df: pd.DataFrame,
    config: Dict[str, Any] = None
) -> Tuple[pd.DataFrame, pd.DataFrame, Dict[str, Any]]:
    """
    Splits the primary technical dataset into train (80%) and test (20%) sets
    using stratified sampling on the canonical target column.
    Guarantees zero data leakage by splitting prior to transformer fitting.
    """
    if config is None:
        config = load_config()

    seed = config["reproducibility"]["random_seed"]
    test_size = config["primary_dataset"]["test_size"]
    target_col = config["primary_dataset"]["canonical_target_column"]

    set_seed(seed)

    if target_col not in df.columns:
        raise KeyError(f"Target column '{target_col}' not found in dataframe.")

    # Stratified split
    train_df, test_df = train_test_split(
        df,
        test_size=test_size,
        random_state=seed,
        stratify=df[target_col],
        shuffle=True,
    )

    train_df = train_df.reset_index(drop=False).rename(columns={"index": "original_row_id"})
    test_df = test_df.reset_index(drop=False).rename(columns={"index": "original_row_id"})

    split_metadata = {
        "random_seed": seed,
        "test_size": test_size,
        "stratified": True,
        "target_column": target_col,
        "total_samples": len(df),
        "train_samples": len(train_df),
        "test_samples": len(test_df),
        "train_class_counts": {str(k): int(v) for k, v in train_df[target_col].value_counts().items()},
        "test_class_counts": {str(k): int(v) for k, v in test_df[target_col].value_counts().items()},
        "train_indices": train_df["original_row_id"].tolist(),
        "test_indices": test_df["original_row_id"].tolist(),
    }

    return train_df, test_df, split_metadata


def save_primary_splits(
    train_df: pd.DataFrame,
    test_df: pd.DataFrame,
    metadata: Dict[str, Any],
    output_dir: Path = None
) -> None:
    """
    Saves split dataframes and index metadata to data/processed/primary/
    """
    if output_dir is None:
        output_dir = get_base_dir() / "data" / "processed" / "primary"
    output_dir.mkdir(parents=True, exist_ok=True)

    train_path = output_dir / "train.csv"
    test_path = output_dir / "test.csv"
    meta_path = output_dir / "split_metadata.json"

    train_df.to_csv(train_path, index=False)
    test_df.to_csv(test_path, index=False)

    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
