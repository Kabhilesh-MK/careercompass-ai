"""CareerCompass AI — Bottom-Up Latent-Variable Synthetic Career Dataset Generator.

Architecture:
-------------
1. Student Population Latent Generation:
   - General capability factor theta ~ Normal(0, 1)
   - Archetype concentration w ~ Dirichlet(alpha), alpha = [0.75 x 9]
   - Latent continuous competencies z_k = sigmoid(ln(9 * w_k) + 0.40 * theta)
2. Observable Profile Realization:
   - 22 Technical Skills + 5 Soft Skills via continuous factor loading matrix L
   - 4 Academic/Experience features (CGPA, Projects, Internships, Certifications)
   - 2 Stated Preferences (Interest, Preferred Domain) via explored utility matrices
3. Independent Career Suitability Scoring:
   - Evaluated purely on manifest profile X (latent z is NOT used in suitability)
   - Incorporates market skill evaluation matrix W (14 x 27), academic weights V_acad (14 x 4),
     preference affinity, calibrated base intercepts alpha^*, and Gumbel shock
4. Probabilistic Career Label Assignment:
   - Softmax probabilities P(c | X) with calibrated temperature T_career
   - Realized label y ~ Categorical(P_1 .. P_14) via exactly one unconstrained draw
5. Information Barrier:
   - The generator's latent variables (theta, w, z, S, L, W) are NEVER exposed to the production ML model.
   - The output dataset contains strictly observable features X and realized label y.
"""

from __future__ import annotations

import json
import random
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from loguru import logger

from ml.utils.paths import DATASET_PATH, CAREER_DATASET_PATH, GENERATOR_CONFIG_PATH

# ---------------------------------------------------------------------------
# Global Constants & Reproducibility
# ---------------------------------------------------------------------------

GENERATOR_VERSION: str = "3.0.0-latent-factor"
RANDOM_SEED: int = 42
N_STUDENTS: int = 5000

CAREER_CLASSES: list[str] = [
    "AI Engineer",
    "Backend Developer",
    "Business Analyst",
    "Cloud Engineer",
    "Cybersecurity Analyst",
    "Data Analyst",
    "Data Scientist",
    "DevOps Engineer",
    "Frontend Developer",
    "Full Stack Developer",
    "ML Engineer",
    "Mobile App Developer",
    "QA Engineer",
    "Software Engineer",
]

TECHNICAL_SKILLS: list[str] = [
    "Python", "Java", "C++", "SQL", "HTML", "CSS", "JavaScript",
    "React", "NodeJS", "MongoDB", "MySQL", "Git", "GitHub",
    "AWS", "Azure", "Docker", "Linux",
    "Machine Learning", "Deep Learning",
    "Power BI", "Excel", "Statistics",
]

SOFT_SKILLS: list[str] = [
    "Communication", "Problem Solving", "Leadership",
    "Teamwork", "Aptitude",
]

ALL_SKILLS: list[str] = TECHNICAL_SKILLS + SOFT_SKILLS

PROFILE_FEATURES: list[str] = [
    "CGPA", "Projects Completed", "Internship", "Certifications",
]

INTEREST_OPTIONS: list[str] = [
    "Web Development", "Data Science", "Cloud Computing",
    "Cybersecurity", "Mobile Development", "AI/ML",
    "DevOps", "Business Analytics",
]

DOMAIN_OPTIONS: list[str] = [
    "Frontend", "Backend", "Full Stack", "Data & Analytics",
    "Machine Learning", "Cloud & DevOps", "Security",
    "Mobile", "QA & Testing", "Business",
]

ALL_FEATURE_COLS: list[str] = (
    TECHNICAL_SKILLS + SOFT_SKILLS + PROFILE_FEATURES
    + ["Interest", "Preferred Domain"]
)

# ---------------------------------------------------------------------------
# Generator-Internal Parameter Matrices (Information Barrier Protected)
# ---------------------------------------------------------------------------

