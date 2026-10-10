"""
CareerCompass — External Real-World Transfer Evaluation Module (Phase 3.2)
Tests zero-shot out-of-distribution transfer of the primary baseline models onto
authentic college graduate survey records from Breejesh Dhar (N = 323).
DOES NOT RETRAIN OR FINE-TUNE ON EXTERNAL DATA.
"""

from typing import Dict, Any, List, Tuple
from pathlib import Path
import json
import joblib
import pandas as pd
import numpy as np

from src.utils.reproducibility import get_base_dir, load_config
from src.features.skill_features import parse_skills_cell
from src.models.evaluation import compute_metrics, plot_and_save_confusion_matrix


def adapt_breejesh_to_common_schema(df_ext: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series, Dict[str, Any]]:
    """
    Builds a rigorous, documented Common Feature Schema Adapter:
    - 'What was your course in UG?' -> 'Education_Level'
    - 'What is your UG specialization? Major Subject (Eg; Mathematics)' -> 'Specialization'
    - 'What are your interests?' -> 'Interests'
    - 'What are your skills ? (Select multiple if necessary)' -> 'Skills' (normalizing semicolons to commas)
    - Target: 'canonical_career_track'
    """
    df_adapted = pd.DataFrame()

    # Education / Degree
    df_adapted["Education_Level"] = df_ext["What was your course in UG?"].fillna("Unknown").str.strip()

    # Specialization
    df_adapted["Specialization"] = df_ext["What is your UG specialization? Major Subject (Eg; Mathematics)"].fillna("Unknown").str.strip()

    # Interests
    df_adapted["Interests"] = df_ext["What are your interests?"].fillna("Technology").str.strip()

    # Skills: Convert semicolon-separated to comma-separated
    skills_adapted = []
    for s in df_ext["What are your skills ? (Select multiple if necessary)"]:
        tokens = parse_skills_cell(s, separators=";,")
        skills_adapted.append(", ".join(tokens) if tokens else "None")
    df_adapted["Skills"] = skills_adapted

    y_ext = df_ext["canonical_career_track"].copy()

    schema_info = {
        "source_dataset": "Breejesh Dhar Career Recommendation Dataset",
        "evaluable_samples": len(df_adapted),
        "feature_mapping": {
            "Education_Level": "What was your course in UG?",
            "Specialization": "What is your UG specialization? Major Subject (Eg; Mathematics)",
            "Interests": "What are your interests?",
            "Skills": "What are your skills ? (Select multiple if necessary) [Normalized]",
        },
        "target_column": "canonical_career_track",
        "class_distribution": {str(k): int(v) for k, v in y_ext.value_counts().items()},
    }

    return df_adapted, y_ext, schema_info


def run_external_transfer_evaluation(
    preprocessor,
    trained_models: Dict[str, Any],
    classes: List[str],
    config: Dict[str, Any] = None,
) -> Dict[str, Any]:
    """
    Evaluates zero-shot transfer performance of trained models against Breejesh Dhar.
    Evaluates both:
    1. 4-class evaluated subset (311 samples matching trained canonical classes)
    2. Full 5-class evaluation (323 samples including unrepresented Database & Data Engineering)
    """
    if config is None:
        config = load_config()

    base_dir = get_base_dir()
    ext_file = base_dir / config["paths"]["processed_dir"] / "external" / "breejesh_transfer_eval.csv"
    figures_dir = base_dir / "reports" / "figures"
    reports_dir = base_dir / "reports"
    figures_dir.mkdir(parents=True, exist_ok=True)

    if not ext_file.exists():
        raise FileNotFoundError(f"External evaluation file missing at: {ext_file}")

    df_ext_raw = pd.read_csv(ext_file)
    X_adapted, y_ext_all, schema_info = adapt_breejesh_to_common_schema(df_ext_raw)

    # Transform through fitted PrimaryPreprocessor
    X_ext_proc = preprocessor.transform(X_adapted)

    transfer_results = {
        "schema_info": schema_info,
        "eval_4_class": {},
        "eval_5_class": {},
    }

    # Filter to samples belonging to the 4 trained classes for fair evaluation
    mask_4_class = y_ext_all.isin(classes)
    X_ext_4 = X_ext_proc[mask_4_class].reset_index(drop=True)
    y_ext_4 = y_ext_all[mask_4_class].reset_index(drop=True)

    print(f"\n[External Transfer] Evaluating on {len(y_ext_4)} real-world graduates across 4 trained tracks...")

    for model_name, model in trained_models.items():
        # Predict on 4-class subset
        preds_4 = model.predict(X_ext_4)
        raw_probs_4 = model.predict_proba(X_ext_4)

        # Align probabilities
        model_classes = list(model.classes_)
        probs_4 = np.zeros((len(X_ext_4), len(classes)), dtype=np.float64)
        for i, c in enumerate(model_classes):
            col_idx = classes.index(c)
            probs_4[:, col_idx] = raw_probs_4[:, i]

        eval_4 = compute_metrics(y_ext_4.values, preds_4, probs_4, classes)
        transfer_results["eval_4_class"][model_name] = eval_4

        # Save confusion matrix figure
        clean_name = model_name.lower().replace(" ", "_")
        fig_path = figures_dir / f"transfer_confusion_{clean_name}.png"
        plot_and_save_confusion_matrix(
            cm_array=np.array(eval_4["confusion_matrix"]),
            classes=classes,
            title=f"Zero-Shot Transfer Confusion Matrix — {model_name} (N={len(y_ext_4)})",
            output_path=fig_path,
        )

        print(f"     {model_name:22s} | Accuracy: {eval_4['accuracy']:.4f} | Macro F1: {eval_4['macro_f1']:.4f} | Top-2 Acc: {eval_4['top2_accuracy']:.4f}")

    return transfer_results
