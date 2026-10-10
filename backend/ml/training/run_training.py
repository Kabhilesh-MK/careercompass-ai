"""Master training script — run this to execute the validated training pipeline.

Usage (from backend/ directory):
    python -m ml.training.run_training
"""

from __future__ import annotations

from loguru import logger

from ml.dataset.career_knowledge_base import save_knowledge_base
from ml.dataset.generate_dataset import generate_dataset
from ml.dataset.dataset_quality import audit_dataset_quality
from ml.preprocessing.preprocessor import load_dataset
from ml.training.train_models import run_ablation_and_training
from ml.utils.paths import DATASET_PATH, KB_PATH


def run() -> dict:
    logger.info("========== CareerCompass AI — ML Training Pipeline ==========")

    # 1. Persist synchronized knowledge base JSON
    save_knowledge_base(KB_PATH)
    logger.info(f"Knowledge base synchronized → {KB_PATH}")

    # 2. Generate dataset if needed
    if not DATASET_PATH.exists():
        df = generate_dataset()
    else:
        df = load_dataset(DATASET_PATH)

    # 3. Run dataset quality audit and preference leakage probe
    audit_dataset_quality(df)

    # 4. Run ablation experiments, objective model selection, and holdout evaluation
    summary = run_ablation_and_training()

    logger.info("========== ML Training & Hardening Complete ==========")
    logger.info(f"Production Model : {summary['production_model']}")
    logger.info(f"Test Accuracy    : {summary['test_metrics']['accuracy']:.4f}")
    logger.info(f"Test Macro F1    : {summary['test_metrics']['macro_f1']:.4f}")
    logger.info(f"Test Weighted F1 : {summary['test_metrics']['weighted_f1']:.4f}")
    return summary


if __name__ == "__main__":
    run()