# 27 x 9 Skill Loading Matrix L (Every row sums to 1.0)
L_MATRIX: np.ndarray = np.array([
    [0.20, 0.00, 0.20, 0.20, 0.30, 0.05, 0.05, 0.00, 0.00],  # Python
    [0.30, 0.00, 0.35, 0.05, 0.00, 0.10, 0.05, 0.15, 0.00],  # Java
    [0.50, 0.00, 0.20, 0.00, 0.10, 0.00, 0.15, 0.05, 0.00],  # C++
    [0.05, 0.00, 0.35, 0.40, 0.10, 0.05, 0.05, 0.00, 0.00],  # SQL
    [0.05, 0.65, 0.15, 0.00, 0.00, 0.00, 0.00, 0.15, 0.00],  # HTML
    [0.00, 0.80, 0.05, 0.00, 0.00, 0.00, 0.00, 0.15, 0.00],  # CSS
    [0.10, 0.50, 0.25, 0.00, 0.00, 0.05, 0.00, 0.10, 0.00],  # JavaScript
    [0.05, 0.70, 0.10, 0.00, 0.00, 0.05, 0.00, 0.10, 0.00],  # React
    [0.10, 0.20, 0.50, 0.00, 0.00, 0.10, 0.05, 0.05, 0.00],  # NodeJS
    [0.05, 0.10, 0.50, 0.20, 0.00, 0.10, 0.05, 0.00, 0.00],  # MongoDB
    [0.10, 0.00, 0.45, 0.35, 0.00, 0.05, 0.05, 0.00, 0.00],  # MySQL
    [0.20, 0.15, 0.20, 0.05, 0.10, 0.15, 0.05, 0.10, 0.00],  # Git
    [0.15, 0.15, 0.20, 0.05, 0.10, 0.15, 0.05, 0.15, 0.00],  # GitHub
    [0.05, 0.00, 0.20, 0.05, 0.05, 0.45, 0.15, 0.05, 0.00],  # AWS
    [0.05, 0.00, 0.20, 0.05, 0.05, 0.45, 0.15, 0.05, 0.00],  # Azure
    [0.05, 0.00, 0.25, 0.00, 0.05, 0.40, 0.15, 0.10, 0.00],  # Docker
    [0.15, 0.00, 0.20, 0.00, 0.05, 0.25, 0.30, 0.05, 0.00],  # Linux
    [0.15, 0.00, 0.05, 0.25, 0.50, 0.05, 0.00, 0.00, 0.00],  # Machine Learning
    [0.15, 0.00, 0.00, 0.15, 0.65, 0.05, 0.00, 0.00, 0.00],  # Deep Learning
    [0.00, 0.05, 0.05, 0.65, 0.10, 0.00, 0.00, 0.05, 0.10],  # Power BI
    [0.00, 0.00, 0.05, 0.65, 0.05, 0.00, 0.00, 0.05, 0.20],  # Excel
    [0.20, 0.00, 0.00, 0.30, 0.45, 0.00, 0.00, 0.05, 0.00],  # Statistics
    [0.05, 0.05, 0.05, 0.10, 0.05, 0.05, 0.05, 0.10, 0.50],  # Communication
    [0.40, 0.05, 0.15, 0.10, 0.15, 0.05, 0.05, 0.05, 0.00],  # Problem Solving
    [0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.60],  # Leadership
    [0.05, 0.10, 0.10, 0.05, 0.05, 0.05, 0.05, 0.15, 0.40],  # Teamwork
    [0.35, 0.05, 0.10, 0.15, 0.15, 0.05, 0.05, 0.10, 0.00],  # Aptitude
], dtype=np.float64)

# 8 x 9 Interest Utility Matrix V_interest
V_INTEREST: np.ndarray = np.array([
    [0.10, 0.55, 0.35, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00],  # Web Development
    [0.15, 0.00, 0.00, 0.45, 0.40, 0.00, 0.00, 0.00, 0.00],  # Data Science
    [0.00, 0.00, 0.15, 0.00, 0.00, 0.60, 0.25, 0.00, 0.00],  # Cloud Computing
    [0.15, 0.00, 0.00, 0.00, 0.00, 0.20, 0.65, 0.00, 0.00],  # Cybersecurity
    [0.30, 0.45, 0.25, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00],  # Mobile Development
    [0.20, 0.00, 0.00, 0.15, 0.65, 0.00, 0.00, 0.00, 0.00],  # AI/ML
    [0.00, 0.00, 0.25, 0.00, 0.00, 0.45, 0.30, 0.00, 0.00],  # DevOps
    [0.10, 0.00, 0.00, 0.50, 0.00, 0.00, 0.00, 0.00, 0.40],  # Business Analytics
], dtype=np.float64)

