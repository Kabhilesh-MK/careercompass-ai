# Experiment C: Feature/Target Structure Analysis Report (Phase 3.3)
## Investigation of Empirical Determinism & Class-Conditional Associations

**Sample**: Training partition only ($N = 192$ samples, zero holdout leakage).
**Safeguard**: `Career_Description` strictly excluded from analysis.
**Statistical Measures**: Mutual Information (bits), Pearson Chi-Square ($\chi^2$) statistic, and class-conditional prevalence.
**Interpretation Guideline**: Highly predictive associations are designated as **'Strong Dataset Structure'**, reflecting curated/synthetic dataset generation constraints rather than causal mechanisms or invalid leakage.

---

## 1. Top 20 Features Ranked by Mutual Information

| Rank | Feature | Type | Mutual Info | $\chi^2$ Stat | Overall Prev | AI/ML Prev | Cloud/DevOps Prev | DA/BI Prev | SDE Prev | Diagnostic Structure Flag |
|:---:|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|---|
| 1 | `Education_Level_BCA` | Categorical | 0.3097 | 76.48 | 0.240 | 0.000 | 1.000 | 0.000 | 0.463 | Strong dataset structure: saturated (>=95%) in [Cloud, DevOps & Systems Engineering] |
| 2 | `Specialization_Computer Applications` | Categorical | 0.3097 | 76.48 | 0.240 | 0.000 | 1.000 | 0.000 | 0.463 | Strong dataset structure: saturated (>=95%) in [Cloud, DevOps & Systems Engineering] |
| 3 | `skill_web_development` | Skill | 0.3097 | 76.48 | 0.240 | 0.000 | 1.000 | 0.000 | 0.463 | Strong dataset structure: saturated (>=95%) in [Cloud, DevOps & Systems Engineering] |
| 4 | `skill_database_systems` | Skill | 0.3097 | 76.48 | 0.240 | 0.000 | 1.000 | 0.000 | 0.463 | Strong dataset structure: saturated (>=95%) in [Cloud, DevOps & Systems Engineering] |
| 5 | `skill_python` | Skill | 0.2699 | 39.58 | 0.495 | 0.508 | 1.000 | 0.000 | 0.731 | Strong dataset structure: exclusively absent in [Data Analytics & Business Intelligence] |
| 6 | `Education_Level_B.Sc` | Categorical | 0.2519 | 84.63 | 0.151 | 0.000 | 0.000 | 0.592 | 0.000 | Strong dataset structure: exclusively present in [Data Analytics & Business Intelligence] |
| 7 | `Education_Level_MCA` | Categorical | 0.1897 | 38.87 | 0.312 | 0.623 | 0.000 | 0.000 | 0.328 | Normal distribution |
| 8 | `Education_Level_BBA` | Categorical | 0.1616 | 58.37 | 0.104 | 0.000 | 0.000 | 0.408 | 0.000 | Strong dataset structure: exclusively present in [Data Analytics & Business Intelligence] |
| 9 | `Education_Level_M.Tech` | Categorical | 0.1560 | 49.39 | 0.120 | 0.377 | 0.000 | 0.000 | 0.000 | Strong dataset structure: exclusively present in [AI & Machine Learning Engineering] |
| 10 | `skill_database_design` | Skill | 0.1069 | 27.75 | 0.177 | 0.393 | 0.000 | 0.000 | 0.149 | Normal distribution |
| 11 | `Specialization_Information Systems` | Categorical | 0.1006 | 25.17 | 0.177 | 0.377 | 0.000 | 0.000 | 0.164 | Normal distribution |
| 12 | `Specialization_Computer Science` | Categorical | 0.0980 | 21.40 | 0.198 | 0.361 | 0.000 | 0.000 | 0.239 | Normal distribution |
| 13 | `skill_ai` | Skill | 0.0855 | 20.24 | 0.167 | 0.328 | 0.000 | 0.000 | 0.179 | Normal distribution |
| 14 | `Education_Level_B.Tech` | Categorical | 0.0823 | 26.12 | 0.073 | 0.000 | 0.000 | 0.000 | 0.209 | Strong dataset structure: exclusively present in [Software Development & Engineering] |
| 15 | `Specialization_Mathematics` | Categorical | 0.0755 | 29.18 | 0.052 | 0.000 | 0.000 | 0.204 | 0.000 | Strong dataset structure: exclusively present in [Data Analytics & Business Intelligence] |
| 16 | `skill_critical_thinking` | Skill | 0.0675 | 26.27 | 0.047 | 0.000 | 0.000 | 0.184 | 0.000 | Strong dataset structure: exclusively present in [Data Analytics & Business Intelligence] |
| 17 | `Specialization_Biology` | Categorical | 0.0675 | 26.27 | 0.047 | 0.000 | 0.000 | 0.184 | 0.000 | Strong dataset structure: exclusively present in [Data Analytics & Business Intelligence] |
| 18 | `skill_design_optimization` | Skill | 0.0629 | 21.48 | 0.052 | 0.164 | 0.000 | 0.000 | 0.000 | Strong dataset structure: exclusively present in [AI & Machine Learning Engineering] |
| 19 | `skill_cloud` | Skill | 0.0614 | 13.60 | 0.135 | 0.230 | 0.000 | 0.000 | 0.179 | Normal distribution |
| 20 | `skill_programming` | Skill | 0.0614 | 13.60 | 0.135 | 0.230 | 0.000 | 0.000 | 0.179 | Normal distribution |

---

## 2. Targeted Analysis of Prescribed Technical Features

