"""
CareerCompass — RIASEC Psychometric Benchmark Module (Phase 3.2)
Executes 5-Fold Stratified CV across Config A (5 aptitude features)
and Config B (Config A + 6 Holland RIASEC traits) to answer whether
adding psychometric traits improves vocational alignment benchmarking.
KEPT COMPLETELY ISOLATED FROM THE PRIMARY MODEL.
"""

from typing import Dict, Any, List
from pathlib import Path
import json
import pandas as pd
import numpy as np
from sklearn.model_selection import StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

from src.utils.reproducibility import get_base_dir, load_config, set_seed
from src.models.baseline_models import get_dummy_classifier, get_logistic_regression, get_random_forest
from src.models.evaluation import compute_metrics


def evaluate_riasec_configuration(
    df: pd.DataFrame,
    feature_cols: List[str],
    target_col: str,
    config_name: str,
    n_splits: int = 5,
    random_state: int = 42,
) -> Dict[str, Any]:
    """
    Executes 5-fold Stratified CV on a specific RIASEC feature configuration.
    Features are scaled with StandardScaler inside each fold for Logistic Regression.
    """
    set_seed(random_state)
    skf = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=random_state)

    X = df[feature_cols].values
    y = df[target_col].values
    classes = sorted(list(np.unique(y)))
    n_classes = len(classes)

    model_factories = {
        "Dummy (Prior)": lambda: get_dummy_classifier(strategy="prior", random_state=random_state),
        "Logistic Regression": lambda: Pipeline([
            ("scaler", StandardScaler()),
            ("clf", get_logistic_regression(C=1.0, max_iter=1000, random_state=random_state))
        ]),
        "Random Forest": lambda: get_random_forest(n_estimators=300, class_weight="balanced", random_state=random_state),
    }

    results = {}

    for model_name, factory in model_factories.items():
        macro_f1s = []
        weighted_f1s = []
        log_losses = []
        top2_accs = []
        accuracies = []

        for fold_idx, (train_idx, val_idx) in enumerate(skf.split(X, y)):
            X_tr, y_tr = X[train_idx], y[train_idx]
            X_va, y_va = X[val_idx], y[val_idx]

            model = factory()
            model.fit(X_tr, y_tr)

            preds = model.predict(X_va)
            raw_probs = model.predict_proba(X_va)

            # Align probability order
            if hasattr(model, "classes_"):
                m_classes = list(model.classes_)
            else:
                m_classes = list(model.named_steps["clf"].classes_)

            val_probs = np.zeros((len(val_idx), n_classes), dtype=np.float64)
            for i, c in enumerate(m_classes):
                col_idx = classes.index(c)
                val_probs[:, col_idx] = raw_probs[:, i]

            eval_res = compute_metrics(y_va, preds, val_probs, classes)
            macro_f1s.append(eval_res["macro_f1"])
            weighted_f1s.append(eval_res["weighted_f1"])
            log_losses.append(eval_res["log_loss"])
            top2_accs.append(eval_res["top2_accuracy"])
            accuracies.append(eval_res["accuracy"])

        results[model_name] = {
            "macro_f1_mean": float(np.mean(macro_f1s)),
            "macro_f1_std": float(np.std(macro_f1s)),
            "weighted_f1_mean": float(np.mean(weighted_f1s)),
            "weighted_f1_std": float(np.std(weighted_f1s)),
            "log_loss_mean": float(np.mean(log_losses)),
            "log_loss_std": float(np.std(log_losses)),
            "top2_accuracy_mean": float(np.mean(top2_accs)),
            "top2_accuracy_std": float(np.std(top2_accs)),
            "accuracy_mean": float(np.mean(accuracies)),
            "accuracy_std": float(np.std(accuracies)),
        }

    return results


def run_riasec_benchmark(config: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Runs side-by-side 5-fold CV evaluation of Config A vs Config B on RIASEC dataset.
    """
    if config is None:
        config = load_config()

    base_dir = get_base_dir()
    riasec_dir = base_dir / config["paths"]["processed_dir"] / "riasec"

    df_a = pd.read_csv(riasec_dir / "riasec_config_a.csv")
    df_b = pd.read_csv(riasec_dir / "riasec_config_b.csv")
    target_col = config["riasec_dataset"]["target_column"]

    feat_a = config["riasec_dataset"]["config_a_features"]
    feat_b = config["riasec_dataset"]["config_b_features"]
    seed = config["reproducibility"]["random_seed"]

    print("\n[RIASEC Benchmark] Evaluating Config A (Cognitive/Aptitude, 5 features)...")
    res_a = evaluate_riasec_configuration(df_a, feat_a, target_col, "Config A", n_splits=5, random_state=seed)
    for m, vals in res_a.items():
        print(f"     {m:22s} | Macro F1: {vals['macro_f1_mean']:.4f} ± {vals['macro_f1_std']:.4f} | Log Loss: {vals['log_loss_mean']:.4f} | Top-2 Acc: {vals['top2_accuracy_mean']:.4f}")

    print("\n[RIASEC Benchmark] Evaluating Config B (Full Psychometric, 11 features)...")
    res_b = evaluate_riasec_configuration(df_b, feat_b, target_col, "Config B", n_splits=5, random_state=seed)
    for m, vals in res_b.items():
        print(f"     {m:22s} | Macro F1: {vals['macro_f1_mean']:.4f} ± {vals['macro_f1_std']:.4f} | Log Loss: {vals['log_loss_mean']:.4f} | Top-2 Acc: {vals['top2_accuracy_mean']:.4f}")

    return {
        "config_a": res_a,
        "config_b": res_b,
    }