# 10 x 9 Domain Utility Matrix V_domain
V_DOMAIN: np.ndarray = np.array([
    [0.15, 0.75, 0.00, 0.00, 0.00, 0.00, 0.00, 0.10, 0.00],  # Frontend
    [0.20, 0.00, 0.65, 0.00, 0.00, 0.15, 0.00, 0.00, 0.00],  # Backend
    [0.15, 0.40, 0.45, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00],  # Full Stack
    [0.15, 0.00, 0.00, 0.70, 0.00, 0.00, 0.00, 0.00, 0.15],  # Data & Analytics
    [0.20, 0.00, 0.00, 0.10, 0.70, 0.00, 0.00, 0.00, 0.00],  # Machine Learning
    [0.00, 0.00, 0.15, 0.00, 0.00, 0.55, 0.30, 0.00, 0.00],  # Cloud & DevOps
    [0.15, 0.00, 0.00, 0.00, 0.00, 0.15, 0.70, 0.00, 0.00],  # Security
    [0.35, 0.40, 0.25, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00],  # Mobile
    [0.20, 0.00, 0.15, 0.00, 0.00, 0.00, 0.00, 0.65, 0.00],  # QA & Testing
    [0.10, 0.00, 0.00, 0.30, 0.00, 0.00, 0.00, 0.00, 0.60],  # Business
], dtype=np.float64)

# 14 x 4 Academic Evaluation Matrix V_acad (CGPA, Projects, Internships, Certifications)
V_ACAD: np.ndarray = np.array([
    [0.25, 0.20, 0.15, 0.10],  # AI Engineer
    [0.10, 0.30, 0.25, 0.10],  # Backend Developer
    [0.20, 0.10, 0.20, 0.20],  # Business Analyst
    [0.10, 0.15, 0.20, 0.35],  # Cloud Engineer
    [0.15, 0.15, 0.20, 0.35],  # Cybersecurity Analyst
    [0.15, 0.20, 0.20, 0.20],  # Data Analyst
    [0.30, 0.25, 0.20, 0.10],  # Data Scientist
    [0.10, 0.25, 0.20, 0.30],  # DevOps Engineer
    [0.10, 0.35, 0.25, 0.05],  # Frontend Developer
    [0.10, 0.35, 0.25, 0.10],  # Full Stack Developer
    [0.25, 0.25, 0.20, 0.10],  # ML Engineer
    [0.10, 0.35, 0.25, 0.05],  # Mobile App Developer
    [0.10, 0.20, 0.20, 0.25],  # QA Engineer
    [0.25, 0.30, 0.25, 0.10],  # Software Engineer
], dtype=np.float64)

