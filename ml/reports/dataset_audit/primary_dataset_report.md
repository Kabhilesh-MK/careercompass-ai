# Primary Dataset Audit & Quality Report
## Dataset: Perfectly Realistic Career Guidance Dataset (Divya Eldho)

- **Kaggle Identifier**: `divyaeldho/perfectly-realistic-career-guidance-dataset`
- **Provenance**: `Curated / LLM Rule-Assisted Dataset`
- **Evaluation Role**: Primary Technical Model Training and Testing (80/20 Stratified Split)
- **Audit Environment**: Python 3.14.7, Pandas 3.0.3, Scikit-Learn 1.9.0

---

## 1. Observed Raw Dataset Statistics
- **Raw Row Count**: 1,500
- **Raw Column Count**: 6
- **Missing Values**: 0 (100% complete)
- **Duplicate Rows**: 293
- **Constant Columns**: 0
- **Identifier Columns**: 0 (None present)
- **Raw Target Column**: `Recommended_Career`
- **Unique Raw Career Labels**: 55 distinct titles

### Raw Columns & Data Types
| Column Name | Data Type | Null Count | Distinct Values | Notes |
|---|---|---|---|---|
| `Education_Level` | `str` | 0 | - | Predictive Feature |
| `Specialization` | `str` | 0 | - | Predictive Feature |
| `Skills` | `str` | 0 | - | Predictive Feature |
| `Interests` | `str` | 0 | - | Predictive Feature |
| `Recommended_Career` | `str` | 0 | - | Target Variable |
| `Career_Description` | `str` | 0 | - | Excluded (Target Leakage) |

---

## 2. Target Fragmentation & Consolidation
The raw dataset exhibits extreme class fragmentation across 55 heterogeneous careers (e.g. Lecturer, Doctor, Clerk, Auditor), with an average of only 27 samples per class.
To establish statistically defensible decision boundaries for a specialized Computer Science/IT platform, we strictly mapped valid technical roles into the **Five Canonical Career Tracks** while discarding non-technical roles with documented reasons.

### Filtered Technical Subset Statistics
- **Consolidated Technical Rows**: 241 (16.1% retention)
- **Discarded Non-Technical Rows**: 1259 (83.9%)
- **Canonical Classes**: 4
- **Class Imbalance Ratio (Max / Min)**: 4.42:1

### Canonical Class Distribution
| Canonical Career Track | Sample Count | Proportion (%) | Status |
|---|---|---|---|
| **Software Development & Engineering** | 84 | 34.85% | Active Technical Track |
| **AI & Machine Learning Engineering** | 76 | 31.54% | Active Technical Track |
| **Data Analytics & Business Intelligence** | 62 | 25.73% | Active Technical Track |
| **Cloud, DevOps & Systems Engineering** | 19 | 7.88% | Active Technical Track |

---

## 3. Academic Disclosures & Limitations
1. **Curator Prompt Generation**: The original dataset was synthetically assembled via prompt heuristics matching degrees and skills to recommended roles. It represents curated archetypes, not 10-year longitudinal student outcomes.
2. **Zero Assessment Likert Scores**: The dataset does NOT contain the Likert-style assessment scores (1-5) currently featured in the CareerCompass frontend. Frontend assessment scores must NOT be claimed as pre-existing features.
3. **Zero Target Leakage Guarantee**: `Career_Description` was permanently purged prior to feature extraction because it contains verbatim justification templates generated from the target label.
4. **No Resampling Applied in Phase 3.1**: Raw class imbalance (1:4.0 ratio) is preserved as observed. Resampling or loss re-weighting will be evaluated experimentally during model training.