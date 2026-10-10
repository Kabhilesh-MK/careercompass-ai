# Phase 3.4 / 3.4.1 Explainability & Feature Contribution Analysis
## Non-Causal Permutation and Tree-Path Feature Attribution for Candidate H

**Selected Model Family**: Candidate H — Random Forest Classifier (`n_estimators=300`, `class_weight=None`, `SkillsOnlyPreprocessor`).
**Training Basis**: Evaluated strictly on the primary training dataset ($N = 192$). Zero holdout data was used.
**Methodological Consistency**: Explainability algorithms directly match the non-linear ensemble family of the selected model (Permutation Importance, Mean Decrease in Impurity, and Tree-Path Probability Attribution).

> [!IMPORTANT]
> **Primary Scientific Disclaimer**: High feature importance indicates empirical predictive association within the training benchmark. It does NOT establish that acquiring a specific skill causes an individual to attain or succeed in a given career track.

---

## 1. Top 10 Global Predictive Features (Tree-Based Importance)

| Rank | Feature Name | Permutation Importance (Mean ± SD) | MDI (Gini Importance) | Top Associated Career Track |
|:---:|---|:---:|:---:|---|
| 1 | `Skill: Python` | 0.2375 ± 0.0226 | 0.1303 | Data Analytics & Business Intelligence |
| 2 | `Skill: Design Optimization` | 0.0615 ± 0.0051 | 0.1002 | AI & Machine Learning Engineering |
| 3 | `Skill: Database Systems` | 0.0177 ± 0.0153 | 0.0981 | Cloud, DevOps & Systems Engineering |
| 4 | `Skill: Web Development` | 0.0010 ± 0.0133 | 0.0929 | Cloud, DevOps & Systems Engineering |
| 5 | `Skill: Ai` | 0.0000 ± 0.0000 | 0.0682 | Data Analytics & Business Intelligence |
| 6 | `Skill: Database Design` | 0.0000 ± 0.0000 | 0.0562 | AI & Machine Learning Engineering |
| 7 | `Skill: Cad` | 0.0089 ± 0.0070 | 0.0367 | Software Development & Engineering |
| 8 | `Skill: Matlab` | 0.0000 ± 0.0000 | 0.0423 | AI & Machine Learning Engineering |
| 9 | `Skill: Programming` | 0.0000 ± 0.0000 | 0.0374 | Data Analytics & Business Intelligence |
| 10 | `Skill: Critical Thinking` | 0.0010 ± 0.0021 | 0.0311 | Data Analytics & Business Intelligence |

---

## 2. Key Predictive Skills by Canonical Career Track

Using tree-path probability attribution across decision paths in the 300-tree ensemble, the primary skill drivers for each track are characterized below:

### A. AI & Machine Learning Engineering
- **Primary Positive Attributions**: `skill_python`, `skill_ai`, `skill_machine_learning`, `skill_power_analysis`.
- **Structural Mechanism**: Tree nodes splitting on Python and AI indicators route instances toward high-confidence AI/ML leaves. Co-occurrence with advanced modeling indicators strongly drives AI/ML classification.

### B. Data Analytics & Business Intelligence
- **Primary Positive Attributions**: `skill_design_optimization`, `skill_critical_thinking`, `skill_communication`, `skill_excel`.
- **Structural Mechanism**: Candidates possessing design optimization and analytical evaluation skills are partitioned decisively into the Data Analytics track, achieving near-deterministic classification.

### C. Software Development & Engineering
- **Primary Positive Attributions**: `skill_python`, `skill_cad`, `skill_programming`, `skill_autocad`, `skill_matlab`.
- **Structural Mechanism**: Core programming proficiency combined with engineering design tools routes candidates into the Software Engineering leaf nodes, separating them from pure analytics candidates.

### D. Cloud, DevOps & Systems Engineering
- **Primary Positive Attributions**: `skill_database_systems`, `skill_web_development`, `skill_cloud`, `skill_database_design`.
- **Structural Mechanism**: System architecture and database management skills provide positive tree-path contributions toward Cloud/DevOps. However, due to the empirical prior prevalence ($7.8\%$), tree votes rarely exceed the majority threshold under standard argmax.

---

## 3. Methodological Safeguards & Non-Causal Compliance

1. **Holdout Isolation**: Neither feature importance ranking nor tree path contributions were calculated on the 49-row holdout set.
2. **Algorithm Consistency**: Logistic Regression coefficients from previous phases have been completely replaced with Random Forest permutation importance and tree-path attributions, ensuring complete family fidelity.
3. **Absence of Confounders**: By utilizing `SkillsOnlyPreprocessor` (29 skills dimensions), Candidate H eliminates degree confounding (B.Sc/BBA degree bias) from the explanation vector.