# 14 x 27 Market Skill Evaluation Matrix W
W_MATRIX: np.ndarray = np.array([
    # AI Eng
    [0.85, 0.35, 0.65, 0.45, 0.05, 0.05, 0.15, 0.10, 0.15, 0.20, 0.30, 0.65, 0.60, 0.45, 0.40, 0.55, 0.60, 0.95, 0.95, 0.10, 0.10, 0.75, 0.45, 0.85, 0.40, 0.55, 0.75],
    # Backend Dev
    [0.65, 0.85, 0.55, 0.80, 0.30, 0.20, 0.60, 0.25, 0.85, 0.80, 0.85, 0.70, 0.65, 0.55, 0.50, 0.70, 0.75, 0.20, 0.10, 0.10, 0.10, 0.25, 0.50, 0.80, 0.45, 0.65, 0.70],
    # Business Analyst
    [0.15, 0.05, 0.00, 0.70, 0.20, 0.15, 0.10, 0.05, 0.05, 0.10, 0.50, 0.25, 0.20, 0.15, 0.20, 0.10, 0.10, 0.25, 0.10, 0.90, 0.95, 0.65, 0.90, 0.75, 0.75, 0.75, 0.65],
    # Cloud Eng
    [0.35, 0.30, 0.20, 0.35, 0.05, 0.05, 0.20, 0.10, 0.30, 0.25, 0.30, 0.65, 0.60, 0.95, 0.90, 0.85, 0.85, 0.15, 0.10, 0.05, 0.05, 0.15, 0.45, 0.70, 0.45, 0.60, 0.60],
    # Cybersecurity Analyst
    [0.45, 0.35, 0.45, 0.30, 0.05, 0.05, 0.15, 0.05, 0.15, 0.10, 0.25, 0.55, 0.50, 0.65, 0.60, 0.65, 0.90, 0.25, 0.20, 0.10, 0.10, 0.30, 0.50, 0.85, 0.45, 0.55, 0.70],
    # Data Analyst
    [0.50, 0.10, 0.05, 0.90, 0.15, 0.10, 0.15, 0.05, 0.10, 0.30, 0.75, 0.40, 0.35, 0.20, 0.25, 0.15, 0.20, 0.50, 0.25, 0.90, 0.85, 0.80, 0.75, 0.70, 0.50, 0.65, 0.65],
    # Data Scientist
    [0.85, 0.30, 0.35, 0.80, 0.10, 0.05, 0.20, 0.10, 0.15, 0.35, 0.60, 0.60, 0.55, 0.45, 0.40, 0.50, 0.55, 0.90, 0.80, 0.55, 0.50, 0.90, 0.60, 0.80, 0.45, 0.60, 0.75],
    # DevOps Eng
    [0.50, 0.35, 0.20, 0.35, 0.10, 0.05, 0.25, 0.10, 0.35, 0.25, 0.35, 0.80, 0.75, 0.85, 0.80, 0.95, 0.90, 0.15, 0.10, 0.05, 0.05, 0.15, 0.55, 0.75, 0.50, 0.65, 0.65],
    # Frontend Dev
    [0.05, 0.10, 0.00, 0.15, 0.95, 0.95, 0.95, 0.95, 0.45, 0.30, 0.20, 0.65, 0.60, 0.15, 0.15, 0.15, 0.20, 0.05, 0.00, 0.05, 0.05, 0.05, 0.55, 0.70, 0.40, 0.65, 0.60],
    # Full Stack Dev
    [0.40, 0.60, 0.25, 0.75, 0.80, 0.75, 0.90, 0.85, 0.85, 0.80, 0.80, 0.80, 0.75, 0.55, 0.50, 0.65, 0.60, 0.20, 0.10, 0.10, 0.10, 0.20, 0.60, 0.80, 0.50, 0.70, 0.70],
    # ML Eng
    [0.85, 0.40, 0.60, 0.50, 0.05, 0.05, 0.20, 0.10, 0.20, 0.25, 0.35, 0.70, 0.65, 0.55, 0.50, 0.70, 0.65, 0.95, 0.90, 0.15, 0.10, 0.75, 0.45, 0.85, 0.40, 0.55, 0.75],
    # Mobile App Dev
    [0.10, 0.55, 0.40, 0.25, 0.55, 0.50, 0.70, 0.65, 0.45, 0.45, 0.35, 0.65, 0.60, 0.25, 0.20, 0.25, 0.35, 0.10, 0.05, 0.05, 0.05, 0.10, 0.50, 0.70, 0.40, 0.60, 0.65],
    # QA Eng
    [0.35, 0.55, 0.35, 0.45, 0.45, 0.40, 0.50, 0.40, 0.35, 0.30, 0.45, 0.70, 0.65, 0.35, 0.35, 0.50, 0.50, 0.15, 0.05, 0.10, 0.15, 0.25, 0.65, 0.75, 0.45, 0.70, 0.65],
    # Software Engineer
    [0.70, 0.85, 0.85, 0.70, 0.35, 0.25, 0.65, 0.40, 0.60, 0.50, 0.70, 0.75, 0.70, 0.50, 0.45, 0.65, 0.75, 0.45, 0.35, 0.15, 0.15, 0.45, 0.55, 0.85, 0.50, 0.70, 0.75],
], dtype=np.float64)

