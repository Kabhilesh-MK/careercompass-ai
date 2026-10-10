# Holdout Test Evaluation Report (Phase 3.2)
## Unseen Test Evaluation (N = 49 samples, 20.3% held-out)

- **Evaluation Protocol**: The 49-row test set remained strictly isolated during cross-validation.
- **Training Basis**: Models were trained on the full 192 training samples using the fitted `PrimaryPreprocessor`.
- **Evaluation Date**: Single evaluation run (No iterative parameter tuning against holdout data).

---

## 1. Overall Model Performance on Held-Out Test Data
| Model | Accuracy | Macro F1 | Weighted F1 | Log Loss | Top-2 Accuracy |
|---|:---:|:---:|:---:|:---:|:---:|
| **Stratified Dummy** | 0.3469 | 0.1288 | 0.1787 | 1.2867 | 0.6531 |
| **Logistic Regression** | 0.8163 | 0.6478 | 0.7828 | 0.3970 | 1.0000 |
| **Random Forest** | 0.7143 | 0.7048 | 0.7156 | 0.4826 | 1.0000 |

---

## 2. Per-Class Performance on Test Set
### Stratified Dummy
| Career Track | Precision | Recall | F1-Score | Support |
|---|:---:|:---:|:---:|:---:|
| `AI & Machine Learning Engineering` | 0.0000 | 0.0000 | 0.0000 | 15 |
| `Cloud, DevOps & Systems Engineering` | 0.0000 | 0.0000 | 0.0000 | 4 |
| `Data Analytics & Business Intelligence` | 0.0000 | 0.0000 | 0.0000 | 13 |
| `Software Development & Engineering` | 0.3469 | 1.0000 | 0.5152 | 17 |

### Logistic Regression
| Career Track | Precision | Recall | F1-Score | Support |
|---|:---:|:---:|:---:|:---:|
| `AI & Machine Learning Engineering` | 0.7778 | 0.9333 | 0.8485 | 15 |
| `Cloud, DevOps & Systems Engineering` | 0.0000 | 0.0000 | 0.0000 | 4 |
| `Data Analytics & Business Intelligence` | 1.0000 | 1.0000 | 1.0000 | 13 |
| `Software Development & Engineering` | 0.7222 | 0.7647 | 0.7429 | 17 |

### Random Forest
| Career Track | Precision | Recall | F1-Score | Support |
|---|:---:|:---:|:---:|:---:|
| `AI & Machine Learning Engineering` | 0.7692 | 0.6667 | 0.7143 | 15 |
| `Cloud, DevOps & Systems Engineering` | 0.4000 | 1.0000 | 0.5714 | 4 |
| `Data Analytics & Business Intelligence` | 1.0000 | 1.0000 | 1.0000 | 13 |
| `Software Development & Engineering` | 0.6154 | 0.4706 | 0.5333 | 17 |

---

## 3. Methodological Observations
1. **Holdout Alignment with Cross-Validation**: Performance on the 49 held-out test samples demonstrates whether CV estimates generalized without overfitting.
2. **Minority Class Performance**: Particular scrutiny is placed on `Cloud, DevOps & Systems Engineering` (4 test samples). Explicitly note that N=4 is extremely small, and holdout predictions for this class cannot be considered statistically definitive.
3. **Zero Data Leakage Verification**: All preprocessing transformations applied to test data utilized parameters fitted exclusively on the 192 training records.