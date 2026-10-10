# External Transfer Evaluation Dataset Audit Report
## Dataset: Career Recommendation Dataset (Breejesh Dhar)

- **Kaggle Identifier**: `breejeshdhar/career-recommendation-dataset`
- **Provenance**: `Real-World Self-Reported Student Survey (Google Form)`
- **Evaluation Role**: External Real-World Transfer Evaluation (Zero-Shot Out-of-Distribution Validation)
- **STRICT PROTOCOL**: **NEVER TRAIN ON THIS DATASET**. Kept strictly isolated for downstream transfer assessment.
- **Audit Environment**: Python 3.14.7, Pandas 3.0.3, Scikit-Learn 1.9.0

---

## 1. Raw Survey Observation Audit
- **Total Survey Responses**: 1,195
- **Raw Question Columns**: 12
- **Raw First-Job Title Nulls**: 296 (24.8%)
- **Distinct Free-Text Job Responses**: 483

## 2. Privacy & Leakage Safeguards Executed
Before canonical mapping, the following columns were irrevocably stripped:
- `What is your name?`: Direct personal identifier leakage.
- `What is your gender?`: Demographic feature excluded to uphold algorithmic fairness and prevent gender bias.
- `Are you working?`: Post-outcome status variable unavailable for pre-graduation career recommendation.
- `Have you done masters...`: Post-undergraduate outcome variable.

## 3. Real-World Target Mapping & Retention
Free-text job titles were mapped into the 5 canonical technical tracks:
- **Retained Mapped Technical Graduates**: 323 (27.0% of total survey)
- **Excluded Records**: 872 (Comprising unemployed students, missing entries, and non-IT professions like mechanical, civil, or medical).
- **Canonical Classes Represented**: 5 of 5 tracks

### External Real-World Target Distribution
| Canonical Career Track | Observed Real-World Graduates | Proportion (%) |
|---|---|---|
| **Software Development & Engineering** | 230 | 71.21% |
| **Data Analytics & Business Intelligence** | 44 | 13.62% |
| **Cloud, DevOps & Systems Engineering** | 23 | 7.12% |
| **AI & Machine Learning Engineering** | 14 | 4.33% |
| **Database & Data Engineering** | 12 | 3.72% |

---

## 4. Academic Validity & Transfer Limitations
1. **Self-Reported Noise**: Data reflects authentic Google Form self-reported entries from Indian university graduates; minor typographical variations and informal titles (e.g. 'sde-1', 'tele-caller', 'associate consultant') exist in raw text.
2. **Zero Universal Generalization Claims**: Transfer evaluation on this dataset tests domain transfer from curated profiles to authentic survey data; it does NOT claim universal worldwide generalizability across all employment markets.