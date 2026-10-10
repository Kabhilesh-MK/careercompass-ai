"""
CareerCompass — Phase 3.4 / 3.4.1 Experiment D: Local Explanation Examples
Generates interpretable local feature contribution profiles for representative training examples
using the selected Candidate H model (Random Forest, skills-only 29 features).

Strict Scientific Safeguards:
- Uses ONLY training data samples (N = 192); holdout test set (N = 49) is NEVER used.
- Uses exact tree-path probability decomposition for Random Forest:
  P(Y = c | x) = p_base,c + sum_j delta_p_c,j(x)
- Uses non-causal scientific language throughout ("associated with", "contributes to prediction").
"""

from typing import Dict, Any, List
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

from src.utils.reproducibility import get_base_dir, set_seed
from src.models.feature_ablation import SkillsOnlyPreprocessor


def compute_instance_tree_contributions(
    rf: RandomForestClassifier,
    x_vec: np.ndarray,
    classes: List[str],
) -> tuple:
    """
    Computes exact tree-path probability contributions for a single instance vector x_vec.
    Returns:
        (base_priors, contributions)
        base_priors: shape (n_classes,)
        contributions: shape (n_classes, n_features)
    """
    n_features = len(x_vec)
    n_classes = len(classes)
    n_estimators = len(rf.estimators_)
    model_classes = list(rf.classes_)
    
    total_contrib = np.zeros((n_classes, n_features), dtype=np.float64)
    base_prior = np.zeros(n_classes, dtype=np.float64)

    for tree in rf.estimators_:
        tree_ = tree.tree_
        node_vals = tree_.value[:, 0, :]
        node_probs = node_vals / np.clip(np.sum(node_vals, axis=1, keepdims=True), 1e-15, None)
        
        # Align root probs to classes
        tree_root_aligned = np.zeros(n_classes, dtype=np.float64)
        for i, c in enumerate(model_classes):
            tree_root_aligned[classes.index(c)] = node_probs[0, i]
        base_prior += tree_root_aligned

        # Traverse decision path for x_vec
        node = 0
        while tree_.children_left[node] != tree_.children_right[node]:
            feature = tree_.feature[node]
            threshold = tree_.threshold[node]
            curr_prob = node_probs[node]
            
            if x_vec[feature] <= threshold:
                next_node = tree_.children_left[node]
            else:
                next_node = tree_.children_right[node]
                
            next_prob = node_probs[next_node]
            delta = next_prob - curr_prob
            
            # Map delta to sorted classes
            for i, c in enumerate(model_classes):
                total_contrib[classes.index(c), feature] += delta[i]
                
            node = next_node

    base_prior /= n_estimators
    total_contrib /= n_estimators
    return base_prior, total_contrib


def generate_local_explanations(
    train_df: pd.DataFrame,
    target_col: str = "canonical_career_track",
    skill_col: str = "Skills",
    random_state: int = 42,
    output_dir: Path = None,
) -> Dict[str, Any]:
    """
    Computes local tree-path feature contributions for 3 representative training samples:
    - Example 1: AI & Machine Learning Engineering (Index 4)
    - Example 2: Data Analytics & Business Intelligence (Index 1)
    - Example 3: Software Development & Engineering (Index 2)
    """
    if output_dir is None:
        output_dir = get_base_dir() / "reports"
    output_dir.mkdir(parents=True, exist_ok=True)

    set_seed(random_state)

    y_train = train_df[target_col].values
    classes = sorted(list(np.unique(y_train)))

    # Fit SkillsOnlyPreprocessor on training data only
    prep = SkillsOnlyPreprocessor(skill_col=skill_col)
    X_train_df = prep.fit_transform(train_df)
    feature_names = prep.get_feature_names_out()
    X_train_mat = X_train_df.values

    # Fit Candidate H (Random Forest)
    model = RandomForestClassifier(
        n_estimators=300,
        random_state=random_state,
        n_jobs=-1,
        class_weight=None,
    )
    model.fit(X_train_mat, y_train)

    selected_indices = [
        {"idx": 4, "role": "AI & Machine Learning Engineering", "example_name": "Example 1 (AI/ML Record)"},
        {"idx": 1, "role": "Data Analytics & Business Intelligence", "example_name": "Example 2 (Data Analytics/BI Record)"},
        {"idx": 2, "role": "Software Development & Engineering", "example_name": "Example 3 (Software Engineering Record)"},
    ]

    examples_data = []

    for ex in selected_indices:
        row_idx = ex["idx"]
        raw_row = train_df.iloc[row_idx]
        true_label = raw_row[target_col]
        x_vec = X_train_mat[row_idx]

        # Compute exact tree path decomposition
        base_priors, contribs = compute_instance_tree_contributions(model, x_vec, classes)
        probs = base_priors + np.sum(contribs, axis=1)
        probs = np.clip(probs, 0.0, 1.0)
        probs = probs / np.sum(probs)

        pred_idx = int(np.argmax(probs))
        pred_label = classes[pred_idx]

        # Active features (x_j > 0)
        active_indices = np.where(x_vec > 0)[0]
        
        # Contributions to predicted class
        pred_base = base_priors[pred_idx]
        feature_contributions = []
        for i in active_indices:
            fn = feature_names[i]
            c_val = contribs[pred_idx, i]
            feature_contributions.append({
                "feature_name": fn,
                "clean_name": fn.replace("skill_", "Skill: ").replace("_", " ").title(),
                "feature_value": float(x_vec[i]),
                "contribution": float(c_val),
            })

        feature_contributions.sort(key=lambda d: d["contribution"], reverse=True)

        examples_data.append({
            "example_meta": ex,
            "row_index": int(row_idx),
            "raw_profile": {
                "Education_Level": str(raw_row.get("Education_Level", "")),
                "Specialization": str(raw_row.get("Specialization", "")),
                "Interests": str(raw_row.get("Interests", "")),
                "Skills": str(raw_row.get("Skills", "")),
            },
            "true_class": true_label,
            "predicted_class": pred_label,
            "is_correct": bool(true_label == pred_label),
            "probabilities": {classes[k]: float(probs[k]) for k in range(len(classes))},
            "base_prior": float(pred_base),
            "contributions": feature_contributions,
        })

    # Generate Markdown Report
    md_content = generate_local_explanations_markdown(examples_data, classes)
    md_path = output_dir / "local_explanation_examples.md"
    with open(md_path, "w", encoding="utf-8") as f:
        f.write(md_content)
    print(f"[Local Explanations] Saved local explanation report to {md_path}")

    return {
        "examples_data": examples_data,
        "classes": classes,
    }