AFFINITY_INTERESTS: dict[str, list[str]] = {
    "AI Engineer": ["AI/ML", "Data Science"],
    "Backend Developer": ["Web Development", "Cloud Computing", "DevOps"],
    "Business Analyst": ["Business Analytics", "Data Science"],
    "Cloud Engineer": ["Cloud Computing", "DevOps", "Cybersecurity"],
    "Cybersecurity Analyst": ["Cybersecurity", "Cloud Computing"],
    "Data Analyst": ["Data Science", "Business Analytics"],
    "Data Scientist": ["Data Science", "AI/ML", "Business Analytics"],
    "DevOps Engineer": ["DevOps", "Cloud Computing"],
    "Frontend Developer": ["Web Development", "Mobile Development"],
    "Full Stack Developer": ["Web Development", "Cloud Computing"],
    "ML Engineer": ["AI/ML", "Data Science", "DevOps"],
    "Mobile App Developer": ["Mobile Development", "Web Development"],
    "QA Engineer": ["Web Development", "DevOps"],
    "Software Engineer": ["Web Development", "Cloud Computing", "AI/ML"],
}

AFFINITY_DOMAINS: dict[str, list[str]] = {
    "AI Engineer": ["Machine Learning", "Data & Analytics"],
    "Backend Developer": ["Backend", "Full Stack", "Cloud & DevOps"],
    "Business Analyst": ["Business", "Data & Analytics"],
    "Cloud Engineer": ["Cloud & DevOps", "Security", "Backend"],
    "Cybersecurity Analyst": ["Security", "Cloud & DevOps"],
    "Data Analyst": ["Data & Analytics", "Business"],
    "Data Scientist": ["Data & Analytics", "Machine Learning"],
    "DevOps Engineer": ["Cloud & DevOps", "Backend"],
    "Frontend Developer": ["Frontend", "Full Stack", "Mobile"],
    "Full Stack Developer": ["Full Stack", "Frontend", "Backend"],
    "ML Engineer": ["Machine Learning", "Data & Analytics", "Cloud & DevOps"],
    "Mobile App Developer": ["Mobile", "Frontend"],
    "QA Engineer": ["QA & Testing", "Full Stack"],
    "Software Engineer": ["Backend", "Full Stack", "Cloud & DevOps"],
}

# Calibrated Base Intercepts alpha^* (derived deterministically to target p = 1/14)
CALIBRATED_INTERCEPTS: dict[str, float] = {
    "AI Engineer": 0.0097,
    "Backend Developer": -1.0775,
    "Business Analyst": 1.1502,
    "Cloud Engineer": 0.5892,
    "Cybersecurity Analyst": 0.8740,
    "Data Analyst": 0.4495,
    "Data Scientist": -0.7231,
    "DevOps Engineer": 0.3113,
    "Frontend Developer": 0.8762,
    "Full Stack Developer": -1.6337,
    "ML Engineer": -0.4836,
    "Mobile App Developer": 0.7993,
    "QA Engineer": 0.3525,
    "Software Engineer": -1.4938,
}

ALPHA_VECTOR: np.ndarray = np.array([CALIBRATED_INTERCEPTS[c] for c in CAREER_CLASSES], dtype=np.float64)

# Mathematical Helper
def sigmoid(x: np.ndarray | float) -> np.ndarray | float:
    return 1.0 / (1.0 + np.exp(-x))


# ---------------------------------------------------------------------------
# Pre-generation Structural Validation
# ---------------------------------------------------------------------------

def validate_parameters() -> None:
    """Verify matrix dimensions, normalization, and bounds before generation."""
    assert L_MATRIX.shape == (27, 9), f"L_MATRIX shape mismatch: {L_MATRIX.shape}"
    row_sums = np.sum(L_MATRIX, axis=1)
    assert np.allclose(row_sums, 1.0, atol=1e-5), f"L_MATRIX row sums != 1.0: {row_sums}"
    assert V_INTEREST.shape == (8, 9), f"V_INTEREST shape mismatch: {V_INTEREST.shape}"
    assert V_DOMAIN.shape == (10, 9), f"V_DOMAIN shape mismatch: {V_DOMAIN.shape}"
    assert W_MATRIX.shape == (14, 27), f"W_MATRIX shape mismatch: {W_MATRIX.shape}"
    assert V_ACAD.shape == (14, 4), f"V_ACAD shape mismatch: {V_ACAD.shape}"
    assert len(CAREER_CLASSES) == 14, f"Career class count != 14: {len(CAREER_CLASSES)}"
    assert len(ALL_SKILLS) == 27, f"Total skill count != 27: {len(ALL_SKILLS)}"
    assert len(CALIBRATED_INTERCEPTS) == 14, f"Intercept count != 14"
    logger.info("Pre-generation parameter matrix verification passed (all dimensions & row sums verified).")


