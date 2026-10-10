"""
CareerCompass — Data Loading Module
Loads raw datasets without modifying them on disk.
"""

from pathlib import Path
from typing import Dict, Any, Tuple
import pandas as pd
from src.utils.reproducibility import get_base_dir, load_config


def load_raw_primary(config: Dict[str, Any] = None) -> pd.DataFrame:
    """
    Loads the primary training dataset (Divya Eldho).
    Expected file: data/raw/perfectly_realistic_career_guidance_dataset_1500.csv
    """
    if config is None:
        config = load_config()
    base_dir = get_base_dir()
    rel_path = config["primary_dataset"]["raw_file"]
    file_path = base_dir / rel_path

    if not file_path.exists():
        raise FileNotFoundError(f"Primary raw dataset not found at: {file_path}")

    df = pd.read_csv(file_path)
    return df


def load_raw_external(config: Dict[str, Any] = None) -> pd.DataFrame:
    """
    Loads the external transfer evaluation dataset (Breejesh Dhar).
    Expected file: data/raw/career_recommender.csv
    """
    if config is None:
        config = load_config()
    base_dir = get_base_dir()
    rel_path = config["external_dataset"]["raw_file"]
    file_path = base_dir / rel_path

    if not file_path.exists():
        raise FileNotFoundError(f"External raw dataset not found at: {file_path}")

    df = pd.read_csv(file_path)
    return df


def load_raw_riasec(config: Dict[str, Any] = None) -> pd.DataFrame:
    """
    Loads the psychometric alignment benchmark dataset (RIASEC).
    Expected file: data/raw/career_data.csv
    """
    if config is None:
        config = load_config()
    base_dir = get_base_dir()
    rel_path = config["riasec_dataset"]["raw_file"]
    file_path = base_dir / rel_path

    if not file_path.exists():
        raise FileNotFoundError(f"RIASEC raw dataset not found at: {file_path}")

    df = pd.read_csv(file_path)
    return df


def load_all_raw(config: Dict[str, Any] = None) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Loads all three candidate datasets simultaneously.
    Returns: (df_primary, df_external, df_riasec)
    """
    if config is None:
        config = load_config()
    return load_raw_primary(config), load_raw_external(config), load_raw_riasec(config)
