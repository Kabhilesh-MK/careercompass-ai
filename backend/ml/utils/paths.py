"""Centralized ML paths and logger.

All ML artifacts (dataset, saved models, evaluation reports) live under
the ``ml/`` directory so the engine is self-contained and portable.
"""

from pathlib import Path

from loguru import logger

# Root of the ML package: backend/ml
ML_ROOT: Path = Path(__file__).resolve().parent.parent

# Artifact directories
DATASET_DIR: Path = ML_ROOT / "dataset"
SAVED_MODELS_DIR: Path = ML_ROOT / "saved_models"
REPORTS_DIR: Path = ML_ROOT / "reports"

# Canonical artifact files
DATASET_PATH: Path = DATASET_DIR / "student_dataset.csv"
CAREER_DATASET_PATH: Path = DATASET_DIR / "career_dataset.csv"
GENERATOR_CONFIG_PATH: Path = DATASET_DIR / "generator_config.json"
MODEL_PATH: Path = SAVED_MODELS_DIR / "career_prediction_model.pkl"
ENCODER_PATH: Path = SAVED_MODELS_DIR / "label_encoder.pkl"
FEATURES_PATH: Path = SAVED_MODELS_DIR / "feature_columns.json"
METRICS_PATH: Path = SAVED_MODELS_DIR / "model_metrics.json"
KB_PATH: Path = DATASET_DIR / "career_knowledge_base.json"

# Ensure artifact dirs exist
for _d in (SAVED_MODELS_DIR, REPORTS_DIR):
    _d.mkdir(parents=True, exist_ok=True)

logger.info(f"ML root: {ML_ROOT}")
