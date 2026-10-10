# Phase 3.4 Feature Pruning Safety Check & Collinearity Audit
## Empirical Investigation of Feature Degeneracy, Redundancy, and Pruning Safety

**Protocol**: Audited strictly on Primary Training Data ($N = 192$) transformed via `PrimaryPreprocessor`.
**Guiding Policy**: Do NOT blindly remove correlated features. Document redundancy and evaluate controlled pruning.

---

## 1. Zero-Variance & Near-Zero-Variance Feature Audit

- **Total Extracted Features**: `60` (31 Categorical One-Hot + 29 Skill Multi-Hot)
- **Zero-Variance Features Detected**: `0`
- **Duplicate Column Names Detected**: `0`

> [!NOTE]
> **Zero-Variance Finding**: **No zero-variance features exist** in the training feature representation. Every one of the 60 transformed dimensions varies across training observations.

### Near-Zero-Variance Features (Support Count $\le 3$ Samples)

| Feature Name | Variance | Active Sample Count | Percentage of Training Set |
|---|:---:|:---:|:---:|
| `Specialization_Electrical` | `0.0155` | 3/192 | `1.56%` |
| `Skill: autocad` | `0.0104` | 2/192 | `1.04%` |
| `Skill: machine_learning` | `0.0104` | 2/192 | `1.04%` |

---

## 2. Duplicate Co-occurrence & High Collinearity Audit ($r \ge 0.85$)

The following feature pairs exhibit extreme linear correlation ($r \ge 0.85$) due to structural survey artifacts or deterministic degree requirements:

| Feature 1 | Feature 2 | Pearson Correlation ($r$) | Structural Explanation |
|---|---|:---:|---|
| `Education_Level_BCA` | `Specialization_Computer Applications` | `1.0000` | Deterministic curriculum co-occurrence (All BCA students report Computer Applications & Web/DB skills) |
| `Education_Level_BCA` | `Skill: database_systems` | `1.0000` | Deterministic curriculum co-occurrence (All BCA students report Computer Applications & Web/DB skills) |
| `Education_Level_BCA` | `Skill: web_development` | `1.0000` | Deterministic curriculum co-occurrence (All BCA students report Computer Applications & Web/DB skills) |
| `Specialization_Computer Applications` | `Skill: database_systems` | `1.0000` | Deterministic curriculum co-occurrence (All BCA students report Computer Applications & Web/DB skills) |
| `Specialization_Computer Applications` | `Skill: web_development` | `1.0000` | Deterministic curriculum co-occurrence (All BCA students report Computer Applications & Web/DB skills) |
| `Skill: autocad` | `Skill: machine_learning` | `1.0000` | Survey skill bundle (skills were selected together as compound options) |
| `Skill: cloud` | `Skill: programming` | `1.0000` | Survey skill bundle (skills were selected together as compound options) |
| `Skill: data_analysis` | `Skill: experimentation` | `1.0000` | Survey skill bundle (skills were selected together as compound options) |
| `Skill: database_systems` | `Skill: web_development` | `1.0000` | Survey skill bundle (skills were selected together as compound options) |
| `Skill: design` | `Skill: plc` | `1.0000` | Survey skill bundle (skills were selected together as compound options) |
| `Skill: design` | `Skill: pscad` | `1.0000` | Survey skill bundle (skills were selected together as compound options) |
| `Skill: excel` | `Skill: team_management` | `1.0000` | Survey skill bundle (skills were selected together as compound options) |
| `Skill: lab_work` | `Skill: research` | `1.0000` | Survey skill bundle (skills were selected together as compound options) |
| `Skill: negotiation` | `Skill: sales` | `1.0000` | Survey skill bundle (skills were selected together as compound options) |
| `Skill: observation` | `Skill: recording` | `1.0000` | Survey skill bundle (skills were selected together as compound options) |
| `Skill: plc` | `Skill: pscad` | `1.0000` | Survey skill bundle (skills were selected together as compound options) |
| `Skill: ai` | `Skill: cloud` | `0.8849` | Survey skill bundle (skills were selected together as compound options) |
| `Skill: ai` | `Skill: programming` | `0.8849` | Survey skill bundle (skills were selected together as compound options) |

---

## 3. Controlled 5-Fold Cross-Validation Comparison

Comparing the performance of Candidate A with the original combined feature set vs the zero-variance-pruned feature set:

| Feature Configuration | Active Features | Macro F1 | Weighted F1 | Multi-Class Log Loss | Overall Accuracy |
|---|:---:|:---:|:---:|:---:|:---:|
| **Original Combined Set** | 60 | **0.6188 ± 0.0562** | **0.7459** | **0.4704** | **0.7752** |
| **Zero-Variance Pruned Set** | 60 | **0.6188 ± 0.0562** | **0.7459** | **0.4704** | **0.7752** |

---

## 4. Methodological Conclusion & Safety Recommendation

1. **Zero-Variance Pruning is a No-Op**: Because all 60 features possess non-zero variance ($s^2 \ge 0.0104$), no features are removed under a strict zero-variance rule.
2. **Regularization Naturally Protects Against Collinearity**: In Multinomial Logistic Regression, L2 ridge regularization (penalty='l2', C=1.0) shrinks collinear coefficients smoothly, distributing the weight across correlated features without causing numerical instability.
3. **Retaining the Full 60-Feature Set is Defensible**: Blindly pruning collinear pairs (such as `skill_cloud` or `skill_database_systems`) would discard domain-specific terminology that downstream users and explanation modules rely upon. Retaining the complete 60-feature schema is mathematically safe under L2 regularization.