def generate_local_explanations_markdown(examples_data: List[Dict[str, Any]], classes: List[str]) -> str:
    """Generates the Markdown report documenting local feature attributions."""
    lines = [
        "# Phase 3.4 / 3.4.1 Local Model Explanation Examples",
        "## Instance-Level Tree-Path Probability Attribution for Candidate H (Random Forest)",
        "",
        "**Protocol**: Evaluated strictly on Primary Training Data ($N = 192$). Zero holdout samples were used.",
        "**Attribution Methodology**: In Random Forest ensembles, local instance predictions decompose additively across decision trees:",
        "$$P(Y = c \\mid \\mathbf{x}) = \\bar{p}_{\\text{root}, c} + \\sum_{j} \\Delta p_{c, j}(\\mathbf{x})$$",
        "where $\\bar{p}_{\\text{root}, c}$ is the average root node empirical prior across all 300 decision trees, and $\\Delta p_{c, j}(\\mathbf{x})$ is the average probability delta contributed by all internal tree nodes that split on skill $j$ along the specific decision paths traversed by $\\mathbf{x}$.",
        "",
        "> [!IMPORTANT]",
        "> **Non-Causal Standard**: Local probability contributions reflect the model's internal decision partitions on the training benchmark; they do not imply that acquiring a skill guarantees a real-world career outcome.",
        "",
        "---",
        "",
    ]

    for ex in examples_data:
        meta = ex["example_meta"]
        raw = ex["raw_profile"]
        probs = ex["probabilities"]
        conts = ex["contributions"]

        lines.extend([
            f"## {meta['example_name']}",
            f"**Training Sample Index**: `Row #{ex['row_index']}`",
            "",
            "### 1. Input Feature Profile",
            "",
            "| Profile Field | Value |",
            "|---|---|",
            f"| **Skills Profile** | `{raw['Skills']}` |",
            f"| **Academic Background** | `{raw['Education_Level']} in {raw['Specialization']}` |",
            f"| **Reported Interests** | `{raw['Interests']}` |",
            "",
            "### 2. Candidate H Prediction Distribution",
            "",
            "| Career Track | Posterior Probability | Classification Status |",
            "|---|:---:|:---:|",
        ])

        for c in classes:
            p_val = probs[c]
            is_pred = (c == ex["predicted_class"])
            tag = "**Predicted Track**" if is_pred else "Alternative Track"
            lines.append(f"| `{c}` | **{p_val * 100:.2f}%** | {tag} |")

        lines.extend([
            "",
            f"**True Label**: `{ex['true_class']}` | **Match**: {'Correct' if ex['is_correct'] else 'Incorrect'}",
            "",
            f"### 3. Tree-Path Probability Attribution for `{ex['predicted_class']}`",
            f"$$\\bar{{p}}_{{\\text{{root}}}}(\\text{{{ex['predicted_class']}}}) = {ex['base_prior']:.4f}$$",
            "",
            "| Skill Indicator | Binary Value | Probability Contribution ($\\Delta p$) | Attribution Role |",
            "|---|:---:|:---:|---|",
        ])

        for c in conts:
            c_val = c["contribution"]
            role = "Strong Positive Driver" if c_val > 0.05 else "Moderate Positive Driver" if c_val > 0 else "Neutral / Dampener"
            lines.append(f"| `{c['clean_name']}` | `{int(c['feature_value'])}` | **{c_val:+.4f}** | {role} |")

        lines.extend([
            "",
            "---",
            "",
        ])

    return "\n".join(lines)


if __name__ == "__main__":
    base_dir = get_base_dir()
    train_df = pd.read_csv(base_dir / "data" / "processed" / "primary" / "train.csv")
    generate_local_explanations(train_df)
