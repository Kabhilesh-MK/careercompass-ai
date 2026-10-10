# RIASEC Psychometric Alignment Benchmark Report
## Dataset: Student Career Prediction using RIASEC (S Venkatesh Kumar)

- **Kaggle Identifier**: `svenkateshkumar/student-career-prediction-using-riasec-dataset`
- **Provenance**: `Synthetic / Psychometric Rule-Derived Benchmark`
- **Evaluation Role**: Controlled Psychometric Alignment Benchmark (Separated from Primary Dataset)
- **Audit Environment**: Python 3.14.7, Pandas 3.0.3, Scikit-Learn 1.9.0

---

## 1. Empirical Characteristics
- **Total Rows Observed**: 2,400
- **Total Columns**: 12
- **Missing Values**: 0 (Zero missing values)
- **Duplicate Rows**: 0 (Zero duplicates)
- **Target Classes**: 6 balanced vocational archetypes
- **Samples Per Class**: 400 rows each
- **Class Imbalance Ratio**: 1.0:1 (Perfect balance)

### Class Distribution
| Vocational Archetype Target | Sample Count | Balance Ratio |
|---|---|---|
| `Entrepreneur` | 400 | 1.00 (Balanced) |
| `Accountant` | 400 | 1.00 (Balanced) |
| `Teacher` | 400 | 1.00 (Balanced) |
| `Software Engineer` | 400 | 1.00 (Balanced) |
| `Doctor` | 400 | 1.00 (Balanced) |
| `Data Scientist` | 400 | 1.00 (Balanced) |

---

## 2. Benchmark Feature Configurations
To rigorously study the marginal contribution of Holland's RIASEC scores versus pure cognitive and aptitude skills, two separate benchmark feature configurations are established:

### CONFIG A: Cognitive & Aptitude Baseline (5 Features)
- `Math_Score` (0-100 continuous score)
- `Science_Score` (0-100 continuous score)
- `Programming_Skill` (1-10 ordinal scale)
- `Communication_Skill` (1-10 ordinal scale)
- `Logical_Ability` (1-10 ordinal scale)

### CONFIG B: Full Psychometric Inventory (11 Features)
- All 5 Config A Features
- `R_score` (Realistic trait, 1-10)
- `I_score` (Investigative trait, 1-10)
- `A_score` (Artistic trait, 1-10)
- `S_score` (Social trait, 1-10)
- `E_score` (Enterprising trait, 1-10)
- `C_score` (Conventional trait, 1-10)

---

## 3. Critical Academic Disclosures
1. **Rule-Derived Target Leakage**: In this dataset, the target career is a deterministic mathematical function of the dominant Holland RIASEC score ($R \to \text{Software Engineer}$, $I \to \text{Data Scientist}$, $S \to \text{Teacher}$, $C \to \text{Accountant}$, $E \to \text{Entrepreneur}$, $A/I \to \text{Doctor}$).
2. **Psychometric Benchmark Designation**: Models evaluated on this dataset must be described strictly as a **'psychometric alignment benchmark'**, NOT as 'proof of real-world career prediction'.
3. **Zero Merging with Primary Data**: Because feature representations and data collection methodologies differ completely, this dataset is kept 100% physically isolated from the primary technical dataset.