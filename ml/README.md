# CareerCompass — Machine Learning Pipeline (Phase 3.1)
## Dataset Preparation, Preprocessing, Leakage Safeguards & Reproducibility

**Project**: CareerCompass — AI-Powered Career Intelligence  
**Phase**: Phase 3.1 (ML Dataset Preparation, Reproducible Pipeline, and Audit)  
**Status**: Dataset Preparation Complete. **Zero Models Trained**.

---

## 1. Academic Disclosures & Provenance

To maintain absolute academic honesty and research rigor, the provenance of all three datasets is formally disclosed:

### A. Primary Technical Dataset (Divya Eldho)
- **Source**: Kaggle `divyaeldho/perfectly-realistic-career-guidance-dataset`
- **Observed Dimensions**: 1,500 rows × 6 columns
- **Provenance**: **Curated / LLM Rule-Assisted Dataset**.
- **Nature**: Profiles were assembled using prompt heuristics matching degrees, skills, and interests to career targets. They represent curated industry archetypes rather than longitudinal 10-year tracking of actual graduates.
- **Academic Treatment**: Must NEVER be presented as "real-world longitudinal student observations".

### B. External Real-World Transfer Evaluation Dataset (Breejesh Dhar)
- **Source**: Kaggle `breejeshdhar/career-recommendation-dataset`
- **Observed Dimensions**: 1,195 rows × 12 columns
- **Provenance**: **Real-World Self-Reported Student Survey (Google Form)**.
- **Nature**: 100% authentic observations of Indian college graduates reporting degree majors, CGPA, technical skills, and first job outcomes.
- **Protocol**: **STRICTLY HELD OUT FOR EXTERNAL TRANSFER EVALUATION**. Models are **never** trained on this dataset. It serves exclusively as a zero-shot out-of-distribution transfer testbed.
- **Transfer Claim Boundary**: Does NOT claim universal worldwide generalizability across all labor markets; tests domain transfer from curated profiles to authentic survey data.

### C. Psychometric Alignment Benchmark Dataset (RIASEC)
- **Source**: Kaggle `svenkateshkumar/student-career-prediction-using-riasec-dataset`
- **Observed Dimensions**: 2,400 rows × 12 columns
- **Provenance**: **Synthetic / Psychometric Rule-Derived Benchmark**.
- **Nature**: Target career is a deterministic mathematical function of Holland's RIASEC vocational scores.
- **Protocol**: **SEPARATE BENCHMARK ONLY**. Must NEVER be merged with the primary dataset. Evaluated strictly as a "psychometric alignment benchmark", NOT as "proof of real-world career prediction".

---

## 2. Five Canonical Career Tracks

For the primary technical dataset, fine-grained raw job titles are consolidated into exactly five canonical tracks:

1. **Software Development & Engineering** (Application programming, web systems, full-stack development)
2. **AI & Machine Learning Engineering** (Applied AI, machine learning engineering, data science)
3. **Data Analytics & Business Intelligence** (Quantitative analytics, SQL reporting, BI dashboards)
4. **Cloud, DevOps & Systems Engineering** (Systems analysis, infrastructure, cloud computing)
5. **Database & Data Engineering** (Database design, distributed data architecture, ETL)

---

## 3. Critical Assessment Integration Boundary

> [!WARNING]
> **Academic Integrity Notice**:
> The primary dataset does **NOT** contain the Likert-style (1–5) student skill assessment ratings currently featured in the CareerCompass frontend.
>
> We do **NOT** claim that the current UI assessment is already an active training feature.
> We do **NOT** invent a pseudo-mapping from frontend assessment scores to training features.
>
> This is formally documented as a **future integration problem**. In Phase 3.3/3.4, the platform will establish a defensible feature mapping via explicit feature ablation experiments.

---

## 4. Pipeline Architecture

```
Raw Kaggle Datasets (ml/data/raw/)
        │
        ▼
Data Validation & Leakage Audit (src/data/validate_data.py)
        │
        ├─────────────────────────────────────────────────┐
        ▼                                                 ▼
Feature Engineering & Normalization               External Transfer Prep & RIASEC Benchmark
- Purge Career_Description (Direct leakage)       - Strip PII & gender (Breejesh)
- Map raw careers -> 5 canonical tracks           - Map valid first-job titles
- Deterministic skill tokenization                - Generate Config A (Cognitive) & Config B (RIASEC)
        │                                                 │
        ▼                                                 ▼
Stratified 80/20 Train/Test Split                 ml/data/processed/
- random_state = 42                               - primary/ (train.csv, test.csv)
- Split prior to preprocessing                    - external/ (breejesh_transfer_eval.csv)
        │                                         - riasec/ (config_a.csv, config_b.csv)
        ▼
ColumnTransformer & Pipeline (src/preprocessing/pipeline.py)
- Fitted ONLY on train.csv (Zero leakage)
- OneHotEncoder(handle_unknown='ignore')
- MultiHotSkillEncoder
        │
        ▼
Reports & Audit Tables (reports/dataset_audit/)
- primary_dataset_report.md
- primary_label_mapping.csv
- primary_feature_report.csv
- external_dataset_report.md
- external_label_mapping.csv
- riasec_dataset_report.md
```

---

## 5. Directory Structure

```
ml/
├── README.md                      # Academic disclosures, reproducibility guide
├── requirements.txt               # Pipeline dependencies
├── run_pipeline.py                # Master reproducible data preparation runner
│
├── configs/
│   └── config.yaml                # Centralized reproducible parameters & taxonomy
│
├── data/
│   ├── raw/                       # Immutable raw datasets (untouched)
│   ├── interim/                   # Cleaned, intermediate tables
│   └── processed/                 # Partitioned, ready-for-modeling datasets
│       ├── primary/               # train.csv, test.csv, train_processed.csv, test_processed.csv
│       ├── external/              # breejesh_transfer_eval.csv (Evaluation only)
│       └── riasec/                # riasec_config_a.csv, riasec_config_b.csv
│
├── notebooks/                     # Exploratory notebooks
│
├── reports/
│   ├── dataset_audit/             # Full markdown audit reports & mapping CSVs
│   └── figures/                   # Class distribution & vocabulary charts
│
├── src/
│   ├── data/                      # Data loaders, validators, stratified splitters
│   ├── features/                  # Skill normalizers, categorical cleaners, mapping logic
│   ├── preprocessing/             # Leakage-free ColumnTransformer pipelines
│   └── utils/                     # Random seed management, environment audit
│
└── tests/
    ├── test_data.py               # Data integrity & column checks
    ├── test_features.py           # Normalization & vocabulary determinism tests
    └── test_preprocessing.py      # Split reproducibility & zero-leakage tests
```

---

## 6. How to Reproduce

### Run the Complete Data Preparation Pipeline:
```powershell
python ml/run_pipeline.py
```

### Run the Full Pytest Suite:
```powershell
python -m pytest ml/tests/ -v
```

---

## 7. Confirmation of Constraints

- **Zero Machine Learning Models Were Trained**: No classifiers (Logistic Regression, Random Forest, XGBoost, SVM, Neural Networks) were fitted.
- **Zero Frontend Code Was Modified**: React frontend, UI-V2.1, UI-V2.2, AppState, and UI routes remain completely untouched.
- **Zero Backend API Code Was Modified**: FastAPI routes and MongoDB connectors were not created.
