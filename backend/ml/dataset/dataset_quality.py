"""Dataset quality auditor and standalone preference leakage probe.

Computes comprehensive dataset metrics, feature-target associations,
and executes an empirical leakage probe on [Interest, Preferred Domain].

Run:
    python -m ml.dataset.dataset_quality
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from loguru import logger
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_selection import mutual_info_classif
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score
from sklearn.model_selection import StratifiedKFold, cross_val_score, cross_validate
from sklearn.preprocessing import LabelEncoder, OrdinalEncoder, StandardScaler

from ml.utils.paths import DATASET_PATH, SAVED_MODELS_DIR
from ml.dataset.generate_dataset import (
    TECHNICAL_SKILLS, SOFT_SKILLS, PROFILE_FEATURES,
    INTEREST_OPTIONS, DOMAIN_OPTIONS, RANDOM_SEED,
)

QUALITY_REPORT_PATH = SAVED_MODELS_DIR / "dataset_quality_report.json"


def audit_dataset_quality(df: pd.DataFrame) -> dict[str, Any]:
    """Audit dataset dimensions, distributions, missingness, and leakage."""
    logger.info("Running dataset quality audit ...")

    # 1. Basic Stats
    row_count, col_count = df.shape
    missing_counts = df.isnull().sum().to_dict()
    total_missing = sum(missing_counts.values())
    total_duplicates = int(df.duplicated().sum())

    # Class distribution
    class_counts = df["career_label"].value_counts().to_dict()

    # Numerical feature stats
    num_cols = TECHNICAL_SKILLS + SOFT_SKILLS + PROFILE_FEATURES
    num_stats: dict[str, dict[str, float]] = {}
    for col in num_cols:
        num_stats[col] = {
            "mean": round(float(df[col].mean()), 2),
            "std": round(float(df[col].std()), 2),
            "min": round(float(df[col].min()), 2),
            "25%": round(float(df[col].quantile(0.25)), 2),
            "50%": round(float(df[col].median()), 2),
            "75%": round(float(df[col].quantile(0.75)), 2),
            "max": round(float(df[col].max()), 2),
        }

    # Mutual information between features and target
    le = LabelEncoder()
    y_encoded = le.fit_transform(df["career_label"])

    # Prepare features for MI
    X_num = df[num_cols].values
    ord_enc = OrdinalEncoder(categories=[INTEREST_OPTIONS, DOMAIN_OPTIONS])
    X_cat = ord_enc.fit_transform(df[["Interest", "Preferred Domain"]])
    X_all = np.hstack([X_num, X_cat])
    all_feature_names = num_cols + ["Interest", "Preferred Domain"]

    mi_scores = mutual_info_classif(X_all, y_encoded, random_state=RANDOM_SEED)
    feature_mi: dict[str, float] = {
        feat: round(float(score), 4)
        for feat, score in sorted(zip(all_feature_names, mi_scores), key=lambda x: x[1], reverse=True)
    }

    # 2. Preference Leakage Probe
    logger.info("Executing Preference Leakage Probe (Interest + Preferred Domain alone)...")
    pref_enc = OrdinalEncoder(categories=[INTEREST_OPTIONS, DOMAIN_OPTIONS])
    X_pref = pref_enc.fit_transform(df[["Interest", "Preferred Domain"]])

    probe_model = LogisticRegression(max_iter=1000, random_state=RANDOM_SEED)
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_SEED)

    cv_results = cross_validate(
        probe_model, X_pref, y_encoded, cv=cv, scoring=["accuracy", "f1_macro"]
    )
    probe_cv_acc_mean = round(float(cv_results["test_accuracy"].mean()), 4)
    probe_cv_acc_std = round(float(cv_results["test_accuracy"].std()), 4)
    probe_cv_f1_macro = round(float(cv_results["test_f1_macro"].mean()), 4)

    # Fit probe on full for confusion and category conditional probabilities
    probe_model.fit(X_pref, y_encoded)
    y_pref_pred = probe_model.predict(X_pref)
    pref_acc = round(float(accuracy_score(y_encoded, y_pref_pred)), 4)
    pref_cm = confusion_matrix(y_encoded, y_pref_pred).tolist()

    # Category conditional probabilities P(career | domain) and P(career | interest)
    # Check if any category has max conditional prob > 0.85 (deterministic identifier)
    near_deterministic_flags: list[dict[str, Any]] = []

    for cat_name, options in [("Preferred Domain", DOMAIN_OPTIONS), ("Interest", INTEREST_OPTIONS)]:
        for opt in options:
            sub = df[df[cat_name] == opt]
            if len(sub) > 0:
                dist = (sub["career_label"].value_counts(normalize=True)).to_dict()
                top_career, top_p = next(iter(dist.items()))
                if top_p > 0.85:
                    near_deterministic_flags.append({
                        "feature": cat_name,
                        "value": opt,
                        "dominant_career": top_career,
                        "probability": round(float(top_p), 4),
                    })

    leakage_probe_report = {
        "features_evaluated": ["Interest", "Preferred Domain"],
        "cv_folds": 5,
        "probe_cv_accuracy_mean": probe_cv_acc_mean,
        "probe_cv_accuracy_std": probe_cv_acc_std,
        "probe_cv_macro_f1": probe_cv_f1_macro,
        "fit_accuracy": pref_acc,
        "near_deterministic_categories_found": len(near_deterministic_flags),
        "near_deterministic_details": near_deterministic_flags,
        "leakage_assessment": (
            "PASSED: Preferences do not uniquely or deterministically identify career targets."
            if len(near_deterministic_flags) == 0
            else "WARNING: Certain categories exhibit near-deterministic target mapping."
        ),
    }

    report = {
        "dataset_path": str(DATASET_PATH),
        "random_seed": RANDOM_SEED,
        "row_count": row_count,
        "col_count": col_count,
        "total_missing": total_missing,
        "total_duplicates": total_duplicates,
        "class_distribution": class_counts,
        "feature_mutual_information": feature_mi,
        "numerical_feature_stats": num_stats,
        "preference_leakage_probe": leakage_probe_report,
    }

    SAVED_MODELS_DIR.mkdir(parents=True, exist_ok=True)
    with QUALITY_REPORT_PATH.open("w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    logger.info(f"Dataset Quality Report saved → {QUALITY_REPORT_PATH}")
    logger.info(f"Leakage probe CV accuracy: {probe_cv_acc_mean:.4f} (Macro F1: {probe_cv_f1_macro:.4f})")
    logger.info(f"Leakage status: {leakage_probe_report['leakage_assessment']}")

    return report


if __name__ == "__main__":
    df = pd.read_csv(DATASET_PATH, index_col="student_id")
    audit_dataset_quality(df)
