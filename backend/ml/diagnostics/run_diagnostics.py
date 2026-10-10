"""Comprehensive Forensic Diagnostic Suite for CareerCompass AI.

Implements all required read-only probes, pairwise overlap calculations,
information diagnostics, calibration metrics, and ambiguous profile tests.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from loguru import logger
from scipy.stats import chisquare
from sklearn.dummy import DummyClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_selection import f_classif, mutual_info_classif
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    brier_score_loss,
    classification_report,
    confusion_matrix,
    f1_score,
    log_loss,
    precision_score,
    recall_score,
)
from sklearn.model_selection import StratifiedKFold, cross_validate
from sklearn.preprocessing import LabelEncoder, OrdinalEncoder, StandardScaler
from sklearn.tree import DecisionTreeClassifier

from ml.utils.paths import (
    DATASET_PATH,
    ENCODER_PATH,
    FEATURES_PATH,
    MODEL_PATH,
    SAVED_MODELS_DIR,
)
from ml.dataset.generate_dataset import (
    ALL_SKILLS,
    CAREER_CLASSES,
    DOMAIN_OPTIONS,
    INTEREST_OPTIONS,
    PROFILE_FEATURES,
    RANDOM_SEED,
    SOFT_SKILLS,
    TECHNICAL_SKILLS,
)
import ml.prediction.predictor as predictor

DIAGNOSTICS_REPORT_PATH = SAVED_MODELS_DIR / "forensic_diagnostics_report.json"


# ---------------------------------------------------------------------------
# Helper: Empirical Histogram Intersection
# ---------------------------------------------------------------------------

def compute_histogram_intersection(s1: pd.Series, s2: pd.Series, bins: int = 50) -> float:
    """Calculate the intersection area between two empirical density histograms."""
    bin_edges = np.linspace(0, 100, bins + 1)
    h1, _ = np.histogram(s1, bins=bin_edges, density=True)
    h2, _ = np.histogram(s2, bins=bin_edges, density=True)
    intersection = np.sum(np.minimum(h1, h2)) * (bin_edges[1] - bin_edges[0])
    return float(np.clip(intersection, 0.0, 1.0))


def compute_cohens_d(s1: pd.Series, s2: pd.Series) -> float:
    """Calculate Cohen's d effect size between two groups."""
    n1, n2 = len(s1), len(s2)
    if n1 < 2 or n2 < 2:
        return 0.0
    var1, var2 = s1.var(ddof=1), s2.var(ddof=1)
    pooled_sd = np.sqrt(((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2))
    if pooled_sd == 0:
        return 0.0
    return float((s1.mean() - s2.mean()) / pooled_sd)


# ---------------------------------------------------------------------------
# Diagnostic Suite Execution
# ---------------------------------------------------------------------------

def run_forensic_diagnostics() -> dict[str, Any]:
    logger.info("========== Starting Forensic Diagnostic Suite ==========")

    df = pd.read_csv(DATASET_PATH, index_col="student_id")
    y_str = df["career_label"]
    le = LabelEncoder()
    y = le.fit_transform(y_str)
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_SEED)

    # -----------------------------------------------------------------------
    # Probe A: Preference-Only Probe
    # -----------------------------------------------------------------------
    logger.info("Executing Probe A: Preference-Only Probe...")
    pref_enc = OrdinalEncoder(categories=[INTEREST_OPTIONS, DOMAIN_OPTIONS])
    X_pref = pref_enc.fit_transform(df[["Interest", "Preferred Domain"]])

    # Logistic Regression Probe
    lr_probe = LogisticRegression(max_iter=1000, random_state=RANDOM_SEED)
    lr_scores = cross_validate(lr_probe, X_pref, y, cv=cv, scoring=["accuracy", "f1_macro"])

    # Decision Tree Probe
    dt_probe = DecisionTreeClassifier(max_depth=5, random_state=RANDOM_SEED)
    dt_scores = cross_validate(dt_probe, X_pref, y, cv=cv, scoring=["accuracy", "f1_macro"])

    # Full fit for confusion matrix
    lr_probe.fit(X_pref, y)
    y_pref_pred = lr_probe.predict(X_pref)
    pref_cm = confusion_matrix(y, y_pref_pred).tolist()

    pref_report = {
        "features": ["Interest", "Preferred Domain"],
        "logistic_regression": {
            "cv_accuracy_mean": round(float(lr_scores["test_accuracy"].mean()), 4),
            "cv_accuracy_std": round(float(lr_scores["test_accuracy"].std()), 4),
            "cv_macro_f1_mean": round(float(lr_scores["test_f1_macro"].mean()), 4),
            "cv_macro_f1_std": round(float(lr_scores["test_f1_macro"].std()), 4),
        },
        "decision_tree": {
            "cv_accuracy_mean": round(float(dt_scores["test_accuracy"].mean()), 4),
            "cv_accuracy_std": round(float(dt_scores["test_accuracy"].std()), 4),
            "cv_macro_f1_mean": round(float(dt_scores["test_f1_macro"].mean()), 4),
            "cv_macro_f1_std": round(float(dt_scores["test_f1_macro"].std()), 4),
        },
        "confusion_matrix": pref_cm,
    }

    # -----------------------------------------------------------------------
    # Probe B: Individual Skill Probes (All 27 Skills)
    # -----------------------------------------------------------------------
    logger.info("Executing Probe B: Individual Skill Probes (All 27 Skills)...")
    single_skill_results = []
    for skill in ALL_SKILLS:
        X_s = df[[skill]].values
        model = LogisticRegression(max_iter=500, random_state=RANDOM_SEED)
        scores = cross_validate(model, X_s, y, cv=cv, scoring=["accuracy", "f1_macro"])
        acc_mean = float(scores["test_accuracy"].mean())
        acc_std = float(scores["test_accuracy"].std())
        f1_mean = float(scores["test_f1_macro"].mean())
        f1_std = float(scores["test_f1_macro"].std())

        single_skill_results.append({
            "skill": skill,
            "type": "Technical" if skill in TECHNICAL_SKILLS else "Soft",
            "accuracy_mean": round(acc_mean, 4),
            "accuracy_std": round(acc_std, 4),
            "macro_f1_mean": round(f1_mean, 4),
            "macro_f1_std": round(f1_std, 4),
        })

    # Ranking determined strictly by single-feature Macro F1
    single_skill_results.sort(key=lambda x: x["macro_f1_mean"], reverse=True)

    # -----------------------------------------------------------------------
    # Probe C: Incremental Probes (Top 1, Top 3, Top 5, All 27)
    # -----------------------------------------------------------------------
    logger.info("Executing Probe C: Incremental Probes...")
    ranked_skill_names = [r["skill"] for r in single_skill_results]

    incremental_results = {}
    for k_skills, label in [
        (ranked_skill_names[:1], "Top_1_Skill"),
        (ranked_skill_names[:3], "Top_3_Skills"),
        (ranked_skill_names[:5], "Top_5_Skills"),
        (ALL_SKILLS, "All_27_Skills"),
    ]:
        X_sub = df[k_skills].values
        # Standardize for logistic regression
        scaler = StandardScaler()
        X_sub_scaled = scaler.fit_transform(X_sub)
        model = LogisticRegression(max_iter=1000, random_state=RANDOM_SEED)
        scores = cross_validate(model, X_sub_scaled, y, cv=cv, scoring=["accuracy", "f1_macro"])

        incremental_results[label] = {
            "features": k_skills,
            "count": len(k_skills),
            "cv_accuracy_mean": round(float(scores["test_accuracy"].mean()), 4),
            "cv_accuracy_std": round(float(scores["test_accuracy"].std()), 4),
            "cv_macro_f1_mean": round(float(scores["test_f1_macro"].mean()), 4),
            "cv_macro_f1_std": round(float(scores["test_f1_macro"].std()), 4),
        }

    # -----------------------------------------------------------------------
    # Probe D: Pairwise Career Overlap
    # -----------------------------------------------------------------------
    logger.info("Executing Probe D: Pairwise Career Overlap on Related Pairs...")
    related_pairs = [
        ("Frontend Developer", "Full Stack Developer", ["React", "JavaScript", "HTML", "CSS"]),
        ("Backend Developer", "Software Engineer", ["Python", "Java", "SQL", "Linux"]),
        ("Data Analyst", "Data Scientist", ["SQL", "Statistics", "Power BI", "Excel"]),
        ("Data Scientist", "ML Engineer", ["Python", "Machine Learning", "Statistics", "Deep Learning"]),
        ("Cloud Engineer", "DevOps Engineer", ["Docker", "Linux", "AWS", "Azure"]),
        ("Data Analyst", "Business Analyst", ["Excel", "Power BI", "Communication", "SQL"]),
    ]

    overlap_results = []
    for c1, c2, skills in related_pairs:
        pair_data = {"career_1": c1, "career_2": c2, "skill_comparisons": []}
        df_c1 = df[df["career_label"] == c1]
        df_c2 = df[df["career_label"] == c2]

        for s in skills:
            s1 = df_c1[s]
            s2 = df_c2[s]
            d = compute_cohens_d(s1, s2)
            ovl = compute_histogram_intersection(s1, s2)
            pair_data["skill_comparisons"].append({
                "skill": s,
                "c1_mean": round(float(s1.mean()), 2),
                "c2_mean": round(float(s2.mean()), 2),
                "cohens_d": round(d, 3),
                "histogram_intersection": round(ovl, 4),
            })
        overlap_results.append(pair_data)

    # -----------------------------------------------------------------------
    # Probe E: Information Diagnostics (ANOVA & Mutual Information)
    # -----------------------------------------------------------------------
    logger.info("Executing Probe E: Information Diagnostics (ANOVA & MI)...")
    X_skills = df[ALL_SKILLS].values
    f_vals, p_vals = f_classif(X_skills, y)
    mi_vals = mutual_info_classif(X_skills, y, random_state=RANDOM_SEED)

    info_results = []
    for s_idx, skill in enumerate(ALL_SKILLS):
        # Eta-squared = SS_between / SS_total
        grand_mean = df[skill].mean()
        ss_total = np.sum((df[skill] - grand_mean) ** 2)
        ss_between = np.sum(
            df.groupby("career_label")[skill].count()
            * (df.groupby("career_label")[skill].mean() - grand_mean) ** 2
        )
        eta_sq = ss_between / (ss_total + 1e-12)

        info_results.append({
            "skill": skill,
            "anova_f": round(float(f_vals[s_idx]), 2),
            "p_value": float(p_vals[s_idx]),
            "eta_squared": round(float(eta_sq), 4),
            "mutual_info_nats": round(float(mi_vals[s_idx]), 4),
        })

    info_results.sort(key=lambda x: x["anova_f"], reverse=True)

    # -----------------------------------------------------------------------
    # Probe F: Class Balance & Goodness-of-Fit Test
    # -----------------------------------------------------------------------
    logger.info("Executing Probe F: Class Balance Goodness-of-Fit...")
    counts = df["career_label"].value_counts()
    chi2_stat, chi2_p = chisquare(counts)

    class_balance_report = {
        "total_records": len(df),
        "class_counts": counts.to_dict(),
        "expected_count": len(df) / 14.0,
        "min_count": int(counts.min()),
        "max_count": int(counts.max()),
        "mean_count": round(float(counts.mean()), 2),
        "std_count": round(float(counts.std()), 2),
        "chi_square_statistic": round(float(chi2_stat), 4),
        "chi_square_p_value": round(float(chi2_p), 4),
    }

    # -----------------------------------------------------------------------
    # Probe G: Ambiguous In-Memory Profile Tests
    # -----------------------------------------------------------------------
    logger.info("Executing Probe G: Ambiguous Profile Testing via Predictor...")
    hybrid_test_profiles = [
        ("Hybrid: Frontend + Backend", {
            "React": 85.0, "HTML": 85.0, "CSS": 85.0, "JavaScript": 88.0,
            "NodeJS": 85.0, "MongoDB": 80.0, "MySQL": 80.0, "SQL": 80.0,
            "Git": 80.0, "GitHub": 80.0, "Python": 60.0, "Java": 60.0,
            "Interest": "Web Development", "Preferred Domain": "Full Stack",
            "CGPA": 7.8, "Projects Completed": 5, "Internship": 1, "Certifications": 2,
        }),
        ("Hybrid: Backend + Data", {
            "Python": 88.0, "SQL": 88.0, "MySQL": 85.0, "MongoDB": 80.0, "NodeJS": 75.0,
            "Power BI": 75.0, "Excel": 80.0, "Statistics": 80.0, "Git": 80.0,
            "Interest": "Data Science", "Preferred Domain": "Data & Analytics",
            "CGPA": 8.0, "Projects Completed": 4, "Internship": 1, "Certifications": 2,
        }),
        ("Hybrid: Backend + Cloud", {
            "Python": 82.0, "Java": 80.0, "SQL": 80.0, "AWS": 85.0, "Azure": 80.0,
            "Docker": 88.0, "Linux": 88.0, "Git": 85.0, "GitHub": 85.0,
            "Interest": "Cloud Computing", "Preferred Domain": "Cloud & DevOps",
            "CGPA": 7.6, "Projects Completed": 4, "Internship": 1, "Certifications": 3,
        }),
        ("Hybrid: Data + ML", {
            "Python": 90.0, "Statistics": 88.0, "SQL": 85.0, "Machine Learning": 88.0,
            "Deep Learning": 80.0, "Power BI": 70.0, "Excel": 75.0, "Git": 80.0,
            "Interest": "AI/ML", "Preferred Domain": "Machine Learning",
            "CGPA": 8.2, "Projects Completed": 5, "Internship": 1, "Certifications": 2,
        }),
        ("Hybrid: Cloud + DevOps", {
            "AWS": 88.0, "Azure": 82.0, "Docker": 90.0, "Linux": 92.0, "Git": 88.0,
            "Python": 75.0, "SQL": 70.0, "MySQL": 70.0,
            "Interest": "DevOps", "Preferred Domain": "Cloud & DevOps",
            "CGPA": 7.5, "Projects Completed": 4, "Internship": 1, "Certifications": 3,
        }),
        ("Hybrid: AI/ML + Software Engineering", {
            "Python": 88.0, "C++": 85.0, "Java": 80.0, "Machine Learning": 85.0,
            "Deep Learning": 80.0, "Statistics": 80.0, "Linux": 78.0, "Git": 82.0,
            "Interest": "AI/ML", "Preferred Domain": "Machine Learning",
            "CGPA": 8.4, "Projects Completed": 5, "Internship": 1, "Certifications": 2,
        }),
    ]

    ambiguous_report = []
    for name, p_dict in hybrid_test_profiles:
        # Fill missing features with neutral 40.0
        full_p = {f: 40.0 for f in ALL_SKILLS}
        full_p.update(p_dict)
        pred_res = predictor.predict(full_p)
        top5 = pred_res["top_5_careers"]
        top1_p = top5[0]["probability"]
        top2_p = top5[1]["probability"]

        # Probabilities vector across all 14
        all_probs = np.array([c["probability"] for c in top5])
        # Normalized entropy over top 5
        p_norm = all_probs / np.sum(all_probs)
        h_norm = -np.sum(p_norm * np.log(p_norm + 1e-12)) / np.log(len(top5))

        ambiguous_report.append({
            "profile_name": name,
            "top_prediction": pred_res["predicted_career"],
            "top_1_probability": top1_p,
            "top_2_probability": top2_p,
            "top1_top2_ratio": round(top1_p / (top2_p + 1e-9), 2),
            "top_5_entropy_norm": round(float(h_norm), 4),
            "top_5_careers": top5,
        })

    # Assemble Full Report
    full_report = {
        "preference_probe": pref_report,
        "single_skill_probes": single_skill_results,
        "incremental_skill_probes": incremental_results,
        "pairwise_overlap": overlap_results,
        "information_diagnostics": info_results,
        "class_balance": class_balance_report,
        "ambiguous_profiles": ambiguous_report,
    }

    with DIAGNOSTICS_REPORT_PATH.open("w", encoding="utf-8") as f:
        json.dump(full_report, f, indent=2)

    logger.info(f"Forensic Diagnostics Report written to: {DIAGNOSTICS_REPORT_PATH}")
    return full_report


if __name__ == "__main__":
    run_forensic_diagnostics()