| Technical Feature | Matched Column | Type | Mutual Info | Overall Prev | AI/ML | Cloud/DevOps | DA/BI | SDE | Structural Observation |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|---|
| **Python** | `skill_python` | Skill | 0.2699 | 0.495 | 0.508 | 1.000 | 0.000 | 0.731 | Strong dataset structure: exclusively absent in [Data Analytics & Business Intelligence] |
| **Ai** | `skill_ai` | Skill | 0.0855 | 0.167 | 0.328 | 0.000 | 0.000 | 0.179 | Normal distribution |
| **Programming** | `skill_programming` | Skill | 0.0614 | 0.135 | 0.230 | 0.000 | 0.000 | 0.179 | Normal distribution |
| **Cloud** | `skill_cloud` | Skill | 0.0614 | 0.135 | 0.230 | 0.000 | 0.000 | 0.179 | Normal distribution |
| **Database Systems** | `skill_database_systems` | Skill | 0.3097 | 0.240 | 0.000 | 1.000 | 0.000 | 0.463 | Strong dataset structure: saturated (>=95%) in [Cloud, DevOps & Systems Engineering] |
| **Database Design** | `skill_database_design` | Skill | 0.1069 | 0.177 | 0.393 | 0.000 | 0.000 | 0.149 | Normal distribution |
| **Web Development** | `skill_web_development` | Skill | 0.3097 | 0.240 | 0.000 | 1.000 | 0.000 | 0.463 | Strong dataset structure: saturated (>=95%) in [Cloud, DevOps & Systems Engineering] |
| **Matlab** | `skill_matlab` | Skill | 0.0314 | 0.073 | 0.098 | 0.000 | 0.000 | 0.119 | Normal distribution |
| **Excel** | `skill_excel` | Skill | 0.0442 | 0.031 | 0.000 | 0.000 | 0.122 | 0.000 | Strong dataset structure: exclusively present in [Data Analytics & Business Intelligence] |
| **Critical Thinking** | `skill_critical_thinking` | Skill | 0.0675 | 0.047 | 0.000 | 0.000 | 0.184 | 0.000 | Strong dataset structure: exclusively present in [Data Analytics & Business Intelligence] |
| **Sales** | `skill_sales` | Skill | 0.0442 | 0.031 | 0.000 | 0.000 | 0.122 | 0.000 | Strong dataset structure: exclusively present in [Data Analytics & Business Intelligence] |

---

## 3. Why Data Analytics & BI Achieved 100% Precision and Recall

The empirical findings resolve the question of why Data Analytics & BI achieved 49/49 correct out-of-fold and 13/13 holdout correct:

1. **Deterministic Educational Partitioning**: In the training dataset ($N = 192$):
   - `Education_Level == 'B.Sc'` occurs in 29 samples — **100% of which belong to Data Analytics & BI** ($0.0\%$ in other tracks).
   - `Education_Level == 'BBA'` occurs in 20 samples — **100% of which belong to Data Analytics & BI** ($0.0\%$ in other tracks).
   - Sum: $29 + 20 = 49$ samples ($100.0\%$ of all Data Analytics & BI samples).
   - **Conclusion**: Any sample presenting with a B.Sc or BBA degree is linearly separable from the other three computing tracks without even inspecting skills.

2. **Track-Exclusive Skills**: Several skills appear exclusively within Data Analytics & BI and in zero other tracks:
   - `skill_critical_thinking`: $18.4\%$ in DA/BI vs $0.0\%$ elsewhere.
   - `skill_excel`: $12.2\%$ in DA/BI vs $0.0\%$ elsewhere.
   - `skill_communication`: $16.3\%$ in DA/BI vs $0.0\%$ elsewhere.
   - `skill_research`: $16.3\%$ in DA/BI vs $0.0\%$ elsewhere.
   - `skill_sales`: $12.2\%$ in DA/BI vs $0.0\%$ elsewhere.

3. **Absence of Shared Programming Markers**: Core computing skills such as `skill_python`, `skill_web_development`, and `skill_database_systems` are entirely absent ($0.0\%$) from Data Analytics & BI samples in this dataset.

---

## 4. Analysis of Minority Class Overlap: Cloud, DevOps & Systems Engineering ($N = 15$)

- **100% Saturation in Triplet Skills**: All 15 Cloud/DevOps training samples ($100.0\%$) possess the identical skill combination: `skill_database_systems = 1`, `skill_python = 1`, and `skill_web_development = 1`.
- **Educational Uniformity**: All 15 samples possess `Education_Level == 'BCA'`.
- **Heavy Overlap with Software Engineering**: In `Software Development & Engineering`, 31 BCA students also possess `skill_database_systems` ($46.3\%$), `skill_python` ($73.1\%$), and `skill_web_development` ($46.3\%$).
- **Diagnostic Insight**: This explains why unweighted linear models completely collapse on Cloud/DevOps (0% recall). The minority class is geometrically an internal cluster inside the BCA Software Development subspace. Balanced weighting artificially upweights this region, which increases minority recall but causes severe false positive contamination among Software Engineering students.

---

## 5. Methodological Summary: Leakage vs Strong Dataset Structure

- **Not Target Leakage**: The target column `canonical_career_track` was never ingested into the feature matrix, and `Career_Description` was strictly excluded.
- **Curated Dataset Artifact**: The near-deterministic separability of Data Analytics & BI is an artifact of how the Divya Eldho dataset was synthetically or rule-assistedly constructed (i.e. assigning non-B.Tech/non-MCA profiles exclusively to Data Analyst roles).
- **Academic Recommendation**: Acknowledge this strong dataset structure explicitly in all publications and reports. In real-world multi-institution deployments, students from non-B.Sc backgrounds also pursue data analytics, so out-of-distribution transfer to datasets like Breejesh Dhar is essential for ecological validity.
