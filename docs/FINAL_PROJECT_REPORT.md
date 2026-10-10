# CAREERCOMPASS AI
## AI-Powered Career Intelligence: An Intelligent Skill Gap Analysis and Career Recommendation System Using Machine Learning

---

### Academic Capstone Project Report
**Academic Discipline**: Computer Science & Engineering / Data Science & Machine Learning  
**Project System**: CareerCompass AI  
**Software Version**: Production Release 1.0 (Phase 8 Submission Package)  
**Authoritative ML Candidate**: Candidate H (Ensemble Random Forest Classifier, Skills-Only)  
**Date**: October 2026  
**Status**: Formally Validated, Architecturally Hardened & Academically Defensible  

---

## Abstract

Career decision-making in undergraduate engineering and computer science programs presents substantial cognitive and pedagogical friction. Students regularly encounter difficulty identifying viable computing specializations, discerning prerequisite relationships across complex competency hierarchies, evaluating their current skill gaps against authentic technical profiles, selecting credible learning resources, and translating theoretical coursework into verifiable, portfolio-grade project evidence. Prior automated advisory systems frequently suffer from lack of transparency, confounding institutional degree titles with technical aptitude, black-box decision models lacking local interpretability, and brittle, ungrounded generative predictions.

This report presents **CareerCompass AI**, an integrated, deployment-ready academic career intelligence and decision-support platform designed to address these challenges through a strict separation of statistical machine learning and deterministic pedagogical planning. The statistical core consists of a locked 300-tree Random Forest classifier (**Candidate H**) evaluated across four canonical computing career tracks: (1) *Software Development & Engineering*, (2) *AI & Machine Learning Engineering*, (3) *Data Analytics & Business Intelligence*, and (4) *Cloud, DevOps & Systems Engineering*. The model operates over a standardized 29-dimensional binary technical skill feature space ($x_i \in \{0, 1\}$), excluding confounding academic degree titles and non-transferable demographic attributes.

On the held-out benchmark ($N = 49$), Candidate H achieved an overall classification accuracy of $0.7959$ (39/49) and a Macro-averaged F1 score of $0.6302$, with a Weighted F1 score of $0.7589$, a multiclass cross-entropy Log Loss of $0.3874$, and a Top-2 accuracy of $1.0000$ (49/49). Local interpretability is provided via SHAP `TreeExplainer` feature attribution with a deterministic `TreePathAttribution` fallback, ensuring students receive transparent instance-level model-behavior explanations of the technical competencies driving model probabilities without conflating statistical attribution with real-world causality.

Downstream from the advisory ML prediction, CareerCompass leverages an expert-curated competency ontology, an exact directed acyclic graph (DAG) prerequisite engine, and deterministic mathematical scoring to compute *Required-Skill Coverage*, generate a 5-stage dependency-ordered roadmap, recommend targeted learning modules, rank a 16-project curated catalog via a rule-based *Project Relevance Score*, and verify deliverables within an interactive portfolio dashboard. The integrated full-stack architecture—built with FastAPI, React, TypeScript, and Vite—has been validated through a comprehensive 178-test automated regression suite, demonstrating sub-50ms endpoint latencies, strict CORS and input boundaries, and complete state persistence. 

*Formal Academic Disclaimer*: CareerCompass AI is an exploratory educational decision-support platform. The machine learning model estimates the empirical class distribution represented within its structured benchmark dataset. It does not provide guaranteed career placement, predict hiring probabilities, or forecast long-term professional employment outcomes.

---

## Table of Contents

