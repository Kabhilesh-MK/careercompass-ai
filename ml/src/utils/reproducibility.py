"""
CareerCompass — Reproducibility Utilities
Handles random seed initialization, environment auditing, and config loading.
"""

import os
import sys
import random
import platform
from pathlib import Path
from typing import Dict, Any
import numpy as np
import yaml


def set_seed(seed: int = 42) -> None:
    """
    Sets global deterministic seeds across Python's random and NumPy.
    Ensures complete reproducibility across all data splits and transformations.
    """
    random.seed(seed)
    np.random.seed(seed)
    os.environ["PYTHONHASHSEED"] = str(seed)


def get_base_dir() -> Path:
    """Returns the base ml directory."""
    return Path(__file__).resolve().parent.parent.parent


def load_config(config_path: str = None) -> Dict[str, Any]:
    """
    Loads YAML configuration safely.
    Defaults to configs/config.yaml relative to ml root.
    """
    if config_path is None:
        config_path = get_base_dir() / "configs" / "config.yaml"
    else:
        config_path = Path(config_path)

    if not config_path.exists():
        raise FileNotFoundError(f"Configuration file not found at: {config_path}")

    with open(config_path, "r", encoding="utf-8") as f:
        config = yaml.safe_load(f)
    return config


def get_environment_info() -> Dict[str, str]:
    """
    Gathers environment and dependency versions for academic audit reporting.
    """
    import pandas as pd
    import sklearn

    return {
        "os": f"{platform.system()} {platform.release()} ({platform.version()})",
        "python_version": sys.version.split()[0],
        "numpy_version": np.__version__,
        "pandas_version": pd.__version__,
        "sklearn_version": sklearn.__version__,
        "yaml_version": yaml.__version__,
    }
