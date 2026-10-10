"""
CareerCompass — Cross-Validation & Out-of-Fold Modeling Engine (Phase 3.2)
Executes 5-Fold Stratified Cross-Validation strictly maintaining preprocessing
isolation inside each fold to guarantee zero data leakage.
"""

from typing import Dict, Any, List, Tuple
from pathlib import Path
import json
import pandas as pd
import numpy as np
from sklearn.model_selection import StratifiedKFold

from src.utils.reproducibility import get_base_dir, load_config, set_seed
from src.preprocessing.pipeline import PrimaryPreprocessor
from src.models.baseline_models import get_dummy_classifier, get_logistic_regression, get_random_forest
from src.models.evaluation import compute_metrics, plot_and_save_confusion_matrix


def run_cross_validation_for_model(
    model_factory,
    model_name: str,
    train_df: pd.DataFrame,
    target_col: str,
    cat_cols: List[str],
    skill_col: str,
    n_splits: int = 5,
    random_state: int = 42,
) -> Dict[str, Any]:
    """
    Executes 5-fold stratified cross validation for a single model family.
    Guarantees that PrimaryPreprocessor is instantiated and fitted ONLY on
    the training portion of each fold.
    """
    set_seed(random_state)
    skf = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=random_state)

    y_all = train_df[target_col].values
    classes = sorted(list(np.unique(y_all)))
    n_samples = len(train_df)
    n_classes = len(classes)

    oof_preds = np.empty(n_samples, dtype=object)
    oof_probs = np.zeros((n_samples, n_classes), dtype=np.float64)
    fold_indices_record = []

    fold_metrics_list = []

    for fold_idx, (train_idx, val_idx) in enumerate(skf.split(train_df, y_all)):
        # 1. Isolate fold partitions
        fold_train_df = train_df.iloc[train_idx].copy()
        fold_val_df = train_df.iloc[val_idx].copy()

        y_fold_train = fold_train_df[target_col].values
        y_fold_val = fold_val_df[target_col].values

        # 2. Fit preprocessing ONLY on training fold (Zero leakage rule)
        preprocessor = PrimaryPreprocessor(cat_cols=cat_cols, skill_col=skill_col)
        X_fold_train_proc = preprocessor.fit_transform(fold_train_df)
        X_fold_val_proc = preprocessor.transform(fold_val_df)

        # 3. Instantiate and train model
        model = model_factory(random_state=random_state)
        model.fit(X_fold_train_proc, y_fold_train)

        # 4. Predict probabilities and classes on validation fold
        # Match probability columns to global sorted classes list
        model_classes = list(model.classes_)
        raw_val_probs = model.predict_proba(X_fold_val_proc)

        # Align probability array with global classes order
        val_probs = np.zeros((len(val_idx), n_classes), dtype=np.float64)
        for i, c in enumerate(model_classes):
            global_col_idx = classes.index(c)
            val_probs[:, global_col_idx] = raw_val_probs[:, i]

        val_preds = model.predict(X_fold_val_proc)

        # Store in OOF containers
        oof_preds[val_idx] = val_preds
        oof_probs[val_idx] = val_probs

        # 5. Compute fold-specific metrics
        fold_eval = compute_metrics(y_fold_val, val_preds, val_probs, classes)
        fold_metrics_list.append(fold_eval)

        fold_indices_record.append({
            "fold": fold_idx + 1,
            "train_indices": train_idx.tolist(),
            "val_indices": val_idx.tolist(),
        })

    # Aggregate metric means & stds across folds
    macro_f1_scores = [f["macro_f1"] for f in fold_metrics_list]
    weighted_f1_scores = [f["weighted_f1"] for f in fold_metrics_list]
    log_losses = [f["log_loss"] for f in fold_metrics_list]
    top2_accuracies = [f["top2_accuracy"] for f in fold_metrics_list]
    accuracies = [f["accuracy"] for f in fold_metrics_list]

    # Compute overall Out-Of-Fold metrics across all N samples
    oof_eval = compute_metrics(y_all, oof_preds, oof_probs, classes)

    # Build detailed OOF dataframe
    oof_df = pd.DataFrame({
        "sample_index": train_df.index,
        "true_label": y_all,
        "predicted_label": oof_preds,
    })
    for i, cls_name in enumerate(classes):
        oof_df[f"prob_{cls_name}"] = oof_probs[:, i]

    return {
        "model_name": model_name,
        "classes": classes,
        "n_splits": n_splits,
        "cv_summary": {
            "macro_f1_mean": float(np.mean(macro_f1_scores)),
            "macro_f1_std": float(np.std(macro_f1_scores)),
            "weighted_f1_mean": float(np.mean(weighted_f1_scores)),
            "weighted_f1_std": float(np.std(weighted_f1_scores)),
            "log_loss_mean": float(np.mean(log_losses)),
            "log_loss_std": float(np.std(log_losses)),
            "top2_accuracy_mean": float(np.mean(top2_accuracies)),
            "top2_accuracy_std": float(np.std(top2_accuracies)),
            "accuracy_mean": float(np.mean(accuracies)),
            "accuracy_std": float(np.std(accuracies)),
        },
        "fold_metrics": fold_metrics_list,
        "oof_eval": oof_eval,
        "oof_df": oof_df,
        "fold_splits": fold_indices_record,
    }


