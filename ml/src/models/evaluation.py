"""
CareerCompass — Evaluation & Metrics Module (Phase 3.2)
Calculates multi-class classification metrics: Macro F1, Weighted F1,
Log Loss, Top-2 Accuracy, per-class metrics, and confusion matrix visualizations.
"""

from typing import Dict, Any, List
from pathlib import Path
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend
import matplotlib.pyplot as plt
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    precision_score,
    recall_score,
    log_loss,
    confusion_matrix,
    classification_report,
)


def compute_top_k_accuracy(y_true: np.ndarray, y_prob: np.ndarray, classes: List[str], k: int = 2) -> float:
    """
    Computes Top-K Accuracy: proportion of samples where the ground truth label
    is among the top K highest predicted class probabilities.
    """
    if len(y_true) == 0:
        return 0.0

    class_to_idx = {cls_name: i for i, cls_name in enumerate(classes)}
    y_true_indices = np.array([class_to_idx[y] for y in y_true])

    # Get indices of top k probabilities per sample
    # argsort along axis 1 gives ascending order, take last k
    top_k_indices = np.argsort(y_prob, axis=1)[:, -k:]

    # Check if true index is in top k
    hits = np.any(top_k_indices == y_true_indices[:, None], axis=1)
    return float(np.mean(hits))


def compute_metrics(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    y_prob: np.ndarray,
    classes: List[str],
) -> Dict[str, Any]:
    """
    Computes full multi-class performance profile:
    - Overall accuracy
    - Macro F1 & Weighted F1
    - Multi-class Log Loss (Cross-Entropy)
    - Top-2 Accuracy
    - Per-class Precision, Recall, F1, and Support
    - Confusion Matrix
    """
    classes_list = list(classes)

    acc = float(accuracy_score(y_true, y_pred))
    macro_f1 = float(f1_score(y_true, y_pred, average="macro", zero_division=0))
    weighted_f1 = float(f1_score(y_true, y_pred, average="weighted", zero_division=0))

    # Log loss
    try:
        loss = float(log_loss(y_true, y_prob, labels=classes_list))
    except Exception:
        # Fallback if probability clipping occurs
        clipped_prob = np.clip(y_prob, 1e-15, 1 - 1e-15)
        clipped_prob = clipped_prob / clipped_prob.sum(axis=1, keepdims=True)
        loss = float(log_loss(y_true, clipped_prob, labels=classes_list))

    top2_acc = compute_top_k_accuracy(y_true, y_prob, classes_list, k=2)

    # Per-class metrics
    per_class_p = precision_score(y_true, y_pred, labels=classes_list, average=None, zero_division=0)
    per_class_r = recall_score(y_true, y_pred, labels=classes_list, average=None, zero_division=0)
    per_class_f = f1_score(y_true, y_pred, labels=classes_list, average=None, zero_division=0)

    # Support counts
    unique, counts = np.unique(y_true, return_counts=True)
    support_map = dict(zip(unique, counts))

    per_class_dict = {}
    for i, cls_name in enumerate(classes_list):
        per_class_dict[cls_name] = {
            "precision": float(per_class_p[i]),
            "recall": float(per_class_r[i]),
            "f1": float(per_class_f[i]),
            "support": int(support_map.get(cls_name, 0)),
        }

    # Confusion matrix
    cm = confusion_matrix(y_true, y_pred, labels=classes_list)

    return {
        "accuracy": acc,
        "macro_f1": macro_f1,
        "weighted_f1": weighted_f1,
        "log_loss": loss,
        "top2_accuracy": top2_acc,
        "per_class": per_class_dict,
        "confusion_matrix": cm.tolist(),
        "classes": classes_list,
    }


def plot_and_save_confusion_matrix(
    cm_array: np.ndarray,
    classes: List[str],
    title: str,
    output_path: Path,
) -> None:
    """
    Generates and saves a clean, publication-grade confusion matrix heatmap.
    """
    output_path.parent.mkdir(parents=True, exist_ok=True)
    cm = np.array(cm_array)

    fig, ax = plt.subplots(figsize=(8, 6))
    im = ax.imshow(cm, interpolation="nearest", cmap="Blues")
    ax.figure.colorbar(im, ax=ax)

    # Shorten class names for readability on ticks
    short_labels = [c.replace(" & ", "\n& ").replace(" Engineering", "\nEng") for c in classes]

    ax.set(
        xticks=np.arange(len(classes)),
        yticks=np.arange(len(classes)),
        xticklabels=short_labels,
        yticklabels=short_labels,
        title=title,
        ylabel="Ground Truth Label",
        xlabel="Predicted Label",
    )
    plt.setp(ax.get_xticklabels(), rotation=30, ha="right", rotation_mode="anchor")

    # Annotate numbers inside cells
    thresh = cm.max() / 2.0 if cm.max() > 0 else 1.0
    for i in range(len(classes)):
        for j in range(len(classes)):
            val = cm[i, j]
            ax.text(
                j, i, format(val, "d"),
                ha="center", va="center",
                color="white" if val > thresh else "black",
                fontweight="bold"
            )

    fig.tight_layout()
    plt.savefig(output_path, dpi=200, bbox_inches="tight")
    plt.close(fig)