# ---------------------------------------------------------------------------
# Core Bottom-Up Generator
# ---------------------------------------------------------------------------

def generate_dataset(
    n_students: int = N_STUDENTS,
    seed: int = RANDOM_SEED,
    temperature: float = 1.35,
    path: Path = DATASET_PATH,
    career_path: Path = CAREER_DATASET_PATH,
    config_path: Path = GENERATOR_CONFIG_PATH,
) -> pd.DataFrame:
    """Generate n_students realistic records using the bottom-up latent-variable architecture."""
    validate_parameters()
    logger.info(f"Generating bottom-up synthetic dataset: {n_students} rows (seed={seed}, T={temperature})")

    rng = np.random.default_rng(seed)
    py_rng = random.Random(seed)

    alpha_dirichlet = np.full(9, 0.75, dtype=np.float64)
    rows: list[dict[str, Any]] = []

    for idx in range(n_students):
        # 1. Latent Student State (Generator-internal only)
        theta = float(rng.normal(0.0, 1.0))
        w = rng.dirichlet(alpha_dirichlet)
        # Bounded continuous latent competencies z in (0, 1) without hard clipping
        z = sigmoid(np.log(9.0 * w) + 0.40 * theta)

        # 2. Observable Skill Vector (22 tech + 5 soft)
        eps_tech = rng.normal(0.0, 7.0, size=22)
        eps_soft = rng.normal(0.0, 8.5, size=5)
        eps = np.concatenate([eps_tech, eps_soft])

        raw_skills = 20.0 + 5.0 * theta + 65.0 * (L_MATRIX @ z) + eps
        skills = np.clip(np.round(raw_skills, 1), 0.0, 100.0)

        # 3. Academic & Experience Features
        eta_cgpa = float(rng.normal(0.0, 0.65))
        cgpa = float(np.clip(round(7.35 + 0.35 * theta + eta_cgpa, 2), 5.50, 10.00))

        lam_proj = max(1.5, 3.5 + 0.70 * theta + 1.20 * (z[1] + z[2] + z[4]))
        projects = int(np.clip(rng.poisson(lam_proj), 0, 15))

        p_intern = float(sigmoid(-0.40 + 0.40 * theta + 0.35 * z[8]))
        internships = int(rng.binomial(3, p_intern))

        lam_cert = max(0.8, 1.8 + 0.45 * theta + 1.10 * (z[5] + z[6]))
        certs = int(np.clip(rng.poisson(lam_cert), 0, 10))

        # 4. Explored Student Preferences (Conditioned on z, NOT on career label)
        delta_int = rng.gumbel(0.0, 0.50, size=8)
        u_int = (3.5 * (V_INTEREST @ z) + delta_int) / 1.20
        e_int = np.exp(u_int - np.max(u_int))
        p_int = (1.0 - 0.30) * (e_int / np.sum(e_int)) + 0.30 / 8.0
        p_int = p_int / np.sum(p_int)
        interest = INTEREST_OPTIONS[rng.choice(8, p=p_int)]

        delta_dom = rng.gumbel(0.0, 0.50, size=10)
        u_dom = (3.5 * (V_DOMAIN @ z) + delta_dom) / 1.20
        e_dom = np.exp(u_dom - np.max(u_dom))
        p_dom = (1.0 - 0.30) * (e_dom / np.sum(e_dom)) + 0.30 / 10.0
        p_dom = p_dom / np.sum(p_dom)
        domain = DOMAIN_OPTIONS[rng.choice(10, p=p_dom)]

        # 5. Career Suitability Scoring (Evaluated on observed profile)
        x_norm = skills / 100.0
        acad_norm = np.array([
            (cgpa - 7.35) / 0.80,
            (projects - 4.0) / 2.5,
            (internships - 1.0) / 1.0,
            (certs - 2.0) / 1.5,
        ], dtype=np.float64)

        skill_fit = W_MATRIX @ x_norm
        acad_fit = V_ACAD @ acad_norm

        pref_fit = np.zeros(14, dtype=np.float64)
        for c_idx, c_name in enumerate(CAREER_CLASSES):
            i_m = 1.0 if interest in AFFINITY_INTERESTS[c_name] else 0.0
            d_m = 1.0 if domain in AFFINITY_DOMAINS[c_name] else 0.0
            pref_fit[c_idx] = 0.50 * i_m + 0.60 * d_m

        # Stochastic shock xi ~ Gumbel(0, 0.45)
        xi = rng.gumbel(0.0, 0.45, size=14)
        S = ALPHA_VECTOR + skill_fit + acad_fit + pref_fit + xi

        # 6. Softmax Probabilities and Categorical Career Draw (Exactly 1 draw, no quotas)
        scaled_S = S / temperature
        exp_s = np.exp(scaled_S - np.max(scaled_S))
        P = exp_s / np.sum(exp_s)
        career_idx = rng.choice(14, p=P)
        career_label = CAREER_CLASSES[career_idx]

        # 7. Assemble Record with STRICT observable feature set
        row: dict[str, Any] = {}
        for s_idx, s_name in enumerate(ALL_SKILLS):
            row[s_name] = skills[s_idx]
        row["CGPA"] = cgpa
        row["Projects Completed"] = projects
        row["Internship"] = internships
        row["Certifications"] = certs
        row["Interest"] = interest
        row["Preferred Domain"] = domain
        row["career_label"] = career_label

        rows.append(row)

    df = pd.DataFrame(rows)

    # Post-generation Integrity Verification
    assert df.shape == (n_students, 34), f"Dataset shape mismatch: {df.shape}"
    assert df.isnull().sum().sum() == 0, "Generated dataset contains null values"
    assert set(df["career_label"].unique()) == set(CAREER_CLASSES), "Career class set mismatch"
    assert df["CGPA"].between(5.50, 10.00).all(), "CGPA range violation"
    assert df["Projects Completed"].between(0, 15).all(), "Projects range violation"
    assert df["Internship"].between(0, 3).all(), "Internship range violation"
    assert df["Certifications"].between(0, 10).all(), "Certifications range violation"

    # Deterministic sorting before saving
    df = df.sort_values(by=["career_label", "CGPA", "Python", "SQL"]).reset_index(drop=True)
    df.index.name = "student_id"

    # Save dataset to primary and canonical paths
    path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(path)
    if career_path != path:
        career_path.parent.mkdir(parents=True, exist_ok=True)
        df.to_csv(career_path)

    logger.info(f"Dataset successfully generated and saved to: {path} and {career_path}")

    # Save generator configuration / manifest
    config_manifest = {
        "generator_version": GENERATOR_VERSION,
        "seed": seed,
        "n_students": n_students,
        "temperature_career": temperature,
        "latent_dimensions": 9,
        "dirichlet_alpha": list(alpha_dirichlet),
        "observable_feature_count": 33,
        "career_class_count": 14,
        "calibrated_intercepts": CALIBRATED_INTERCEPTS,
        "career_classes": CAREER_CLASSES,
        "technical_skills": TECHNICAL_SKILLS,
        "soft_skills": SOFT_SKILLS,
        "profile_features": PROFILE_FEATURES,
        "interest_options": INTEREST_OPTIONS,
        "domain_options": DOMAIN_OPTIONS,
        "skill_loading_matrix_L": L_MATRIX.tolist(),
        "interest_matrix_V": V_INTEREST.tolist(),
        "domain_matrix_V": V_DOMAIN.tolist(),
        "career_market_matrix_W": W_MATRIX.tolist(),
        "academic_matrix_V_acad": V_ACAD.tolist(),
    }

    config_path.parent.mkdir(parents=True, exist_ok=True)
    with config_path.open("w", encoding="utf-8") as f:
        json.dump(config_manifest, f, indent=2)
    logger.info(f"Generator configuration manifest written to: {config_path}")

    return df


if __name__ == "__main__":
    generate_dataset()
