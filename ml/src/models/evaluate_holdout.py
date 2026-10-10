"""
CareerCompass — Holdout Test Evaluation & Model Serialization (Phase 3.2)
Evaluates trained baseline models ONCE against the untouched 49-sample holdout test set.
Serializes final fitted preprocessor and baseline models.
"""

from typing import Dict, Any, List
from pathlib import Path
import json
import joblib
import pandas as pd
import numpy as np

from src.utils.reproducibility import get_base_dir, load_config, set_seed
from src.preprocessing.pipeline import PrimaryPreprocessor
from src.models.baseline_models import get_dummy_classifier, get_logistic_regression, get_random_forest
from src.models.evaluation import compute_metrics, plot_and_save_confusion_matrix


def evaluate_holdout_test(
    train_df: pd.DataFrame,
    test_df: pd.DataFrame,
    config: Dict[str, Any] = None,
) -> Dict[str, Any]:
    """
    Fits preprocessor and models on full 192 training samples,
    then transforms and evaluates once on untouched 49 holdout test samples.
    Serializes models to ml/models/.
    """
    if config is None:
        config = load_config()

    base_dir = get_base_dir()
    models_dir = base_dir / "ml" / "models" if (base_dir / "ml").exists() else base_dir / "models"
    reports_dir = base_dir / "reports"
    figures_dir = base_dir / "reports" / "figures"
    models_dir.mkdir(parents=True, exist_ok=True)
    reports_dir.mkdir(parents=True, exist_ok=True)
    figures_dir.mkdir(parents=True, exist_ok=True)

    seed = config["reproducibility"]["random_seed"]
    set_seed(seed)

    target_col = config["primary_dataset"]["canonical_target_column"]
    cat_cols = config["primary_dataset"]["features"]["categorical"]
    skill_col = "Skills"

    y_train = train_df[target_col].values
    y_test = test_df[target_col].values
    classes = sorted(list(np.unique(y_train)))

    # 1. Fit preprocessor on ALL training data
    print("\n[Holdout] Fitting PrimaryPreprocessor on full 192 training samples...")
    preprocessor = PrimaryPreprocessor(cat_cols=cat_cols, skill_col=skill_col)
    X_train_proc = preprocessor.fit_transform(train_df)
    X_test_proc = preprocessor.transform(test_df)

    # Save fitted preprocessor
    joblib.dump(preprocessor, models_dir / "preprocessor.joblib")

    # Models to evaluate on holdout
    models = {
        "Stratified Dummy": get_dummy_classifier(strategy="prior", random_state=seed),
        "Logistic Regression": get_logistic_regression(C=1.0, max_iter=1000, random_state=seed),
        "Random Forest": get_random_forest(n_estimators=300, class_weight="balanced", random_state=seed),
    }

    holdout_results = {}

    for name, model in models.items():
        print(f"[Holdout] Training & evaluating: {name}...")
        model.fit(X_train_proc, y_train)

        # Predict on holdout test set
        test_preds = model.predict(X_test_proc)
        raw_test_probs = model.predict_proba(X_test_proc)

        # Align probability columns to global sorted classes
        model_classes = list(model.classes_)
        test_probs = np.zeros((len(test_df), len(classes)), dtype=np.float64)
        for i, c in enumerate(model_classes):
            col_idx = classes.index(c)
            test_probs[:, col_idx] = raw_test_probs[:, i]

        eval_res = compute_metrics(y_test, test_preds, test_probs, classes)
        holdout_results[name] = eval_res

        # Serialize model
        clean_name = name.lower().replace(" ", "_")
        joblib.dump(model, models_dir / f"baseline_{clean_name}.joblib")

        # Save confusion matrix figure
        fig_path = figures_dir / f"holdout_confusion_{clean_name}.png"
        plot_and_save_confusion_matrix(
            cm_array=np.array(eval_res["confusion_matrix"]),
            classes=classes,
            title=f"Holdout Test Confusion Matrix — {name} (N=49)",
            output_path=fig_path,
        )

        print(f"     Accuracy:       {eval_res['accuracy']:.4f}")
        print(f"     Macro F1:       {eval_res['macro_f1']:.4f}")
        print(f"     Weighted F1:    {eval_res['weighted_f1']:.4f}")
        print(f"     Log Loss:       {eval_res['log_loss']:.4f}")
        print(f"     Top-2 Accuracy: {eval_res['top2_accuracy']:.4f}")

    # Generate ml/reports/holdout_test_results.md
    generate_holdout_markdown(holdout_results, classes, reports_dir / "holdout_test_results.md")

    return holdout_results


def generate_holdout_markdown(results: Dict[str, Any], classes: List[str], output_path: Path) -> None:
    """Writes detailed markdown report for holdout test evaluation."""
    lines = [
        "# Holdout Test Evaluation Report (Phase 3.2)",
        "## Unseen Test Evaluation (N = 49 samples, 20.3% held-out)",
        "",
        "- **Evaluation Protocol**: The 49-row test set remained strictly isolated during cross-validation.",
        "- **Training Basis**: Models were trained on the full 192 training samples using the fitted `PrimaryPreprocessor`.",
        "- **Evaluation Date**: Single evaluation run (No iterative parameter tuning against holdout data).",
        "",
        "---",
        "",
        "## 1. Overall Model Performance on Held-Out Test Data",
        "| Model | Accuracy | Macro F1 | Weighted F1 | Log Loss | Top-2 Accuracy |",
        "|---|:---:|:---:|:---:|:---:|:---:|",
    ]

    for model_name, res in results.items():
        lines.append(
            f"| **{model_name}** | {res['accuracy']:.4f} | {res['macro_f1']:.4f} | "
            f"{res['weighted_f1']:.4f} | {res['log_loss']:.4f} | {res['top2_accuracy']:.4f} |"
        )

    lines.extend([
        "",
        "---",
        "",
        "## 2. Per-Class Performance on Test Set",
    ])

    for model_name, res in results.items():
        lines.extend([
            f"### {model_name}",
            "| Career Track | Precision | Recall | F1-Score | Support |",
            "|---|:---:|:---:|:---:|:---:|",
        ])
        for cls_name in classes:
            pc = res["per_class"][cls_name]
            lines.append(
                f"| `{cls_name}` | {pc['precision']:.4f} | {pc['recall']:.4f} | {pc['f1']:.4f} | {pc['support']} |"
            )
        lines.append("")

    lines.extend([
        "---",
        "",
        "## 3. Methodological Observations",
        "1. **Holdout Alignment with Cross-Validation**: Performance on the 49 held-out test samples demonstrates whether CV estimates generalized without overfitting.",
        "2. **Minority Class Performance**: Particular scrutiny is placed on `Cloud, DevOps & Systems Engineering` (4 test samples) to assess true minority discrimination.",
        "3. **Zero Data Leakage Verification**: All preprocessing transformations applied to test data utilized parameters fitted exclusively on the 192 training records.",
    ])

    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