def execute_all_baseline_cv(train_df: pd.DataFrame, config: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Runs 5-fold Stratified CV for all 3 baseline model families:
    1. Stratified Dummy Classifier
    2. Multinomial Logistic Regression
    3. Random Forest Classifier
    Saves OOF predictions and confusion matrix figures.
    """
    if config is None:
        config = load_config()

    base_dir = get_base_dir()
    modeling_proc_dir = base_dir / "data" / "processed" / "modeling"
    figures_dir = base_dir / "reports" / "figures"
    modeling_proc_dir.mkdir(parents=True, exist_ok=True)
    figures_dir.mkdir(parents=True, exist_ok=True)

    target_col = config["primary_dataset"]["canonical_target_column"]
    cat_cols = config["primary_dataset"]["features"]["categorical"]
    skill_col = "Skills"
    seed = config["reproducibility"]["random_seed"]

    models_to_run = [
        ("Stratified Dummy", lambda random_state: get_dummy_classifier(strategy="prior", random_state=random_state), "oof_dummy.csv", "cv_confusion_dummy.png"),
        ("Logistic Regression", lambda random_state: get_logistic_regression(C=1.0, max_iter=1000, random_state=random_state), "oof_logistic_regression.csv", "cv_confusion_logistic.png"),
        ("Random Forest", lambda random_state: get_random_forest(n_estimators=300, class_weight="balanced", random_state=random_state), "oof_random_forest.csv", "cv_confusion_random_forest.png"),
    ]

    all_results = {}

    for model_name, factory, oof_fname, fig_fname in models_to_run:
        print(f"\n[CV] Executing 5-Fold Stratified CV for: {model_name}...")
        res = run_cross_validation_for_model(
            model_factory=factory,
            model_name=model_name,
            train_df=train_df,
            target_col=target_col,
            cat_cols=cat_cols,
            skill_col=skill_col,
            n_splits=5,
            random_state=seed,
        )

        # Save OOF predictions
        oof_path = modeling_proc_dir / oof_fname
        res["oof_df"].to_csv(oof_path, index=False)

        # Plot and save confusion matrix
        fig_path = figures_dir / fig_fname
        plot_and_save_confusion_matrix(
            cm_array=np.array(res["oof_eval"]["confusion_matrix"]),
            classes=res["classes"],
            title=f"Out-of-Fold Confusion Matrix — {model_name}",
            output_path=fig_path,
        )

        cv_sum = res["cv_summary"]
        print(f"     Macro F1:       {cv_sum['macro_f1_mean']:.4f} ± {cv_sum['macro_f1_std']:.4f}")
        print(f"     Weighted F1:    {cv_sum['weighted_f1_mean']:.4f} ± {cv_sum['weighted_f1_std']:.4f}")
        print(f"     Log Loss:       {cv_sum['log_loss_mean']:.4f} ± {cv_sum['log_loss_std']:.4f}")
        print(f"     Top-2 Accuracy: {cv_sum['top2_accuracy_mean']:.4f} ± {cv_sum['top2_accuracy_std']:.4f}")

        all_results[model_name] = res

    return all_results
