# Phase 3.4 / 3.4.1 Local Model Explanation Examples
## Instance-Level Tree-Path Probability Attribution for Candidate H (Random Forest)

**Protocol**: Evaluated strictly on Primary Training Data ($N = 192$). Zero holdout samples were used.
**Attribution Methodology**: In Random Forest ensembles, local instance predictions decompose additively across decision trees:
$$P(Y = c \mid \mathbf{x}) = \bar{p}_{\text{root}, c} + \sum_{j} \Delta p_{c, j}(\mathbf{x})$$
where $\bar{p}_{\text{root}, c}$ is the average root node empirical prior across all 300 decision trees, and $\Delta p_{c, j}(\mathbf{x})$ is the average probability delta contributed by all internal tree nodes that split on skill $j$ along the specific decision paths traversed by $\mathbf{x}$.

> [!IMPORTANT]
> **Non-Causal Standard**: Local probability contributions reflect the model's internal decision partitions on the training benchmark; they do not imply that acquiring a skill guarantees a real-world career outcome.

---

## Example 1 (AI/ML Record)
**Training Sample Index**: `Row #4`

### 1. Input Feature Profile

| Profile Field | Value |
|---|---|
| **Skills Profile** | `Power Analysis, Python` |
| **Academic Background** | `M.Tech in Power Systems` |
| **Reported Interests** | `Technology` |

### 2. Candidate H Prediction Distribution

| Career Track | Posterior Probability | Classification Status |
|---|:---:|:---:|
| `AI & Machine Learning Engineering` | **100.00%** | **Predicted Track** |
| `Cloud, DevOps & Systems Engineering` | **0.00%** | Alternative Track |
| `Data Analytics & Business Intelligence` | **0.00%** | Alternative Track |
| `Software Development & Engineering` | **0.00%** | Alternative Track |

**True Label**: `AI & Machine Learning Engineering` | **Match**: Correct

### 3. Tree-Path Probability Attribution for `AI & Machine Learning Engineering`
$$\bar{p}_{\text{root}}(\text{AI & Machine Learning Engineering}) = 0.3160$$

| Skill Indicator | Binary Value | Probability Contribution ($\Delta p$) | Attribution Role |
|---|:---:|:---:|---|
| `Skill: Power Analysis` | `1` | **+0.2950** | Strong Positive Driver |
| `Skill: Python` | `1` | **+0.1302** | Strong Positive Driver |

---

## Example 2 (Data Analytics/BI Record)
**Training Sample Index**: `Row #1`

### 1. Input Feature Profile

| Profile Field | Value |
|---|---|
| **Skills Profile** | `Critical Thinking` |
| **Academic Background** | `B.Sc in Mathematics` |
| **Reported Interests** | `Management` |

### 2. Candidate H Prediction Distribution

| Career Track | Posterior Probability | Classification Status |
|---|:---:|:---:|
| `AI & Machine Learning Engineering` | **0.00%** | Alternative Track |
| `Cloud, DevOps & Systems Engineering` | **0.00%** | Alternative Track |
| `Data Analytics & Business Intelligence` | **100.00%** | **Predicted Track** |
| `Software Development & Engineering` | **0.00%** | Alternative Track |

**True Label**: `Data Analytics & Business Intelligence` | **Match**: Correct

### 3. Tree-Path Probability Attribution for `Data Analytics & Business Intelligence`
$$\bar{p}_{\text{root}}(\text{Data Analytics & Business Intelligence}) = 0.2538$$

| Skill Indicator | Binary Value | Probability Contribution ($\Delta p$) | Attribution Role |
|---|:---:|:---:|---|
| `Skill: Critical Thinking` | `1` | **+0.2710** | Strong Positive Driver |

---

## Example 3 (Software Engineering Record)
**Training Sample Index**: `Row #2`

### 1. Input Feature Profile

| Profile Field | Value |
|---|---|
| **Skills Profile** | `Python, MATLAB, CAD` |
| **Academic Background** | `B.Tech in Mechanical` |
| **Reported Interests** | `Social Work` |

### 2. Candidate H Prediction Distribution

| Career Track | Posterior Probability | Classification Status |
|---|:---:|:---:|
| `AI & Machine Learning Engineering` | **0.00%** | Alternative Track |
| `Cloud, DevOps & Systems Engineering` | **0.00%** | Alternative Track |
| `Data Analytics & Business Intelligence` | **0.00%** | Alternative Track |
| `Software Development & Engineering` | **100.00%** | **Predicted Track** |

**True Label**: `Software Development & Engineering` | **Match**: Correct

### 3. Tree-Path Probability Attribution for `Software Development & Engineering`
$$\bar{p}_{\text{root}}(\text{Software Development & Engineering}) = 0.3529$$

| Skill Indicator | Binary Value | Probability Contribution ($\Delta p$) | Attribution Role |
|---|:---:|:---:|---|
| `Skill: Cad` | `1` | **+0.3042** | Strong Positive Driver |
| `Skill: Matlab` | `1` | **+0.2110** | Strong Positive Driver |
| `Skill: Python` | `1` | **+0.1322** | Strong Positive Driver |

---
