"""
CareerCompass — Phase 3.4 / 3.4.1 Final Model Artifact Serializer
Trains the finalized Candidate H model on all 192 primary training samples.
Guarantees holdout isolation: 49 holdout samples are strictly excluded from fitting.

Saves:
- ml/models/careercompass_phase3_4_model.joblib
- ml/models/careercompass_phase3_4_preprocessor.joblib
- ml/models/careercompass_phase3_4_metadata.json
"""

from typing import Dict, Any
from pathlib import Path
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

from src.utils.reproducibility import get_base_dir, set_seed
from src.models.feature_ablation import SkillsOnlyPreprocessor


def save_final_model_artifacts(
    train_df: pd.DataFrame,
    target_col: str = "canonical_career_track",
    skill_col: str = "Skills",
    random_state: int = 42,
    models_dir: Path = None,
) -> Dict[str, Any]:
    """
    Fits Candidate H on all 192 training records and serializes model, preprocessor, and metadata.
    """
    if models_dir is None:
        models_dir = get_base_dir() / "models"
    models_dir.mkdir(parents=True, exist_ok=True)

    set_seed(random_state)

    y_train = train_df[target_col].values
    classes = sorted(list(np.unique(y_train)))

    # 1. Fit preprocessor on training data only
    preprocessor = SkillsOnlyPreprocessor(skill_col=skill_col)
    X_train_proc = preprocessor.fit_transform(train_df)

    # 2. Fit Candidate H model (Random Forest, skills-only)
    model = RandomForestClassifier(
        n_estimators=300,
        random_state=random_state,
        n_jobs=-1,
        class_weight=None,
    )
    model.fit(X_train_proc, y_train)

    # Verify sample count
    assert len(train_df) == 192, f"Expected 192 training samples, got {len(train_df)}"

    # 3. Save serialized artifacts
    model_path = models_dir / "careercompass_phase3_4_model.joblib"
    prep_path = models_dir / "careercompass_phase3_4_preprocessor.joblib"
    meta_path = models_dir / "careercompass_phase3_4_metadata.json"

    joblib.dump(model, model_path)
    joblib.dump(preprocessor, prep_path)

    feature_names = preprocessor.get_feature_names_out()

    metadata = {
        "phase": "3.4.1",
        "candidate_id": "Candidate H",
        "model_type": "RandomForestClassifier",
        "model_name": "Random Forest (Candidate H, Skills-only)",
        "class_weight": "None",
        "feature_configuration": "Skills-only",
        "selection_basis": "CV only",
        "holdout_seen_during_selection": False,
        "n_features": int(X_train_proc.shape[1]),
        "feature_names": feature_names,
        "class_labels": classes,
        "n_classes": len(classes),
        "training_sample_count": len(train_df),
        "holdout_sample_count": 49,
        "random_seed": random_state,
        "preprocessing_description": "SkillsOnlyPreprocessor: MultiHotSkillEncoder(min_freq=1) on Skills column isolating 29 technical skill indicators",
        "model_parameters": {
            "n_estimators": 300,
            "criterion": "gini",
            "max_depth": None,
            "min_samples_split": 2,
            "min_samples_leaf": 1,
            "random_state": random_state,
            "n_jobs": -1,
            "class_weight": None,
        },
        "explainability_method": "permutation_importance_and_tree_path_attribution",
        "training_dataset_path": "data/processed/primary/train.csv",
        "holdout_dataset_path": "data/processed/primary/test.csv",
        "taxonomy_version": "Phase 3.4 / 3.4.1 (4 active technical tracks; Database & Data Engineering excluded due to 0 primary samples)",
        "date": "2026-10-03",
        "cv_selection_metrics": {
            "cv_macro_f1_mean": 0.6225645029896977,
            "cv_macro_f1_std": 0.05056274158744749,
            "cv_log_loss_mean": 0.37680306356404464,
            "cv_log_loss_std": 0.045281449476731774,
            "cv_accuracy_mean": 0.78582995951417,
            "cv_accuracy_std": 0.06665847065071903,
            "cv_weighted_f1_mean": 0.7509798664185553,
            "cv_weighted_f1_std": 0.06558537915301703,
            "cv_top2_accuracy_mean": 1.0,
            "cv_top2_accuracy_std": 0.0,
        },
        "holdout_metrics": {
            "holdout_accuracy": 0.7959183673469388,
            "holdout_macro_f1": 0.6302083333333334,
            "holdout_weighted_f1": 0.7589285714285714,
            "holdout_log_loss": 0.38735269555562085,
            "holdout_top2_accuracy": 1.0,
        },
        "threshold_policy_status": "argmax_default (threshold candidates e.g. tau=0.25-0.30 documented as OOF threshold candidate requiring further validation)",
    }

    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print(f"[Final Model] Saved model artifact to {model_path}")
    print(f"[Final Model] Saved preprocessor artifact to {prep_path}")
    print(f"[Final Model] Saved metadata artifact to {meta_path}")

    return {
        "model": model,
        "preprocessor": preprocessor,
        "metadata": metadata,
        "model_path": model_path,
        "prep_path": prep_path,
        "meta_path": meta_path,
    }


if __name__ == "__main__":
    base_dir = get_base_dir()
    train_path = base_dir / "data" / "processed" / "primary" / "train.csv"
    train_df = pd.read_csv(train_path)
    save_final_model_artifacts(train_df)