- [Abstract](#abstract)
- [List of Figures](#list-of-figures)
- [List of Tables](#list-of-tables)
- [Source of Truth Mapping](#source-of-truth-mapping)
- [Chapter 1 — Introduction](#chapter-1--introduction)
  - [1.1 Background](#11-background)
  - [1.2 Problem Context](#12-problem-context)
  - [1.3 Motivation](#13-motivation)
  - [1.4 Proposed Solution](#14-proposed-solution)
  - [1.5 System Scope & Boundaries](#15-system-scope--boundaries)
  - [1.6 Key Technical Contributions](#16-key-technical-contributions)
- [Chapter 2 — Problem Statement and Objectives](#chapter-2--problem-statement-and-objectives)
  - [2.1 Mathematical Problem Formulation](#21-mathematical-problem-formulation)
  - [2.2 Distinction Between ML Inference and Downstream Planning](#22-distinction-between-ml-inference-and-downstream-planning)
  - [2.3 Specific Project Objectives](#23-specific-project-objectives)
- [Chapter 3 — Literature Review and Background](#chapter-3--literature-review-and-background)
  - [3.1 Traditional Career Guidance Methodologies](#31-traditional-career-guidance-methodologies)
  - [3.2 Machine Learning in Educational Data Mining](#32-machine-learning-in-educational-data-mining)
  - [3.3 Explainability and Local Interpretability in Recommenders](#33-explainability-and-local-interpretability-in-recommenders)
  - [3.4 Curated Competency Ontologies vs Unstructured Generation](#34-curated-competency-ontologies-vs-unstructured-generation)
  - [3.5 Gaps in Existing Literature and Systems](#35-gaps-in-existing-literature-and-systems)
- [Chapter 4 — Dataset and Data Preparation](#chapter-4--dataset-and-data-preparation)
  - [4.1 Dataset Identification and Roles](#41-dataset-identification-and-roles)
  - [4.2 Primary Benchmark Acquisition and Fragmentation](#42-primary-benchmark-acquisition-and-fragmentation)
  - [4.3 Taxonomy Mapping and Inactive Classes](#43-taxonomy-mapping-and-inactive-classes)
  - [4.4 Data Cleaning, Normalization, and Vocabulary Construction](#44-data-cleaning-normalization-and-vocabulary-construction)
  - [4.5 Stratified Partitioning and Strict Leakage Prevention](#45-stratified-partitioning-and-strict-leakage-prevention)
  - [4.6 Feature Space Isolation (Elimination of Degree Confounders)](#46-feature-space-isolation-elimination-of-degree-confounders)
- [Chapter 5 — Machine Learning Methodology](#chapter-5--machine-learning-methodology)
  - [5.1 Model Selection Framework](#51-model-selection-framework)
  - [5.2 Baseline Classifiers](#52-baseline-classifiers)
  - [5.3 Cross-Validation Protocol (5-Fold Stratified CV)](#53-cross-validation-protocol-5-fold-stratified-cv)
  - [5.4 Evaluation Metrics Under Severe Class Imbalance](#54-evaluation-metrics-under-severe-class-imbalance)
  - [5.5 Model Candidate Search Space (Candidates A through H)](#55-model-candidate-search-space-candidates-a-through-h)
  - [5.6 Final Model Selection and Rationale (Candidate H)](#56-final-model-selection-and-rationale-candidate-h)
- [Chapter 6 — Model Evaluation and Benchmark Results](#chapter-6--model-evaluation-and-benchmark-results)
  - [6.1 Candidate Comparison Across Cross-Validation Folds](#61-candidate-comparison-across-cross-validation-folds)
  - [6.2 Candidate H Cross-Validation and Out-of-Fold Performance](#62-candidate-h-cross-validation-and-out-of-fold-performance)
  - [6.3 Final Holdout Benchmark Evaluation (Untouched N = 49)](#63-final-holdout-benchmark-evaluation-untouched-n--49)
  - [6.4 Minority Class Sparsity Analysis (Cloud/DevOps)](#64-minority-class-sparsity-analysis-clouddevops)
  - [6.5 Class Weighting Ablation Study](#65-class-weighting-ablation-study)
  - [6.6 Post-Hoc Decision Threshold Analysis](#66-post-hoc-decision-threshold-analysis)
  - [6.7 External Transfer Evaluation (Breejesh Dhar Dataset)](#67-external-transfer-evaluation-breejesh-dhar-dataset)
  - [6.8 Psychometric Alignment Benchmark (RIASEC Dataset)](#68-psychometric-alignment-benchmark-riasec-dataset)
  - [6.9 Empirical Probability Calibration Study](#69-empirical-probability-calibration-study)
- [Chapter 7 — Explainability Architecture](#chapter-7--explainability-architecture)
  - [7.1 Explainability Requirements in Educational Guidance](#71-explainability-requirements-in-educational-guidance)
  - [7.2 SHAP TreeExplainer Implementation](#72-shap-treeexplainer-implementation)
  - [7.3 Deterministic TreePathAttribution Fallback](#73-deterministic-treepathattribution-fallback)
  - [7.4 Global Feature Importance vs Local Instance Attribution](#74-global-feature-importance-vs-local-instance-attribution)
  - [7.5 Non-Causal Semantics and Scientific Disclaimers](#75-non-causal-semantics-and-scientific-disclaimers)
- [Chapter 8 — Career Intelligence Engine](#chapter-8--career-intelligence-engine)
  - [8.1 Curated Competency Ontology Design](#81-curated-competency-ontology-design)
  - [8.2 Deterministic Skill-Gap Analysis](#82-deterministic-skill-gap-analysis)
  - [8.3 Prerequisite Directed Acyclic Graph (DAG) Engine](#83-prerequisite-directed-acyclic-graph-dag-engine)
  - [8.4 5-Stage Progressive Roadmap Generation](#84-5-stage-progressive-roadmap-generation)
  - [8.5 Curated Learning Resource Recommendation](#85-curated-learning-resource-recommendation)
  - [8.6 Human Agency and Target Track Override Flow](#86-human-agency-and-target-track-override-flow)
- [Chapter 9 — Project and Portfolio Intelligence](#chapter-9--project-and-portfolio-intelligence)
  - [9.1 Project Catalog Design and Prerequisite Alignment](#91-project-catalog-design-and-prerequisite-alignment)
  - [9.2 Rule-Based Project Relevance Scoring](#92-rule-based-project-relevance-scoring)
  - [9.3 Deliverable Evidence Standards](#93-deliverable-evidence-standards)
  - [9.4 Portfolio Evidence Coverage Formula](#94-portfolio-evidence-coverage-formula)
  - [9.5 State Persistence and Proof-of-Work Architecture](#95-state-persistence-and-proof-of-work-architecture)
- [Chapter 10 — System Design and Implementation](#chapter-10--system-design-and-implementation)
  - [10.1 High-Level Architecture](#101-high-level-architecture)
  - [10.2 Backend Service Design (FastAPI)](#102-backend-service-design-fastapi)
  - [10.3 Frontend Single-Page Application (React + TypeScript)](#103-frontend-single-page-application-react--typescript)
  - [10.4 REST API Specification and Contracts](#104-rest-api-specification-and-contracts)
  - [10.5 Data Flow Across Subsystems](#105-data-flow-across-subsystems)
- [Chapter 11 — Testing, Verification, and Performance](#chapter-11--testing-verification-and-performance)
  - [11.1 Automated Testing Architecture](#111-automated-testing-architecture)
  - [11.2 Backend Test Suite (74 Pytest Cases)](#112-backend-test-suite-74-pytest-cases)
  - [11.3 Machine Learning Test Suite (46 Passed, 1 Skipped)](#113-machine-learning-test-suite-46-passed-1-skipped)
  - [11.4 Frontend Integration Test Suite (58 TSX Cases)](#114-frontend-integration-test-suite-58-tsx-cases)
  - [11.5 TypeScript Typecheck and Static Verification](#115-typescript-typecheck-and-static-verification)
  - [11.6 End-to-End User Journey Verification](#116-end-to-end-user-journey-verification)
  - [11.7 Local Latency and Performance Benchmark](#117-local-latency-and-performance-benchmark)
- [Chapter 12 — Security and Deployment](#chapter-12--security-and-deployment)
  - [12.1 Application-Level Security Audit](#121-application-level-security-audit)
  - [12.2 CORS Policy and Boundary Validation](#122-cors-policy-and-boundary-validation)
  - [12.3 Input Sanitization and Exception Envelopes](#123-input-sanitization-and-exception-envelopes)
  - [12.4 Deployment Architecture and Containerization](#124-deployment-architecture-and-containerization)
  - [12.5 Environment Configuration and Secrets Governance](#125-environment-configuration-and-secrets-governance)
- [Chapter 13 — Academic Limitations and Risks](#chapter-13--academic-limitations-and-risks)
  - [13.1 Benchmark Size and Sample Constraints](#131-benchmark-size-and-sample-constraints)
  - [13.2 Minority Class Sparsity](#132-minority-class-sparsity)
  - [13.3 Binary Feature Representation Limitations](#133-binary-feature-representation-limitations)
  - [13.4 Domain Shift and External Generalization](#134-domain-shift-and-external-generalization)
  - [13.5 Self-Reported Evidence Constraints](#135-self-reported-evidence-constraints)
- [Chapter 14 — Ethical Considerations and Societal Impact](#chapter-14--ethical-considerations-and-societal-impact)
  - [14.1 Advisory vs High-Stakes Decision-Making](#141-advisory-vs-high-stakes-decision-making)
  - [14.2 Preservation of Student Autonomy](#142-preservation-of-student-autonomy)
  - [14.3 Algorithmic Bias and Training Set Distortion](#143-algorithmic-bias-and-training-set-distortion)
  - [14.4 Transparency and Explainability Safeguards](#144-transparency-and-explainability-safeguards)
  - [14.5 Data Privacy and Local Inference](#145-data-privacy-and-local-inference)
- [Chapter 15 — Future Scope and Conclusion](#chapter-15--future-scope-and-conclusion)
  - [15.1 Longitudinal Outcome Tracking](#151-longitudinal-outcome-tracking)
  - [15.2 Continuous Competency Representation](#152-continuous-competency-representation)
  - [15.3 Expanded Labor-Market Taxonomy](#153-expanded-labor-market-taxonomy)
  - [15.4 Automated Code and Evidence Verification](#154-automated-code-and-evidence-verification)
  - [15.5 Final Synthesis and Academic Conclusion](#155-final-synthesis-and-academic-conclusion)
- [References](#references)
- [Appendices](#appendices)

---

## List of Figures

- **Figure 1.1**: End-to-End CareerCompass Data Progression Pipeline
- **Figure 2.1**: Boundary Delineation Between Statistical ML and Deterministic Planning
- **Figure 5.1**: 5-Fold Stratified Cross-Validation with Fold-Isolated Preprocessing
- **Figure 6.1**: Out-of-Fold Confusion Matrix for Candidate H ($N = 192$)
- **Figure 6.2**: Holdout Confusion Matrix for Candidate H ($N = 49$)
- **Figure 6.3**: Reliability Calibration Curves Across Calibration Regimes
- **Figure 7.1**: SHAP Waterfall Local Feature Attribution Plot
- **Figure 8.1**: 4-Track Competency Ontology Architecture
- **Figure 8.2**: Directed Acyclic Graph (DAG) Prerequisite Progression Flow
- **Figure 10.1**: Unified System Architecture Diagram
- **Figure 10.2**: REST API Request-Response Lifecycle

---

## List of Tables

- **Table 1.1**: Operational Domain Governance Matrix
- **Table 4.1**: Dataset Summary and Project Roles
- **Table 4.2**: Primary Benchmark Class Distribution (Total $N = 241$)
- **Table 4.3**: Stratified Training and Holdout Partition Splits
- **Table 4.4**: 29 Canonical Technical Skill Features
- **Table 5.1**: Candidate Hyperparameter and Feature Configurations (Candidates A–H)
- **Table 6.1**: 5-Fold Cross-Validation Performance Comparison (Candidates A–H)
- **Table 6.2**: Candidate H Out-of-Fold (OOF) Per-Class Evaluation Metrics
- **Table 6.3**: Candidate H Final Holdout Performance ($N = 49$)
- **Table 6.4**: Class-Weighting Ablation Results (Experiment A)
- **Table 6.5**: Decision Threshold Grid Search for Minority Class (Experiment E)
- **Table 6.6**: External Transfer Performance on Breejesh Dhar Dataset ($N = 311$)
- **Table 6.7**: Psychometric Benchmark Performance on RIASEC Dataset ($N = 2,400$)
- **Table 6.8**: Empirical Calibration Evaluation Under 5-Fold Stratified CV
- **Table 9.1**: 16-Project Curated Catalog Summary Across 4 Career Tracks
- **Table 10.1**: Core FastAPI REST Endpoints and Contract Behaviors
- **Table 11.1**: Automated Regression Test Suite Breakdown
- **Table 11.2**: Local Execution Latency Benchmarks Across 50 Invocations

---

## Source of Truth Mapping

To guarantee absolute numerical, architectural, and methodological consistency throughout this report, all empirical claims map directly to authoritative, frozen repository files:

| Topical Domain | Authoritative Primary Source File | Locked Repository Location |
|---|---|---|
| **Final Selected Model (Candidate H)** | Phase 3.4.1 Selection Correction Report | [`ml/reports/phase3_4_selection_correction.md`](file:///c:/Users/kabhi/Desktop/Semester%204%20projects/DSA%203.0/project-bolt-sb1-djprtkdr/project/ml/reports/phase3_4_selection_correction.md) |
| **Model Candidate Comparison** | Phase 3.4 Model Candidates Log | [`ml/reports/phase3_4_model_candidates.csv`](file:///c:/Users/kabhi/Desktop/Semester%204%20projects/DSA%203.0/project-bolt-sb1-djprtkdr/project/ml/reports/phase3_4_model_candidates.csv) |
| **Final Holdout Benchmark (N = 49)** | Phase 3.4 Final Holdout Report | [`ml/reports/phase3_4_final_holdout.md`](file:///c:/Users/kabhi/Desktop/Semester%204%20projects/DSA%203.0/project-bolt-sb1-djprtkdr/project/ml/reports/phase3_4_final_holdout.md) |
| **Calibration Analysis** | Phase 4 Calibration Report & CSV | [`ml/reports/phase_4_calibration_report.md`](file:///c:/Users/kabhi/Desktop/Semester%204%20projects/DSA%203.0/project-bolt-sb1-djprtkdr/project/ml/reports/phase_4_calibration_report.md) |
| **Explainability Protocol** | Phase 4 Report & Analysis | [`ml/reports/phase_4_report.md`](file:///c:/Users/kabhi/Desktop/Semester%204%20projects/DSA%203.0/project-bolt-sb1-djprtkdr/project/ml/reports/phase_4_report.md) |
| **Career Skill Ontology** | Phase 5 Report & Ontology Service | [`backend/app/services/career_ontology.py`](file:///c:/Users/kabhi/Desktop/Semester%204%20projects/DSA%203.0/project-bolt-sb1-djprtkdr/project/backend/app/services/career_ontology.py) |
| **Project & Portfolio Intelligence** | Phase 6 Report & Catalog Service | [`backend/app/services/project_catalog.py`](file:///c:/Users/kabhi/Desktop/Semester%204%20projects/DSA%203.0/project-bolt-sb1-djprtkdr/project/backend/app/services/project_catalog.py) |
| **System QA & Final Benchmarks** | Phase 7 Final Delivery Report | [`ml/reports/phase_7_final_report.md`](file:///c:/Users/kabhi/Desktop/Semester%204%20projects/DSA%203.0/project-bolt-sb1-djprtkdr/project/ml/reports/phase_7_final_report.md) |
| **Production Model Artifact** | Serialized Joblib Model File | [`ml/models/careercompass_phase3_4_model.joblib`](file:///c:/Users/kabhi/Desktop/Semester%204%20projects/DSA%203.0/project-bolt-sb1-djprtkdr/project/ml/models/careercompass_phase3_4_model.joblib) |
| **Model Metadata** | Frozen JSON Metadata | [`ml/models/careercompass_phase3_4_metadata.json`](file:///c:/Users/kabhi/Desktop/Semester%204%20projects/DSA%203.0/project-bolt-sb1-djprtkdr/project/ml/models/careercompass_phase3_4_metadata.json) |

---

# CHAPTER 1 — INTRODUCTION

## 1.1 Background
The global computing industry encompasses diverse technical sub-disciplines, including core software development, machine learning and data engineering, enterprise business intelligence, and cloud systems operations. Preparing undergraduate students to navigate these complex career pathways represents a foundational imperative for engineering institutions. As computer science curricula evolve, students are expected to acquire specialized competencies across software design, mathematical modeling, distributed systems, and modern deployment tooling. 

However, students often find it challenging to connect university coursework with industry expectations. Academic course titles frequently obscure the underlying practical competencies demanded by modern technical roles, leaving students uncertain about how their acquired knowledge translates into professional capabilities.

## 1.2 Problem Context
In practice, students navigating technical career options face multiple systemic obstacles:
1. **Opaque Skill Mapping**: Career guidance tools often provide generalized advice or high-level personality classifications that do not evaluate concrete technical skills (e.g., Python, database systems, CAD, cloud infrastructure).
2. **Confounded Academic Proxies**: Prior automated career recommenders frequently rely on degree specializations (e.g., classifying any student enrolled in an AI degree directly into an AI role), producing tautological models that fail to assess transferable skills.
3. **Black-Box Predictions**: Systems leveraging deep neural networks or complex ensembles rarely explain why a particular path was recommended, eroding trust and preventing actionable reflection.
4. **Disconnected Pedagogical Planning**: Identifying a career direction is insufficient if the system cannot determine prerequisite gaps, order those gaps into a logical curriculum, or recommend verified learning resources.
5. **Absence of Tangible Proof-of-Work**: High-stakes technical hiring focuses heavily on demonstrable deliverables (code repositories, live cloud deployments, system documentation). Students lack platforms that connect missing skills directly to structured project deliverables.

## 1.3 Motivation
The primary motivation behind CareerCompass AI is the creation of a fully integrated, transparent, and academically defensible decision-support platform. Rather than treating career guidance as a purely speculative prediction task, CareerCompass structures career planning as an evidence-building progression pipeline:

$$\text{Observed Skills} \xrightarrow{\text{ML}} \text{Advisory Prediction} \xrightarrow{\text{SHAP}} \text{Explanation} \xrightarrow{\text{Ontology}} \text{Skill Gap} \xrightarrow{\text{DAG}} \text{Roadmap} \xrightarrow{\text{Curated}} \text{Projects} \xrightarrow{\text{Proof}} \text{Portfolio}$$

By coupling empirical machine learning with human-in-the-loop agency and deterministic planning, the system empowers students to explore recommendations, select their own career targets, and systematically construct a verifiable body of work.

## 1.4 Proposed Solution
CareerCompass AI addresses these challenges through a unified full-stack architecture that combines:
- **Locked ML Classification**: A 300-tree Random Forest classifier (Candidate H) operating over 29 canonical binary technical skills across 4 computing tracks.
- **Local Feature Attribution**: SHAP TreeExplainer and deterministic tree-path attribution showing instance-level positive and negative feature contributions.
- **Deterministic Skill-Gap Analysis**: A curated competency ontology that calculates mathematical *Required-Skill Coverage* using deterministic, rule-based calculation.
- **Prerequisite-Aware Roadmapping**: A directed acyclic graph (DAG) engine that sequences missing competencies into 5 structured stages.
- **Project Intelligence**: A curated catalog of 16 multi-stage technical projects scored via an explicit, rule-based relevance heuristic.
- **Portfolio Intelligence**: An evidence-tracking dashboard capturing repository links, deployments, and verified milestone completions.

## 1.5 System Scope & Boundaries
To maintain rigorous scientific and academic boundaries, the system defines explicit operational constraints:
- **Supported ML Career Tracks (4 Classes)**:
  1. *Software Development & Engineering*
  2. *AI & Machine Learning Engineering*
  3. *Data Analytics & Business Intelligence*
  4. *Cloud, DevOps & Systems Engineering*
- **Explicit Class Exclusion**: *Database & Data Engineering* is not an ML prediction class in the locked system. While relevant to computing taxonomies, the primary training benchmark contained zero native records for this class. Including it as a statistical target would compromise empirical defensibility.
- **Skill Feature Boundary**: Model features are strictly limited to 29 binary multi-hot technical skills. Degree titles, student specialization names, and general interests are excluded from production model inputs to prevent curriculum confounding.
- **Advisory Standard**: System outputs are advisory decision-support signals. They do not predict future employment outcomes, hiring probability, or real-world job performance.

## 1.6 Key Technical Contributions
The primary technical contributions of this project include:
1. **Confounder-Free Tabular Formulation**: Establishing a reproducible preprocessing and modeling pipeline that prunes degree-name confounders, isolating true technical skill indicators.
2. **Transparent Candidate Selection**: Demonstrating through controlled 5-fold cross-validation that an unweighted Random Forest (Candidate H) achieves superior multiclass Log Loss ($0.3768$) and Macro F1 ($0.6226$) over linear baselines.
3. **Strict Separation of Concerns**: Enforcing architectural boundaries between statistical inference (probabilistic classification) and educational progression (deterministic DAG traversal and mathematical coverage).
4. **Zero-Mock System Integration**: Constructing a complete, deployment-ready academic full-stack implementation verified by 178 automated regression tests with sub-50ms latency.

---

# CHAPTER 2 — PROBLEM STATEMENT AND OBJECTIVES

## 2.1 Mathematical Problem Formulation
Let a student's observed technical skill profile be represented as a binary feature vector:

$$\mathbf{x} = [x_1, x_2, \dots, x_{29}]^T \in \{0, 1\}^{29}$$

where $x_j = 1$ denotes the confirmed presence of canonical technical skill $j$, and $x_j = 0$ denotes its absence.

Let $\mathcal{C} = \{c_1, c_2, c_3, c_4\}$ denote the set of four mutually exclusive target computing disciplines:
- $c_1$: Software Development & Engineering
- $c_2$: AI & Machine Learning Engineering
- $c_3$: Data Analytics & Business Intelligence
- $c_4$: Cloud, DevOps & Systems Engineering

The machine learning task is formulated as estimating the model-predicted class probability distribution:

$$P(Y = c_k \mid \mathbf{X} = \mathbf{x}), \quad \text{for } k \in \{1, 2, 3, 4\}$$

such that $\sum_{k=1}^4 P(Y = c_k \mid \mathbf{x}) = 1$ and $P(Y = c_k \mid \mathbf{x}) \ge 0$.

The point prediction $\hat{y}$ is selected via the standard argmax decision rule over model-predicted class probabilities:

$$\hat{y} = \arg\max_{c_k \in \mathcal{C}} P(Y = c_k \mid \mathbf{x})$$

## 2.2 Distinction Between ML Inference and Downstream Planning
A central tenet of the CareerCompass architecture is the formal separation between the statistical classification task and the downstream educational planning engine:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   SEPARATION OF ARCHITECTURAL DOMAINS                  │
├──────────────────────────┬─────────────────────────────────────────────┤
│ 1. Statistical ML Core   │ - Input: Binary skill vector x in {0, 1}^29 │
│    (Candidate H)         │ - Output: Advisory probabilities P(Y | x)   │
│                          │ - Mechanism: 300-tree Random Forest         │
│                          │ - Property: Empirical benchmark fit         │
├──────────────────────────┼─────────────────────────────────────────────┤
│ 2. Pedagogical Planning  │ - Input: Target track c* and skill set S_in │
│    (Curated & DAG)       │ - Output: Coverage %, gaps, roadmap, project│
│                          │ - Mechanism: Competency ontology & DAG rules│
│                          │ - Property: Deterministic, rule-based logic │
└──────────────────────────┴─────────────────────────────────────────────┘
```

The machine learning classifier does not dictate missing skills, does not build the roadmap, and does not assess portfolio evidence. The downstream engine takes the selected career target—whether adopted from $\hat{y}$ or chosen via student target override—and resolves it against an authoritative curriculum ontology.

## 2.3 Specific Project Objectives
1. **Design and Train ML Classifier**: Develop and cross-validate multiclass classifiers over the 29-dimension skill space, identifying the candidate with optimal probabilistic sharpness and macro balance.
2. **Establish Reproducible Preprocessing**: Build a leak-free preprocessing pipeline fitted strictly inside cross-validation training folds.
3. **Analyze Class Imbalance and Calibration**: Investigate empirical behavior on minority classes, evaluating class-weighting and probability calibration (Sigmoid vs Isotonic).
4. **Implement Local Explainability**: Integrate tree-path attribution and SHAP TreeExplainer to decompose predictions into positive and negative skill attributions.
5. **Build Competency Ontology and Gap Engine**: Construct a normative curriculum framework defining core skills, secondary skills, and prerequisite dependencies.
6. **Generate Deterministic Roadmaps**: Implement a 5-stage sequential roadmap generator using DAG traversal to lock dependent milestones.
7. **Curate Project Intelligence**: Build a catalog of 16 structured portfolio projects with rule-based relevance ranking and deliverable checklists.
8. **Deliver Full-Stack Application**: Implement and verify a responsive React frontend and FastAPI backend with sub-50ms latency and 178 automated regression tests passed.

---

# CHAPTER 3 — LITERATURE REVIEW AND BACKGROUND

## 3.1 Traditional Career Guidance Methodologies
Early career guidance systems relied primarily on psychometric questionnaires, such as Holland's RIASEC model (Realistic, Investigative, Artistic, Social, Enterprising, Conventional) and the Myers-Briggs Type Indicator (MBTI). While effective for general vocational orientation, psychometric inventories do not capture specialized technical competencies. A student scoring high in "Investigative" traits receives no actionable guidance on whether their proficiency in SQL and Python makes them better suited for data analytics or backend software engineering.

## 3.2 Machine Learning in Educational Data Mining
Educational Data Mining (EDM) has increasingly adopted supervised classification to model student performance and career trajectories. Prior studies have applied Decision Trees, Support Vector Machines, Naive Bayes, and Multi-Layer Perceptrons to academic transcript data. However, many published models exhibit severe methodological vulnerabilities:
- **Curriculum Leakage**: Models frequently include degree titles (e.g., B.Sc Data Science) as features to predict career tracks (e.g., Data Analyst), inflating classification accuracy while failing to measure transferable aptitude.
- **Synthetic Over-Fitting**: Several published benchmarks evaluate models on synthetically generated datasets with artificial Gaussian separations, reporting uncharacteristically high accuracies (>99%) that collapse when exposed to authentic student data.

## 3.3 Explainability and Local Interpretability in Recommenders
Black-box models create significant barriers in educational applications. When students receive automated recommendations without clear rationales, adoption and engagement decline. Post-hoc interpretability frameworks—specifically Shapley Additive Explanations (SHAP) and Local Interpretable Model-agnostic Explanations (LIME)—ground algorithmic predictions in game-theoretic contributions. In tree-based ensembles, Lundberg et al. (2020) established that `TreeExplainer` calculates exact Shapley values in polynomial time by evaluating conditional expectations across tree paths.

## 3.4 Curated Competency Ontologies vs Unstructured Generation
With the rise of Large Language Models (LLMs), recent educational tools attempt to generate career advice via natural language generation. While superficially fluent, generative LLMs suffer from documented failure modes:
- **Hallucination of Prerequisites**: LLMs frequently invent non-existent technical dependencies or recommend out-of-order learning paths.
- **Non-Deterministic Guidance**: Identical student profiles can receive contradictory advice across sessions.
- **Ungrounded Skill Coverage**: Generative systems cannot provide auditable mathematical proofs of competency coverage.

CareerCompass rejects generative black boxes in favor of a curated competency ontology, ensuring every prerequisite, roadmap milestone, and project recommendation is deterministic and verifiable.

## 3.5 Gaps in Existing Literature and Systems
The literature reveals three primary unaddressed gaps:
1. The lack of standardized, degree-independent technical skill benchmarks for computing disciplines.
2. The absence of systems combining statistical machine learning inference with deterministic DAG-based prerequisite resolution.
3. The disconnect between career guidance algorithms and tangible portfolio proof-of-work tracking.

CareerCompass AI was designed specifically to bridge these gaps.

---

# CHAPTER 4 — DATASET AND DATA PREPARATION

## 4.1 Dataset Identification and Roles
To ensure academic integrity, the project strictly delineates the roles of all datasets audited during research:

| Dataset Identifier | Records | Features | Target Domain | Project Role | Academic Limitation |
|---|:---:|:---:|---|---|---|
| **Primary Career Guidance Benchmark** | 241 retained | 29 skills | 4 Computing Tracks | **Primary Training & Holdout Benchmark** | Curated collegiate cohort; minority class sparsity |
| **Breejesh Dhar Career Recommendation** | 311 mapped | 17 attributes | Self-reported job titles | **External Transfer Evaluation** | Severe domain shift; target schema divergence |
| **RIASEC Psychometric Dataset** | 2,400 | 11 attributes | 6 Holland career areas | **Psychometric Alignment Benchmark** | Psychometric construct; not technical skill space |

*Critical Governance Rule*: Datasets were never merged. Model training, cross-validation, and candidate selection were conducted strictly and exclusively on the Primary Benchmark.

## 4.2 Primary Benchmark Acquisition and Fragmentation
The primary benchmark originally contained 1,500 raw student profiles. Initial data audits revealed extensive career label fragmentation, typographical anomalies, and disparate technical nomenclature:
- Over 25 raw career labels existed, including fragmented titles such as *"Full Stack Dev"*, *"Software Engineer"*, *"React Developer"*, and *"Web Programmer"*.
- Skill strings contained unnormalized separators (commas, slashes, mixed casing, and typographical variations).
- Academic degree titles were heavily correlated with specific career labels (e.g., 95% of students labeled *"BCA - Data Science"* had the target label *"Data Analyst"*).

## 4.3 Taxonomy Mapping and Inactive Classes
Through rigorous domain analysis, fragmented career labels were mapped to four canonical computing disciplines:
1. **Software Development & Engineering (SDE)**: Encompassing full-stack, frontend, backend, and desktop software development.
2. **AI & Machine Learning Engineering (AI/ML)**: Encompassing machine learning research, neural modeling, and algorithm engineering.
3. **Data Analytics & Business Intelligence (DA/BI)**: Encompassing statistical analysis, data visualization, and reporting.
4. **Cloud, DevOps & Systems Engineering**: Encompassing cloud infrastructure, automation, and system administration.

*Treatment of Inactive Class*: A fifth prospective track, *Database & Data Engineering*, contained zero native primary training records after taxonomy filtering. To prevent synthetic fabrication, it was formally designated as an inactive track and excluded from ML classification targets.

Following deduplication and exclusion of records outside computing disciplines, the primary dataset yielded **241 retained valid records**:

| Canonical Career Track | Sample Count | Proportion |
|---|:---:|:---:|
| Software Development & Engineering | 84 | 34.85% |
| AI & Machine Learning Engineering | 76 | 31.54% |
| Data Analytics & Business Intelligence | 62 | 25.73% |
| Cloud, DevOps & Systems Engineering | 19 | 7.88% |
| **Total Retained Samples** | **241** | **100.0%** |

## 4.4 Data Cleaning, Normalization, and Vocabulary Construction
Skill text was extracted and standardized via a deterministic normalization pipeline:
1. Converting all tokens to lowercase.
2. Stripping punctuation and non-alphanumeric characters.
3. Collapsing whitespace and hyphens into standard underscore separators (e.g., `"Machine Learning"` $\rightarrow$ `"machine_learning"`, `"web-dev"` $\rightarrow$ `"web_development"`).
4. Auditing tokens against a strict minimum frequency threshold ($\text{min\_freq} = 1$).

This produced the authoritative **29 canonical technical skill features**:
`ai`, `autocad`, `cad`, `cloud`, `communication`, `critical_thinking`, `data_analysis`, `database_design`, `database_systems`, `design`, `design_optimization`, `excel`, `experimentation`, `lab_work`, `machine_learning`, `matlab`, `negotiation`, `observation`, `plc`, `power_analysis`, `programming`, `pscad`, `python`, `recording`, `research`, `sales`, `simulation`, `team_management`, `web_development`.

## 4.5 Stratified Partitioning and Strict Leakage Prevention
To ensure robust generalization, the 241 retained records were partitioned using an 80/20 stratified split (`StratifiedShuffleSplit`, `random_state=42`):
- **Training Partition ($N = 192$, 79.67%)**: Dedicated exclusively to model fitting, hyperparameter exploration, and 5-fold stratified cross-validation.
- **Holdout Test Partition ($N = 49$, 20.33%)**: Sealed and untouched during all model development phases, evaluated strictly once for final confirmation.

| Career Track | Full Dataset ($N=241$) | Training Set ($N=192$) | Holdout Set ($N=49$) |
|---|:---:|:---:|:---:|
| Software Development & Engineering | 84 | 67 | 17 |
| AI & Machine Learning Engineering | 76 | 61 | 15 |
| Data Analytics & Business Intelligence | 62 | 49 | 13 |
| Cloud, DevOps & Systems Engineering | 19 | 15 | 4 |

*Leakage Safeguard*: Preprocessors (`MultiHotSkillEncoder`) were fitted strictly inside cross-validation training folds. Out-of-fold validation sets and the holdout partition were transformed using parameters learned strictly from training folds.

## 4.6 Feature Space Isolation (Elimination of Degree Confounders)
During exploratory phases, models trained with academic degree fields (`Education_Level`, `Specialization`, `Interests`) exhibited artificial performance boosts due to curricular confounding. For instance, `Specialization_Data Science` was a direct proxy for Data Analytics.

To establish genuine educational utility, Candidate H permanently isolates the feature space:
- **Excluded**: `Education_Level`, `Specialization`, `Interests`, demographic variables.
- **Included**: Strictly the 29 multi-hot binary technical skill indicators ($x_j \in \{0, 1\}$).

---

# CHAPTER 5 — MACHINE LEARNING METHODOLOGY

## 5.1 Model Selection Framework
Model selection followed a pre-declared hierarchy prioritizing probabilistic quality and class balance:
1. **Primary Metric 1: Macro-averaged F1 Score**: Evaluates unweighted arithmetic mean of per-class F1 scores, exposing models that sacrifice minority classes.
2. **Primary Metric 2: Multiclass Cross-Entropy Log Loss**: Measures probabilistic calibration and sharpness, heavily penalizing overconfident misclassifications.
3. **Secondary Metrics**: Overall Accuracy, Weighted F1, Top-2 Accuracy, Fold-to-Fold Standard Deviation, and Model Interpretability.

## 5.2 Baseline Classifiers
To contextualize performance, two baseline models were benchmarked:
- **Stratified Dummy Classifier**: Generates random predictions respecting empirical training class priors ($P(Y = c_k) = \frac{N_k}{N}$).
- **Uniform Prior Classifier**: Assumes equal class probabilities ($P(Y = c_k) = 0.25$).

## 5.3 Cross-Validation Protocol (5-Fold Stratified CV)
Cross-validation was conducted strictly across the 192 training records using 5 stratified folds (`StratifiedKFold(n_splits=5, shuffle=True, random_state=42)`). In each fold:
- 153 or 154 samples formed the training partition.
- 38 or 39 samples formed the out-of-fold validation partition.
- Minority class `Cloud, DevOps & Systems Engineering` had exactly 3 instances per fold.

## 5.4 Evaluation Metrics Under Severe Class Imbalance
In a dataset where Cloud/DevOps constitutes only 7.8% of samples, standard accuracy is misleading: a naive classifier assigning all instances to Software Engineering and AI/ML achieves ~67% accuracy while completely failing the minority class. Therefore, Macro F1 is enforced as the definitive arbiter of model balance:

$$\text{Macro F1} = \frac{1}{|\mathcal{C}|} \sum_{k=1}^{|\mathcal{C}|} \frac{2 \cdot \text{Precision}_k \cdot \text{Recall}_k}{\text{Precision}_k + \text{Recall}_k}$$

Multiclass Log Loss is formulated over all training samples $N$ and classes $K = 4$:

$$\mathcal{L}_{\text{log}} = -\frac{1}{N} \sum_{i=1}^N \sum_{k=1}^K y_{i, k} \ln p_{i, k}$$

where $y_{i, k} \in \{0, 1\}$ is the ground-truth binary indicator and $p_{i, k}$ is the model-predicted probability.

## 5.5 Model Candidate Search Space (Candidates A through H)
Eight pre-declared candidate configurations were evaluated under the exact 5-fold CV protocol:

| Candidate ID | Algorithm Family | Feature Configuration | Class Weighting | Feature Count |
|---|---|---|:---:|:---:|
| **Candidate A** | Multinomial Logistic Regression | Combined (Skills + Degree) | `None` | 60 |
| **Candidate B** | Multinomial Logistic Regression | Combined (Skills + Degree) | `balanced` | 60 |
| **Candidate C** | Random Forest (300 trees) | Combined (Skills + Degree) | `None` | 60 |
| **Candidate D** | Random Forest (300 trees) | Combined (Skills + Degree) | `balanced` | 60 |
| **Candidate E** | Multinomial Logistic Regression | Categorical-Only | `None` | 31 |
| **Candidate F** | Multinomial Logistic Regression | Skills-Only | `None` | 29 |
| **Candidate G** | Random Forest (300 trees) | Categorical-Only | `None` | 31 |
| **Candidate H** | Random Forest (300 trees) | Skills-Only | `None` | 29 |

## 5.6 Final Model Selection and Rationale (Candidate H)
In Phase 3.4, Candidate A was initially proposed. However, an empirical audit revealed that **Candidate H** was pre-declared, evaluated under identical splits, and demonstrated a superior overall balance of probabilistic quality, feature governance, and performance metrics over Candidate A:
1. **Probabilistic Performance & Lowest Log Loss**: Candidate H achieved the lowest Multiclass Log Loss across all 8 candidates (**$0.3768 \pm 0.0453$**), representing a 19.9% error reduction compared to Candidate A ($0.4704 \pm 0.0768$).
2. **Comparable or Slightly Better Macro F1**: Candidate H achieved **$0.6226 \pm 0.0506$** Macro F1, slightly outperforming Candidate A ($0.6188 \pm 0.0562$). While class-weighted candidates (Candidates B and D) achieved higher Macro F1 ($0.6883$ and $0.6741$), they severely degraded SDE recall to ~34–37% and increased log loss to >0.52.
3. **Skills-Only Feature Governance**: Candidate H relies strictly on 29 technical skills, completely eliminating degree-title confounding to ensure recommendations reflect transferable technical competencies rather than institutional enrollment labels.
4. **Probability Behavior & Fold Stability**: Candidate H exhibited bounded minimum true-class probabilities (avoiding severe log loss penalties) and lower fold-to-fold variance across cross-validation splits.

Candidate H was formally locked as the final production model.

---

# CHAPTER 6 — MODEL EVALUATION AND BENCHMARK RESULTS

## 6.1 Candidate Comparison Across Cross-Validation Folds
Table 6.1 summarizes the 5-fold cross-validation results across all eight candidate configurations:

| Candidate | Macro F1 (Mean ± SD) | Log Loss (Mean ± SD) | Accuracy (Mean ± SD) | Weighted F1 (Mean ± SD) | Top-2 Accuracy | Cloud Recall (OOF) | SDE Recall (OOF) |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Candidate H (Locked)** | **0.6226 ± 0.0506** | **0.3768 ± 0.0453** | **0.7858 ± 0.0667** | **0.7510 ± 0.0656** | **1.0000 ± 0.0000** | 0.0000 (0/15) | **0.7015 (47/67)** |
| **Candidate A** | 0.6188 ± 0.0562 | 0.4704 ± 0.0768 | 0.7752 ± 0.0771 | 0.7459 ± 0.0731 | 1.0000 ± 0.0000 | 0.0000 (0/15) | 0.6716 (45/67) |
| **Candidate B** | 0.6883 ± 0.0646 | 0.5242 ± 0.0695 | 0.7238 ± 0.0681 | 0.7111 ± 0.0671 | 1.0000 ± 0.0000 | 0.7333 (11/15) | 0.3433 (23/67) |
| **Candidate C** | 0.5766 ± 0.0411 | 0.7139 ± 0.3957 | 0.7028 ± 0.0552 | 0.6884 ± 0.0517 | 0.9947 ± 0.0105 | 0.0000 (0/15) | 0.5672 (38/67) |
| **Candidate D** | 0.6741 ± 0.0720 | 0.5779 ± 0.1170 | 0.6978 ± 0.0752 | 0.6929 ± 0.0745 | 1.0000 ± 0.0000 | 0.7333 (11/15) | 0.3731 (25/67) |
| **Candidate E** | 0.6263 ± 0.0396 | 0.4902 ± 0.0571 | 0.7858 ± 0.0527 | 0.7554 ± 0.0519 | 1.0000 ± 0.0000 | 0.0000 (0/15) | 0.6716 (45/67) |
| **Candidate F** | 0.6226 ± 0.0506 | 0.4802 ± 0.0415 | 0.7858 ± 0.0667 | 0.7510 ± 0.0656 | 1.0000 ± 0.0000 | 0.0000 (0/15) | 0.7015 (47/67) |
| **Candidate G** | 0.5875 ± 0.0449 | 0.5360 ± 0.1315 | 0.7182 ± 0.0601 | 0.7031 ± 0.0568 | 1.0000 ± 0.0000 | 0.0000 (0/15) | 0.5821 (39/67) |

## 6.2 Candidate H Cross-Validation and Out-of-Fold Performance
Across the 192 out-of-fold training predictions, Candidate H demonstrated distinctive per-class performance profiles:

| Career Track | Precision | Recall | F1-Score | Support | Correct Predictions |
|---|:---:|:---:|:---:|:---:|:---:|
| `AI & Machine Learning Engineering` | 0.7333 | 0.9016 | 0.8088 | 61 | 55 / 61 |
| `Cloud, DevOps & Systems Engineering` | 0.0000 | 0.0000 | 0.0000 | 15 | 0 / 15 |
| `Data Analytics & Business Intelligence` | 1.0000 | 1.0000 | 1.0000 | 49 | 49 / 49 |
| `Software Development & Engineering` | 0.6912 | 0.7015 | 0.6963 | 67 | 47 / 67 |
| **Macro Average** | **0.6061** | **0.6508** | **0.6263** | 192 | 151 / 192 |
| **Weighted Average** | **0.7548** | **0.7865** | **0.7552** | 192 | 151 / 192 |

*Out-of-Fold Confusion Matrix ($N = 192$)*:
- True AI/ML: $[55 \text{ (AI/ML)}, 0 \text{ (Cloud)}, 0 \text{ (Data)}, 6 \text{ (SDE)}]$
- True Cloud/DevOps: $[0 \text{ (AI/ML)}, 0 \text{ (Cloud)}, 0 \text{ (Data)}, 15 \text{ (SDE)}]$
- True Data Analytics: $[0 \text{ (AI/ML)}, 0 \text{ (Cloud)}, 49 \text{ (Data)}, 0 \text{ (SDE)}]$
- True Software Engineering: $[20 \text{ (AI/ML)}, 0 \text{ (Cloud)}, 0 \text{ (Data)}, 47 \text{ (SDE)}]$

## 6.3 Final Holdout Benchmark Evaluation (Untouched N = 49)
Candidate H was evaluated strictly **once** on the untouched $N = 49$ holdout test partition:

| Metric | Holdout Value ($N = 49$) | 5-Fold CV Mean ($N = 192$) | Generalization Delta | Evaluation Assessment |
|---|:---:|:---:|:---:|---|
| **Overall Accuracy** | **0.7959** (39/49) | 0.7858 | +0.0101 | Consistent benchmark performance between cross-validation and holdout evaluation |
| **Macro-Averaged F1** | **0.6302** | 0.6226 | +0.0076 | Preserves macro balance on unseen data |
| **Weighted F1** | **0.7589** | 0.7510 | +0.0079 | Generalizes across class support |
| **Multiclass Log Loss** | **0.3874** | 0.3768 | +0.0106 | High probability consistency; no substantial holdout degradation was observed under this benchmark |
| **Top-2 Accuracy** | **1.0000** (49/49) | 1.0000 | 0.0000 | 100% of true tracks in top-2 predictions |

*Per-Class Holdout Metrics*:
- **AI & Machine Learning Engineering**: Precision $0.7143$, Recall **$1.0000$** (15/15 correct), F1 $0.8333$ (Support: 15)
- **Data Analytics & Business Intelligence**: Precision **$1.0000$**, Recall **$1.0000$** (13/13 correct), F1 $1.0000$ (Support: 13)
- **Software Development & Engineering**: Precision $0.7333$, Recall $0.6471$ (11/17 correct), F1 $0.6875$ (Support: 17)
- **Cloud, DevOps & Systems Engineering**: Precision $0.0000$, Recall $0.0000$ (0/4 correct), F1 $0.0000$ (Support: 4)

*Holdout Confusion Matrix ($N = 49$)*:
- True AI/ML: $[15 \text{ (AI/ML)}, 0 \text{ (Cloud)}, 0 \text{ (Data)}, 0 \text{ (SDE)}]$
- True Cloud/DevOps: $[0 \text{ (AI/ML)}, 0 \text{ (Cloud)}, 0 \text{ (Data)}, 4 \text{ (SDE)}]$
- True Data Analytics: $[0 \text{ (AI/ML)}, 0 \text{ (Cloud)}, 13 \text{ (Data)}, 0 \text{ (SDE)}]$
- True Software Engineering: $[6 \text{ (AI/ML)}, 0 \text{ (Cloud)}, 0 \text{ (Data)}, 11 \text{ (SDE)}]$

## 6.4 Minority Class Sparsity Analysis (Cloud/DevOps)
The Cloud/DevOps track constitutes an acute minority class ($N = 15$ in training, $N = 4$ in holdout). Under default argmax classification over model-predicted probabilities ($\hat{y} = \arg\max_k p_k$), Candidate H predicted zero instances of Cloud/DevOps.

*Scientific Explanation*: All 15 training Cloud instances and all 4 holdout Cloud instances were classified as *Software Development & Engineering*. Analysis reveals that Cloud/DevOps profiles share extensive core programming and web development features with SDE, but the 300-tree ensemble assigns bounded probabilities to Cloud (typically $p \in [0.15, 0.35]$). Because SDE has higher empirical prior support (34.8% vs 7.8%), SDE's model-predicted class probability dominates under standard argmax. This limitation is transparently disclosed.

## 6.5 Class Weighting Ablation Study
To investigate whether artificial class rebalancing could resolve minority sparsity, an ablation study (Experiment A) was conducted comparing unweighted models against `class_weight='balanced'`:
- In Logistic Regression (Candidate B) and Random Forest (Candidate D), balanced weighting boosted Cloud/DevOps recall from $0.0000$ to $0.7333$ (11/15 detected).
- However, balanced weighting severely degraded Software Engineering recall (dropping from $70.15\%$ to $34.33\%$ in Candidate B and $37.31\%$ in Candidate D) by generating massive false alarms.
- Furthermore, balanced weighting substantially deteriorated multiclass Log Loss ($0.3768 \to 0.5779$).

*Methodological Conclusion*: Class weighting is not universally beneficial. Artificially inflating minority weights distorts empirical class probability estimates, which are critical for educational decision-support. Unweighted probabilities were retained.

## 6.6 Post-Hoc Decision Threshold Analysis
Rather than distorting the base model via class weights, an exploratory decision threshold analysis (Experiment E) evaluated operating thresholds $\tau \in [0.10, 0.40]$ on out-of-fold predictions:
- At $\tau = 0.25$, Cloud/DevOps recall reaches $1.0000$ (15/15 detected) with precision $0.3261$ (31 false alarms).
- At $\tau = 0.30$, Cloud/DevOps recall is $0.8000$ (12/15 detected) with precision $0.3077$.

*Governance Policy*: These threshold alternatives are documented as exploratory research findings. Because thresholding on $N = 15$ samples introduces high variance, default production inference adheres strictly to standard uncalibrated argmax.

## 6.7 External Transfer Evaluation (Breejesh Dhar Dataset)
To assess cross-institutional generalization, Candidate H was evaluated against the authentic external college graduate dataset from Breejesh Dhar ($N = 311$ mapped records):
- **Class Distribution**: Software Development: 230, Data Analytics: 44, Cloud/Systems: 23, AI/ML: 14.
- **Candidate H Transfer Metrics**:
  - Accuracy: **$0.6141$**
  - Macro F1: **$0.2721$**
  - Weighted F1: **$0.6038$**
  - Top-2 Accuracy: **$0.7524$**

*Critical Scientific Context*: This evaluation represents partial-schema zero-shot transfer against self-reported first-job titles. It does **not** establish "real-world career accuracy." The performance drop reflects substantial domain shift, vocabulary divergence, and target mismatch between curated educational profiles and dynamic labor-market hiring titles.

## 6.8 Psychometric Alignment Benchmark (RIASEC Dataset)
To examine psychometric feature alignment, a separate benchmark was conducted on the 2,400-record RIASEC dataset across 6 career tracks:
- **Config A (5 Cognitive Aptitude Features)**: Logistic Regression Macro F1 = **$0.5374 \pm 0.0168$**.
- **Config B (5 Cognitive + 6 RIASEC Traits)**: Logistic Regression Macro F1 = **$0.9570 \pm 0.0041$**, Top-2 Accuracy = **$1.0000$**.

*Methodological Disclaimer*: This result does **not** demonstrate real-world career prediction accuracy. The high performance ($0.9570$) is an artifact of the benchmark design: the target career classifications are defined directly from the underlying RIASEC vocational taxonomy.

## 6.9 Empirical Probability Calibration Study
A formal calibration experiment was executed on Candidate H under 5-fold Stratified CV with internal 3-fold cross-validation (`cv=3`):

| Calibration Regime | Log Loss (OOF) | Log Loss (CV Mean ± SD) | Brier Score (OOF) | ECE (10 Bins) | MCE | Macro F1 | Top-2 Acc |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Uncalibrated (Ensemble Votes)** | **0.3764** | **0.3768 ± 0.0506** | **0.2635** | 0.0730 | **0.1632** | **0.6263** | **100.0%** |
| **Sigmoid (Platt Scaling)** | 0.4659 | 0.4664 ± 0.0621 | 0.2814 | 0.1104 | 0.2605 | 0.6235 | 100.0% |
| **Isotonic Regression** | 0.3736 | 0.3740 ± 0.0475 | 0.2628 | **0.0383** | 0.1888 | 0.6263 | 100.0% |

*Calibration Decision Rationale*: **Uncalibrated probabilities were retained for production.**
1. Platt/Sigmoid scaling severely degraded probabilistic quality, increasing Log Loss by +23.8% ($0.3764 \to 0.4659$) and worsening ECE.
2. While Isotonic regression showed a minor numerical reduction in Log Loss ($-0.0028$, well within fold SD of $\pm 0.0506$), it worsened Maximum Calibration Error (MCE: $0.1888$ vs $0.1632$) due to step-function artifacts on the minority class.
3. Crucially, uncalibrated tree ensemble probabilities preserve exact local additivity for SHAP `TreeExplainer`. Production probabilities are explicitly documented as raw ensemble voting fractions.

---

# CHAPTER 7 — EXPLAINABILITY ARCHITECTURE

## 7.1 Explainability Requirements in Educational Guidance
Automated career guidance requires interpretable rationales. When a student receives an advisory classification, they must understand which specific technical competencies contributed to the recommendation. Without interpretability, students cannot discern whether a path was suggested due to their programming background, data manipulation skills, or absence of hardware competencies.

## 7.2 SHAP TreeExplainer Implementation
CareerCompass implements local feature attribution using SHAP `TreeExplainer` (Lundberg et al., 2020) configured with:

$$\text{feature\_perturbation} = \text{"tree\_path\_dependent"}$$

This configuration evaluates conditional expectations directly along tree splits, respecting empirical feature correlations without requiring synthetic background sampling. For any input profile $\mathbf{x}$ and target class $c$, the local prediction decomposes into:

$$f_c(\mathbf{x}) = \phi_0(c) + \sum_{j=1}^{29} \phi_j(c, \mathbf{x})$$

where $\phi_0(c)$ is the base expected value (prior probability) for class $c$, and $\phi_j(c, \mathbf{x}) \in \mathbb{R}$ represents the Shapley attribution of technical skill $j$.

## 7.3 Deterministic TreePathAttribution Fallback
To safeguard production availability against environment-specific compilation failures or memory constraints, the backend incorporates an exact, deterministic mathematical fallback: `TreePathAttribution`.

For each tree $t \in \{1, \dots, T\}$ in the ensemble:
1. The instance $\mathbf{x}$ traverses nodes from root to its terminating leaf node $\ell_t(\mathbf{x})$.
2. The probability shift across the path is computed: $\Delta p_t = p(\ell_t(\mathbf{x})) - p(\text{root}_t)$.
3. Feature contributions along active split decision boundaries are accumulated and averaged across all $T = 300$ trees:

$$\phi_j^{\text{path}}(c, \mathbf{x}) = \frac{1}{T} \sum_{t=1}^T \sum_{k \in \text{Path}_t(\mathbf{x}), \text{split}(k) = j} I_k(c)$$

This guarantees bit-level deterministic feature attributions with zero external dependencies.

## 7.4 Global Feature Importance vs Local Instance Attribution
Across the global Random Forest ensemble, Gini feature importances highlight the most discriminative skills across computing disciplines:
- Top Global Skills: `skill_python` (0.184), `skill_design_optimization` (0.142), `skill_database_systems` (0.128), `skill_web_development` (0.115), `skill_ai` (0.098), `skill_cad` (0.076).
- However, local instance attributions often diverge from global rankings. A student presenting `excel` and `data_analysis` receives massive positive local attributions for *Data Analytics & BI*, even if `skill_design_optimization` has higher global Gini importance.

## 7.5 Non-Causal Semantics and Scientific Disclaimers
*Formal Scientific Disclaimer*: Feature attributions explain **model behavior relative to the training benchmark**. They describe statistical associations in historical student profiles. They do **not** represent real-world causality, do not guarantee that acquiring a skill will cause employment, and do not define the downstream skill-gap analysis.

---

# CHAPTER 8 — CAREER INTELLIGENCE ENGINE

## 8.1 Curated Competency Ontology Design
The Career Intelligence Engine operates over an expert-curated competency ontology defining normative technical expectations across the four computing disciplines:
- **Core Competencies**: Mandatory foundational skills required for baseline competence.
- **Secondary Competencies**: Complementary technologies broadening domain versatility.
- **Prerequisite Dependencies**: Directed relationships specifying prerequisite topics.
- **Curriculum Stages**: Categorization into 5 pedagogical phases.

The ontology is curated product knowledge; it is **not** machine-learned from Candidate H.

## 8.2 Deterministic Skill-Gap Analysis
Given a student's active skills $S_{\text{student}} \subseteq \mathcal{V}_{29}$ and selected career target $c^*$, the skill-gap engine computes:
1. **Present Core Skills**: $S_{\text{core\_present}} = S_{\text{student}} \cap S_{\text{core}}(c^*)$
2. **Missing Core Skills**: $S_{\text{core\_missing}} = S_{\text{core}}(c^*) \setminus S_{\text{student}}$
3. **Present Secondary Skills**: $S_{\text{sec\_present}} = S_{\text{student}} \cap S_{\text{sec}}(c^*)$
4. **Missing Secondary Skills**: $S_{\text{sec\_missing}} = S_{\text{sec}}(c^*) \setminus S_{\text{student}}$

The fundamental metric is **Required-Skill Coverage** (formerly termed skill proficiency):

$$\text{Required-Skill Coverage (\%)} = \frac{|S_{\text{student}} \cap S_{\text{core}}(c^*)|}{|S_{\text{core}}(c^*)|} \times 100$$

This formula provides an auditable, transparent percentage reflecting progress against mandatory track foundations.

## 8.3 Prerequisite Directed Acyclic Graph (DAG) Engine
Missing skills are dynamically evaluated against a directed acyclic graph (DAG) representing prerequisite relationships:
- A missing skill $s \in S_{\text{missing}}$ is flagged as **Available (Unlocked)** if:

$$\text{Prerequisites}(s) \subseteq S_{\text{student}}$$

- If any prerequisite is missing, the skill is flagged as **Blocked**, visually indicating that the student must master foundational requirements first.

## 8.4 5-Stage Progressive Roadmap Generation
The engine constructs a sequential, 5-stage pedagogical roadmap:
- **Stage 1: Prerequisites & Tooling**: Core programming syntax, version control, and development environments.
- **Stage 2: Core Fundamentals**: Foundational domain theory (data structures, statistical modeling, database systems).
- **Stage 3: Applied Frameworks**: Practical industry libraries (web development frameworks, scikit-learn, cloud SDKs).
- **Stage 4: Systems & Tooling**: Testing, containerization, CI/CD, and system optimization.
- **Stage 5: Capstone Synthesis**: End-to-end multi-tier implementations and deployable artifacts.

Milestones are sequenced by DAG topological order. Students can interactively check off completed milestones, which dynamically updates state and unlocks dependent stages.

## 8.5 Curated Learning Resource Recommendation
Each missing skill links directly to curated, verified learning modules (e.g., official documentation, open-source tutorials, and university courseware). In Phase 6, all learning URLs were audited and verified, eliminating broken placeholder links.

## 8.6 Human Agency and Target Track Override Flow
A critical architectural feature is human-in-the-loop agency. When Candidate H outputs an advisory prediction (e.g., *AI & Machine Learning Engineering*), the student may:
1. Accept the model prediction as their planning target.
2. Manually override the target to a different track (e.g., targeting *Software Development & Engineering*).

The system preserves both entities independently in state:
- `careerPrediction`: Preserves the authentic, unaltered ML inference response.
- `selectedCareerTarget`: Drives the downstream ontology, roadmap, learning, and project recommendations.

---

# CHAPTER 9 — PROJECT AND PORTFOLIO INTELLIGENCE

## 9.1 Project Catalog Design and Prerequisite Alignment
Phase 6 introduced a comprehensive catalog of **16 curated, portfolio-oriented technical projects** (exactly 4 projects per career track):
- Each project specifies: target career track, difficulty level (`Beginner`, `Intermediate`, `Advanced`), estimated completion hours, targeted skills, prerequisite skills, roadmap stage alignment, and required tangible deliverables.
- Deliverables require verified proof-of-work: GitHub repository, live production deployment, architecture documentation, and test suite execution.

## 9.2 Rule-Based Project Relevance Scoring
Project recommendations are ranked via an explicit, deterministic heuristic known as the **Rule-Based Project Relevance Score**:

$$\text{Relevance Score} = \min\left(100, \; \frac{2.0 \cdot |S_{\text{proj}} \cap S_{\text{core\_missing}}| + 1.0 \cdot |S_{\text{proj}} \cap S_{\text{sec\_missing}}|}{\max(1, |S_{\text{target}}|)} \times 100\right)$$

*Academic Terminology Note*: The Project Relevance Score is **not** an AI confidence metric. It is an auditable mathematical index prioritizing projects that address the student's highest-priority missing competencies while respecting prerequisite readiness.

## 9.3 Deliverable Evidence Standards
To prevent superficial project completion claims, each project defines a strict evidence checklist:
1. Public Git repository with comprehensive README and commit history.
2. Live interactive web deployment (e.g., Vercel, Netlify, or Render).
3. System architecture diagram and design documentation.
4. Automated test suite demonstrating test coverage.

## 9.4 Portfolio Evidence Coverage Formula
Progress across a student's portfolio is quantified via the **Portfolio Evidence Coverage** metric:

$$\text{Portfolio Evidence Coverage (\%)} = \frac{|S_{\text{verified}}|}{|S_{\text{target\_required}}|} \times 100$$

where $S_{\text{verified}}$ denotes skills validated by completed projects with submitted deliverable links or verified external certificates.

*Ethical Disclaimer*: Portfolio evidence coverage reflects self-reported or user-linked proofs. It demonstrates project completion within the educational environment but does not independently certify professional competency.

## 9.5 State Persistence and Proof-of-Work Architecture
All portfolio interactions (project progress, milestone completion, deliverable links, and added certificates) are managed through the centralized `AppStateContext` and serialized immutably to `localStorage`. Page refreshes restore full application state without data loss.

---

# CHAPTER 10 — SYSTEM DESIGN AND IMPLEMENTATION

## 10.1 High-Level Architecture
CareerCompass AI follows a modular, decoupled client-server architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                 FRONTEND SINGLE-PAGE APP                    │
│                 (React 18, TypeScript, Vite)                │
│                                                             │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────────┐  │
│  │ Career Predict│ │ Skill Gap View│ │Portfolio Dashboard│  │
│  └───────┬───────┘ └───────┬───────┘ └─────────┬─────────┘  │
│          │                 │                   │            │
│          └─────────────────┼───────────────────┘            │
│                            ▼                                │
│                   AppStateContext Store                     │
│               (Immutable Reducer + Storage)                 │
└────────────────────────────┬────────────────────────────────┘
                             │ REST API (JSON)
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                 BACKEND WEB SERVICE (FastAPI)               │
│                                                             │
│  ┌───────────────────────┐       ┌───────────────────────┐  │
│  │   Prediction Router   │       │ Intelligence Router   │  │
│  └───────────┬───────────┘       └───────────┬───────────┘  │
│              ▼                               ▼              │
│  ┌───────────────────────┐       ┌───────────────────────┐  │
│  │ ModelService (RF)     │       │ CareerOntologyService │  │
│  │ SHAP TreeExplainer    │       │ ProjectCatalogService │  │
│  └───────────────────────┘       └───────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 10.2 Backend Service Design (FastAPI)
The backend is implemented in Python 3.12 using FastAPI and Pydantic v2:
- **Lifespan Singleton**: The `ModelService` loads Candidate H model artifacts (`careercompass_phase3_4_model.joblib`), preprocessors, and metadata strictly once during application startup (measured startup time: $409.44\text{ ms}$).
- **Stateless Inference**: All prediction, explanation, and intelligence endpoints execute statelessly, enabling horizontal scaling across worker processes.
- **Strict Boundary Validation**: Request bodies are validated against strict Pydantic schemas, enforcing token length limits, array size bounds, and unknown token auditing.

## 10.3 Frontend Single-Page Application (React + TypeScript)
The user interface is built as a single-page application using React 18, TypeScript 5.5, and Vite:
- **Strict TypeScript Typing**: Complete type safety enforced across API contracts, state objects, and UI components (`tsc --noEmit` clean).
- **Single Source of Truth**: Managed by `AppStateContext` with pure reducer actions, guaranteeing immutability and predictable state transitions.
- **Accessible & Responsive Design**: WCAG AA compliant contrast, semantic HTML, visible keyboard focus rings, and responsive grid layouts spanning mobile, tablet, and desktop viewports.

## 10.4 REST API Specification and Contracts
Table 10.1 details the core FastAPI endpoints:

| Endpoint | Method | Request Payload | Response Model | HTTP Status | Error Behavior |
|---|:---:|---|---|:---:|---|
| `/api/v1/health` | GET | None | `HealthStatus` | 200 | 500 if server unhealthy |
| `/api/v1/ready` | GET | None | `ReadyStatus` | 200 | 503 if ML artifacts unready |
| `/api/v1/model/info` | GET | None | `ModelMetadataResponse` | 200 | 500 if metadata unreadable |
| `/api/v1/predictions/career/skills` | GET | None | `SkillVocabularyResponse` | 200 | Deterministic 29-skill list |
| `/api/v1/predictions/career` | POST | `CareerPredictionRequest` | `CareerPredictionResponse` | 200 | 422 if empty/invalid; 503 if unready |
| `/api/v1/predictions/career/explain` | POST | `CareerPredictionRequest` | `CareerExplanationResponse`| 200 | 422 if invalid; 503 if unready |
| `/api/v1/career/ontology` | GET | None | `CareerOntologyResponse` | 200 | Full 4-track curriculum graph |
| `/api/v1/career/intelligence` | POST | `CareerIntelligenceRequest`| `CareerIntelligenceResponse`| 200 | Deterministic gaps & 5-stage roadmap |
| `/api/v1/career/projects/catalog` | GET | None | `ProjectCatalogResponse` | 200 | 16 curated project templates |
| `/api/v1/career/projects/recommendations` | POST | `ProjectRecommendationRequest`| `ProjectRecommendationResponse`| 200 | Relevance-ranked project list |

## 10.5 Data Flow Across Subsystems
1. Student inputs technical skills in the UI.
2. Client submits POST `/predictions/career`. Backend validates against the 29-token vocabulary and evaluates Candidate H.
3. Client renders advisory prediction and probability distribution.
4. Client requests local explanation via POST `/predictions/career/explain`. Backend computes SHAP or TreePath feature attributions.
5. Client submits POST `/career/intelligence`. Backend resolves curriculum ontology, evaluates prerequisite DAG, and constructs the 5-stage roadmap.
6. Client submits POST `/career/projects/recommendations`. Backend ranks projects via the relevance score.
7. Student completes deliverables and checks off milestones; state is serialized to `localStorage`.

---

# CHAPTER 11 — TESTING, VALIDATION, AND PERFORMANCE

## 11.1 Automated Testing Architecture
Quality assurance enforces a strict zero-tolerance regression policy across three independent testing tiers:

```
┌────────────────────────────────────────────────────────┐
│         178 TOTAL AUTOMATED REGRESSION TESTS           │
├────────────────────┬────────────────────┬──────────────┤
│ 74 Backend Pytest  │ 46 ML Pytest       │ 58 Frontend  │
│ (FastAPI & Models) │ (1 skipped)        │ (TSX Runner) │
└────────────────────┴────────────────────┴──────────────┘
```

## 11.2 Backend Test Suite (74 Pytest Cases)
Implemented in `backend/tests/`, covering:
- API endpoint contracts, schemas, and HTTP status codes.
- Request boundary enforcement, empty input validation, and token length limits.
- Artifact integrity checks (verifying Candidate H hyperparameters and 29-feature vocabulary).
- Exception handling and absence of filesystem path leakage.
- Career intelligence, roadmap generation, and project recommendation calculations.
- *Status*: **74 passed, 0 failed**.

## 11.3 Machine Learning Test Suite (46 Passed, 1 Skipped)
Implemented in `ml/tests/`, covering:
- Dataset integrity, zero training-test data leakage, and canonical label verification.
- Reproducibility of cross-validation splits and deterministic preprocessor transformations.
- Out-of-fold probability summation ($\sum p_k = 1.0$) and proper metric calculations.
- Candidate H parameter freezing and isolation of external Breejesh/RIASEC datasets.
- *Status*: **46 passed, 1 skipped, 0 failed**. (Note: The single skipped test represents an optional GPU/external dependency benchmark test intentionally bypassed in local CPU environments).

## 11.4 Frontend Integration Test Suite (58 TSX Cases)
Implemented in `src/tests/` using TypeScript test execution (`tsx`), covering:
- Phase 3.6 ML API client integration (12 tests).
- Phase 4 ML explanation decoupled request flow (5 tests).
- UI-v2.2 State store immutability, serialization, and persistence (11 tests).
- Phase 5 Career Intelligence API and reducer actions (15 tests).
- Phase 6 Project recommendations, evidence checklists, and portfolio coverage formulas (15 tests).
- *Status*: **58 passed, 0 failed**.

## 11.5 TypeScript Typecheck and Static Verification
- `npm run typecheck` (`tsc --noEmit -p tsconfig.app.json`): **0 errors**.
- `npm run build` (Vite production bundle): **0 errors**, clean code-splitting into vendor and route chunks.

## 11.6 End-to-End User Journey Verification
A comprehensive 24-step user journey audit (verified in Phase 7) confirmed end-to-end integration:
- Selection of skills (`python`, `ai`, `programming`) $\to$ Real prediction (*AI & ML Engineering*, $p = 0.6700$).
- Feature attribution rendering positive contributions for input skills.
- Skill Gap navigation showing exact $50.0\%$ required-skill coverage.
- Target override to SDE preserving ML prediction while updating roadmap.
- Project start, deliverable link submission, and milestone completion.
- Full browser refresh (`Ctrl+F5`) confirming complete state hydration from `localStorage`.

## 11.7 Local Latency and Performance Benchmark
Local benchmark measurements across 50 iterations per endpoint (`backend/scripts/measure_performance.py`):

| Operation | Invocation | Mean Latency | Median Latency | Min Latency | Max Latency | Performance Assessment |
|---|:---:|:---:|:---:|:---:|:---:|---|
| **Model Artifact Loading** | Singleton Startup | **409.44 ms** | 409.44 ms | 409.44 ms | 409.44 ms | Rapid one-time initialization |
| **POST /predictions/career** | 50 iterations | **32.37 ms** | 31.27 ms | 30.09 ms | 79.33 ms | Sub-50ms inference |
| **POST /predictions/career/explain** | 50 iterations | **41.38 ms** | 40.63 ms | 39.11 ms | 57.63 ms | Rapid local tree attribution |
| **POST /career/intelligence** | 50 iterations | **31.91 ms** | 31.82 ms | 30.56 ms | 33.54 ms | Instantaneous DAG progression |
| **POST /career/projects/recommendations** | 50 iterations | **33.67 ms** | 32.16 ms | 31.09 ms | 88.99 ms | Real-time heuristic ranking |

*Note*: These figures represent local execution benchmark timings and are not production load-test or high-concurrency stress results.

---

# CHAPTER 12 — SECURITY AND DEPLOYMENT

## 12.1 Application-Level Security Audit
An application-level security audit was conducted to identify and mitigate common web vulnerabilities:
- **Zero Committed Secrets**: `.env` is strictly git-ignored; safe defaults are provided in `.env.example`.
- **Credential Governance**: Instructions for secure random token generation (`secrets.token_urlsafe(64)`) are documented.
- **Sanitized Error Envelopes**: Production exception handlers catch unexpected errors and return generic error envelopes (`{"code": "server_error", "message": "An unexpected error occurred."}`), preventing stack trace or internal filesystem path leakage.

## 12.2 CORS Policy and Boundary Validation
Cross-Origin Resource Sharing (CORS) enforces strict security bounds:
- Wildcard origins (`*`) are prohibited in code and rejected at configuration parse time.
- Allowed origins are explicitly parsed from environment variables (`ALLOWED_ORIGINS` / `CORS_ORIGINS`).

## 12.3 Input Sanitization and Exception Envelopes
Input vectors are hardened against injection and resource exhaustion:
- Skill list submissions are capped at a maximum of 100 tokens.
- Individual skill string tokens are limited to 100 characters.
- Excessive or malformed payloads are rejected immediately with HTTP 422.

## 12.4 Deployment Architecture and Containerization
The platform is fully **deployment-ready** across multiple hosting paradigms:
- **Containerized Deployment**:
  - `Dockerfile.frontend`: Multi-stage build (Node 20 build $\to$ unprivileged Nginx static serving).
  - `Dockerfile`: Optimized Python 3.12 backend container bundling locked `ml/models/`.
  - `docker-compose.yml`: Local multi-container orchestration with inter-service networking and health probes.
- **Cloud PaaS Configuration**:
  - `render.yaml`: Blueprint for backend FastAPI web service on Render.
  - `vercel.json`: Configuration for frontend SPA static deployment on Vercel.

*Academic Deployment Status*: The codebase is deployment-ready and verified in containerized local environments; a live public cloud deployment is not maintained as an active production service.

## 12.5 Environment Configuration and Secrets Governance
The system differentiates between development and production modes via `APP_ENV`:
- When `APP_ENV=production`, debug mode is forced to `false` and detailed error responses are suppressed.

---

# CHAPTER 13 — ACADEMIC LIMITATIONS AND RISKS

To preserve academic defensibility, the limitations of CareerCompass AI are explicitly cataloged:

1. **Benchmark Size Constraints**: The primary training benchmark contains $N = 192$ training samples. While sufficient for exploratory collegiate benchmarking, it does not represent a population-scale census.
2. **Curated Nature of Primary Data**: The primary dataset represents a specific engineering cohort, which may not capture non-traditional, self-taught, or international career paths.
3. **Minority Class Sparsity**: With only 15 training and 4 holdout instances, performance on *Cloud, DevOps & Systems Engineering* cannot be reliably estimated. Standard argmax over model-predicted probabilities produces zero predictions for this track ($0/4$ holdout recall).
4. **Binary Feature Space**: The 29 skill features are strictly binary ($x_j \in \{0, 1\}$). The model captures skill presence versus absence, not depth of expertise, recency, or practical fluency.
5. **Non-Causal Feature Attributions**: SHAP attributions explain model mechanics relative to the training distribution. They do not demonstrate that acquiring a skill will causally trigger a career outcome.
6. **Domain Shift in External Transfer**: When evaluated on the external Breejesh Dhar dataset, Macro F1 dropped to $0.2721$, highlighting significant divergence between collegiate curriculum taxonomies and first-job hiring titles.
7. **Uncalibrated Model Probabilities**: Candidate H outputs raw Random Forest ensemble voting fractions. While monotonic and ranking-consistent, they are not calibrated posterior probabilities; they represent Random Forest ensemble voting probabilities.
8. **Coarse 4-Track Taxonomy**: The system supports 4 computing tracks. Specialized disciplines (e.g., embedded systems, cybersecurity, quantum computing) are outside the model's prediction space.
9. **Curated (Non-Learned) Ontology**: The skill ontology, DAG prerequisites, and project catalog represent human-expert curriculum design, not machine-learned discoveries.
10. **Self-Reported Evidence**: Project deliverable links and completed checklists are user-reported; the system does not execute automated code quality analysis.
11. **LocalStorage Client Persistence**: Active application state is persisted in client `localStorage`, which is appropriate for personal demonstration but lacks multi-device database synchronization.

---

# CHAPTER 14 — ETHICAL CONSIDERATIONS AND SOCIETAL IMPACT

## 14.1 Advisory vs High-Stakes Decision-Making
Career recommendations have the potential to influence academic decisions and professional self-perception. CareerCompass is strictly designed as an **exploratory decision-support system**. It must **never** be utilized for high-stakes gating, university admissions screening, employment pre-filtering, or candidate rejection.

## 14.2 Preservation of Student Autonomy
A major ethical risk in automated guidance is algorithmic paternalism. CareerCompass mitigates this by placing the student in control: students can freely explore alternative tracks, inspect model probabilities, and manually override the career target. The system never forces an algorithmic recommendation upon the user.

## 14.3 Algorithmic Bias and Training Set Distortion
Because machine learning models inherit the historical biases of their training data, small or geographically localized cohorts can perpetuate historical curricular patterns. For example, if a university curriculum historically steered female students toward business analytics rather than systems programming, an unconstrained model would learn that bias. By stripping demographic indicators, degree titles, and personal attributes, CareerCompass ensures classification is governed strictly by technical skill indicators.

## 14.4 Transparency and Explainability Safeguards
By pairing every advisory prediction with local SHAP feature attributions and providing explicit disclaimers on model probabilities, the system demystifies its recommendations, fostering critical evaluation rather than blind trust.

## 14.5 Data Privacy and Local Inference
CareerCompass executes all machine learning inference locally on dedicated application servers using locked scikit-learn artifacts. Student skill profiles and portfolio links are never transmitted to commercial third-party LLM APIs, safeguarding student privacy.

---

# CHAPTER 15 — FUTURE SCOPE AND CONCLUSION

## 15.1 Longitudinal Outcome Tracking (Future Scope)
Future research should establish partnerships with university placement offices to track student career outcomes over 3–5 years, providing empirical ground truth to validate whether ontology-guided roadmaps correlate with improved placement rates.

## 15.2 Continuous Competency Representation (Future Scope)
Transitioning from binary skill presence ($x_j \in \{0, 1\}$) to continuous or ordinal proficiency scales (e.g., Novice, Competent, Proficient, Expert) based on standardized technical assessments would enhance feature fidelity.

## 15.3 Expanded Labor-Market Taxonomy (Future Scope)
Expanding the ontology and dataset to include modern high-demand tracks (Cybersecurity Engineering, Distributed Systems, Site Reliability Engineering, Data Engineering) with automated synchronization to real-time labor-market vacancy feeds.

## 15.4 Automated Code and Evidence Verification (Future Scope)
Integrating automated code quality analysis (static linting, GitHub API commit history verification, test coverage parsing) to objectively validate student project deliverables.

## 15.5 Final Synthesis and Academic Conclusion
CareerCompass AI demonstrates that effective, trustworthy educational career guidance cannot be achieved through statistical machine learning alone, nor through unconstrained generative models. By establishing a rigorous, architecturally disciplined synthesis:
- **Machine Learning (Candidate H)** provides leak-free, confounder-free advisory classification.
- **Explainability (SHAP & TreePath)** delivers transparent local feature attributions.
- **Competency Ontology & DAG Engine** provides deterministic, rule-based roadmapping.
- **Project & Portfolio Intelligence** bridges the gap between theoretical learning and verifiable proof-of-work.

The resulting system is mathematically defensible, structurally robust, verified by 178 automated tests, and ready for academic submission.

---

# REFERENCES

1. Holland, J. L. (1997). *Making vocational choices: A theory of vocational personalities and work environments* (3rd ed.). Psychological Assessment Resources. [Bibliographic details verified from standard literature].
2. Lundberg, S. M., Erion, G., Chen, H., DeGrave, A., Prutkin, J. M., Nair, B., Katz, R., Himmelfarb, J., Bansal, N., & Lee, S.-I. (2020). From local explanations to global understanding with explainable AI for trees. *Nature Machine Intelligence*, 2(1), 56-67.
3. Pedregosa, F., Varoquaux, G., Gramfort, A., Michel, V., Thirion, B., Grisel, O., Blondel, M., Prettenhofer, P., Weiss, R., Dubourg, V., Vanderplas, J., Passos, A., Cournapeau, D., Brucher, M., Perrot, M., & Duchesnay, E. (2011). Scikit-learn: Machine learning in Python. *Journal of Machine Learning Research*, 12, 2825-2830.
4. Romero, C., & Ventura, S. (2020). Educational data mining and learning analytics: An updated survey. *WIREs Data Mining and Knowledge Discovery*, 10(3), e1355.
5. Dhar, B. (2023). *Career Recommendation Dataset*. Kaggle Dataset Repository. Kaggle identifier: `breejeshdhar/career-recommendation-dataset`. [Bibliographic details verified from repository external audit].
6. Career Guidance Dataset (2023). *Perfect Realistic Career Guidance Dataset*. Kaggle Dataset Repository. [Bibliographic details verified from repository dataset audit].
7. Tiangolo, S. (2018). *FastAPI: Modern, fast (high-performance), web framework for building APIs with Python 3.8+*. https://fastapi.tiangolo.com/
8. React Documentation Team (2024). *React: The library for web and native user interfaces*. Meta Platforms, Inc. https://react.dev/

---

# APPENDICES

### Appendix A: Canonical Skill Vocabulary
The 29 canonical technical skills: `ai`, `autocad`, `cad`, `cloud`, `communication`, `critical_thinking`, `data_analysis`, `database_design`, `database_systems`, `design`, `design_optimization`, `excel`, `experimentation`, `lab_work`, `machine_learning`, `matlab`, `negotiation`, `observation`, `plc`, `power_analysis`, `programming`, `pscad`, `python`, `recording`, `research`, `sales`, `simulation`, `team_management`, `web_development`.

### Appendix B: Candidate H Hyperparameter Specification
- Classifier: `sklearn.ensemble.RandomForestClassifier`
- `n_estimators`: 300
- `criterion`: `'gini'`
- `max_depth`: `None`
- `min_samples_split`: 2
- `min_samples_leaf`: 1
- `class_weight`: `None`
- `random_state`: 42
- `n_jobs`: -1
- Input Dimension: 29 binary indicators
- Output Dimension: 4 classes

### Appendix C: Test Suite Execution Summary
- Backend Suite: `pytest backend/tests/ -q` $\to$ **74 passed**
- ML Suite: `pytest ml/tests/ -q` $\to$ **46 passed, 1 skipped**
- Frontend Suite: `npm test` $\to$ **58 passed**
- Static Typecheck: `npm run typecheck` $\to$ **0 errors**
- Production Build: `npm run build` $\to$ **Clean bundle generated**
- Total Automated Regression Tests: **178 passed**
