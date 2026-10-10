"""Pilot calibration script for CareerCompass AI synthetic data generator.
Determines exact calibrated career intercepts alpha^* and evaluates softmax temperature calibration.
"""

import sys
import json
import numpy as np
import pandas as pd
from pathlib import Path

# Mathematical functions
def sigmoid(x):
    return 1.0 / (1.0 + np.exp(-x))

CAREER_CLASSES = [
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
    "Software Engineer"
]

TECHNICAL_SKILLS = [
    "Python", "Java", "C++", "SQL", "HTML", "CSS", "JavaScript",
    "React", "NodeJS", "MongoDB", "MySQL", "Git", "GitHub",
    "AWS", "Azure", "Docker", "Linux",
    "Machine Learning", "Deep Learning",
    "Power BI", "Excel", "Statistics"
]

SOFT_SKILLS = [
    "Communication", "Problem Solving", "Leadership",
    "Teamwork", "Aptitude"
]

ALL_SKILLS = TECHNICAL_SKILLS + SOFT_SKILLS

INTEREST_OPTIONS = [
    "Web Development", "Data Science", "Cloud Computing",
    "Cybersecurity", "Mobile Development", "AI/ML",
    "DevOps", "Business Analytics"
]

DOMAIN_OPTIONS = [
    "Frontend", "Backend", "Full Stack", "Data & Analytics",
    "Machine Learning", "Cloud & DevOps", "Security",
    "Mobile", "QA & Testing", "Business"
]

# Complete 27 x 9 Loading Matrix L
L_MATRIX = np.array([
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

# Complete 8 x 9 Interest Matrix
V_INTEREST = np.array([
    [0.10, 0.55, 0.35, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00],  # Web Development
    [0.15, 0.00, 0.00, 0.45, 0.40, 0.00, 0.00, 0.00, 0.00],  # Data Science
    [0.00, 0.00, 0.15, 0.00, 0.00, 0.60, 0.25, 0.00, 0.00],  # Cloud Computing
    [0.15, 0.00, 0.00, 0.00, 0.00, 0.20, 0.65, 0.00, 0.00],  # Cybersecurity
    [0.30, 0.45, 0.25, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00],  # Mobile Development
    [0.20, 0.00, 0.00, 0.15, 0.65, 0.00, 0.00, 0.00, 0.00],  # AI/ML
    [0.00, 0.00, 0.25, 0.00, 0.00, 0.45, 0.30, 0.00, 0.00],  # DevOps
    [0.10, 0.00, 0.00, 0.50, 0.00, 0.00, 0.00, 0.00, 0.40],  # Business Analytics
], dtype=np.float64)

# Complete 10 x 9 Domain Matrix
V_DOMAIN = np.array([
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

# Complete 14 x 4 Academic Weight Matrix (CGPA, Projects, Internships, Certs)
V_ACAD = np.array([
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

# Complete 14 x 27 Market Skill Evaluation Matrix W
W_MATRIX = np.array([
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

AFFINITY_INTERESTS = {
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

AFFINITY_DOMAINS = {
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


def sample_pilot_profiles(n=3000, seed=42):
    rng = np.random.default_rng(seed)
    alpha = np.full(9, 0.75)
    
    profiles = []
    for _ in range(n):
        theta = float(rng.normal(0.0, 1.0))
        w = rng.dirichlet(alpha)
        # Latent z
        z = sigmoid(np.log(9.0 * w) + 0.40 * theta)
        
        # Skills
        eps_tech = rng.normal(0.0, 7.0, size=22)
        eps_soft = rng.normal(0.0, 8.5, size=5)
        eps = np.concatenate([eps_tech, eps_soft])
        
        x_skills = np.clip(20.0 + 5.0 * theta + 65.0 * (L_MATRIX @ z) + eps, 0.0, 100.0)
        
        # Academic
        eta_cgpa = float(rng.normal(0.0, 0.65))
        cgpa = float(np.clip(round(7.35 + 0.35 * theta + eta_cgpa, 2), 5.50, 10.00))
        
        lam_proj = max(1.5, 3.5 + 0.70 * theta + 1.20 * (z[1] + z[2] + z[4]))
        projects = int(np.clip(rng.poisson(lam_proj), 0, 15))
        
        p_intern = float(sigmoid(-0.40 + 0.40 * theta + 0.35 * z[8]))
        internships = int(rng.binomial(3, p_intern))
        
        lam_cert = max(0.8, 1.8 + 0.45 * theta + 1.10 * (z[5] + z[6]))
        certs = int(np.clip(rng.poisson(lam_cert), 0, 10))
        
        # Preferences
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
        
        profiles.append({
            "theta": theta,
            "z": z,
            "skills": x_skills,
            "cgpa": cgpa,
            "projects": projects,
            "internships": internships,
            "certs": certs,
            "interest": interest,
            "domain": domain
        })
    return profiles


def compute_suitability_matrix(profiles, alpha_vec):
    """Compute N x 14 suitability score matrix without Gumbel shocks for calibration."""
    n = len(profiles)
    S = np.zeros((n, 14), dtype=np.float64)
    
    for i, p in enumerate(profiles):
        x_norm = p["skills"] / 100.0
        acad_norm = np.array([
            (p["cgpa"] - 7.35) / 0.80,
            (p["projects"] - 4.0) / 2.5,
            (p["internships"] - 1.0) / 1.0,
            (p["certs"] - 2.0) / 1.5,
        ], dtype=np.float64)
        
        # Skill fit: W @ x_norm
        skill_fit = W_MATRIX @ x_norm
        acad_fit = V_ACAD @ acad_norm
        
        pref_fit = np.zeros(14, dtype=np.float64)
        for c_idx, c_name in enumerate(CAREER_CLASSES):
            i_match = 1.0 if p["interest"] in AFFINITY_INTERESTS[c_name] else 0.0
            d_match = 1.0 if p["domain"] in AFFINITY_DOMAINS[c_name] else 0.0
            pref_fit[c_idx] = 0.50 * i_match + 0.60 * d_match
            
        S[i] = alpha_vec + skill_fit + acad_fit + pref_fit
    return S


def calibrate_intercepts(profiles, temperature=1.35, max_iter=60, tol=0.002):
    """Calibrate alpha^* using Robbins-Monro / fixed-point iteration to match target 1/14."""
    alpha = np.zeros(14, dtype=np.float64)
    p_target = 1.0 / 14.0
    
    print(f"Starting intercept calibration on {len(profiles)} pilot profiles (T={temperature})...")
    
    for it in range(max_iter):
        S = compute_suitability_matrix(profiles, alpha)
        # Softmax probabilities per profile
        scaled_S = S / temperature
        max_s = np.max(scaled_S, axis=1, keepdims=True)
        exp_s = np.exp(scaled_S - max_s)
        P = exp_s / np.sum(exp_s, axis=1, keepdims=True)
        
        # Marginal career probabilities
        p_c = np.mean(P, axis=0)
        max_diff = np.max(np.abs(p_c - p_target))
        
        if max_diff < tol:
            print(f"Converged at iteration {it+1}: max probability diff = {max_diff:.5f}")
            break
            
        # Update alpha: log-ratio adjustment
        step = 0.65
        log_diff = np.log(p_c + 1e-12) - np.log(p_target)
        alpha = alpha - step * temperature * log_diff
        # Center alpha
        alpha = alpha - np.mean(alpha)
        
    # Final verification
    S = compute_suitability_matrix(profiles, alpha)
    scaled_S = S / temperature
    max_s = np.max(scaled_S, axis=1, keepdims=True)
    exp_s = np.exp(scaled_S - max_s)
    P = exp_s / np.sum(exp_s, axis=1, keepdims=True)
    p_final = np.mean(P, axis=0)
    
    return alpha, p_final


def evaluate_temperature_and_hybrid(profiles, alpha, temperatures=[1.10, 1.25, 1.35, 1.50]):
    print("\n" + "=" * 80)
    print("EVALUATING SOFTMAX TEMPERATURE AND HYBRID PROFILE DISPERSION")
    print("=" * 80)
    
    for T in temperatures:
        S = compute_suitability_matrix(profiles, alpha)
        # Add Gumbel noise to simulate actual drawing
        rng = np.random.default_rng(42)
        gumbel_shocks = rng.gumbel(0.0, 0.45, size=S.shape)
        S_stochastic = S + gumbel_shocks
        
        scaled_S = S_stochastic / T
        max_s = np.max(scaled_S, axis=1, keepdims=True)
        exp_s = np.exp(scaled_S - max_s)
        P = exp_s / np.sum(exp_s, axis=1, keepdims=True)
        
        # Entropy
        eps = 1e-12
        H = -np.sum(P * np.log(P + eps), axis=1)
        H_norm = H / np.log(14.0)
        
        # Top 1 and Top 2
        sorted_P = np.sort(P, axis=1)[:, ::-1]
        top1 = sorted_P[:, 0]
        top2 = sorted_P[:, 1]
        ratio = top1 / (top2 + eps)
        
        pct_100 = np.mean(top1 > 0.95) * 100
        pct_90 = np.mean(top1 > 0.90) * 100
        
        print(f"\nTemperature T = {T:.2f}:")
        print(f"  Mean Top-1 Probability : {np.mean(top1)*100:.2f}% (Median: {np.median(top1)*100:.2f}%)")
        print(f"  Mean Top-2 Probability : {np.mean(top2)*100:.2f}%")
        print(f"  Top-1 / Top-2 Ratio    : {np.mean(ratio):.2f} (Median: {np.median(ratio):.2f})")
        print(f"  Normalized Entropy     : {np.mean(H_norm):.4f} (Median: {np.median(H_norm):.4f})")
        print(f"  Profiles with Top1 >95%: {pct_100:.2f}%")
        print(f"  Profiles with Top1 >90%: {pct_90:.2f}%")

    # Test explicit hybrid profiles
    print("\n--- TESTING EXPLICIT HYBRID IN-MEMORY PROFILES (T=1.35) ---")
    hybrids = [
        ("Frontend + Backend Hybrid", {
            "React": 85, "HTML": 85, "CSS": 85, "JavaScript": 88,
            "NodeJS": 85, "MongoDB": 80, "MySQL": 80, "SQL": 80,
            "Git": 80, "GitHub": 80, "Python": 60, "Java": 60,
            "Interest": "Web Development", "Domain": "Full Stack"
        }),
        ("Backend + Data Hybrid", {
            "Python": 88, "SQL": 88, "MySQL": 85, "MongoDB": 80, "NodeJS": 75,
            "Power BI": 75, "Excel": 80, "Statistics": 80, "Git": 80,
            "Interest": "Data Science", "Domain": "Data & Analytics"
        }),
        ("Backend + Cloud Hybrid", {
            "Python": 82, "Java": 80, "SQL": 80, "AWS": 85, "Azure": 80,
            "Docker": 88, "Linux": 88, "Git": 85, "GitHub": 85,
            "Interest": "Cloud Computing", "Domain": "Cloud & DevOps"
        }),
        ("Data + ML Hybrid", {
            "Python": 90, "Statistics": 88, "SQL": 85, "Machine Learning": 88,
            "Deep Learning": 80, "Power BI": 70, "Excel": 75, "Git": 80,
            "Interest": "AI/ML", "Domain": "Machine Learning"
        }),
        ("Cloud + DevOps Hybrid", {
            "AWS": 88, "Azure": 82, "Docker": 90, "Linux": 92, "Git": 88,
            "Python": 75, "SQL": 70, "MySQL": 70,
            "Interest": "DevOps", "Domain": "Cloud & DevOps"
        }),
        ("AI/ML + Software Engineering Hybrid", {
            "Python": 88, "C++": 85, "Java": 80, "Machine Learning": 85,
            "Deep Learning": 80, "Statistics": 80, "Linux": 78, "Git": 82,
            "Interest": "AI/ML", "Domain": "Machine Learning"
        }),
    ]
    
    T = 1.35
    for name, h in hybrids:
        x_vec = np.full(27, 40.0)
        for s_name, val in h.items():
            if s_name in ALL_SKILLS:
                idx = ALL_SKILLS.index(s_name)
                x_vec[idx] = float(val)
                
        acad_norm = np.array([0.0, 0.0, 0.0, 0.0])
        skill_fit = W_MATRIX @ (x_vec / 100.0)
        
        pref_fit = np.zeros(14)
        for c_idx, c_name in enumerate(CAREER_CLASSES):
            i_m = 1.0 if h["Interest"] in AFFINITY_INTERESTS[c_name] else 0.0
            d_m = 1.0 if h["Domain"] in AFFINITY_DOMAINS[c_name] else 0.0
            pref_fit[c_idx] = 0.50 * i_m + 0.60 * d_m
            
        S = alpha + skill_fit + pref_fit
        scaled_S = S / T
        exp_s = np.exp(scaled_S - np.max(scaled_S))
        P = exp_s / np.sum(exp_s)
        
        order = np.argsort(P)[::-1]
        top1_career = CAREER_CLASSES[order[0]]
        top2_career = CAREER_CLASSES[order[1]]
        top3_career = CAREER_CLASSES[order[2]]
        h_norm = -np.sum(P * np.log(P + 1e-12)) / np.log(14.0)
        
        print(f"\n  Hybrid: {name}")
        print(f"    1. {top1_career:<24}: {P[order[0]]*100:.2f}%")
        print(f"    2. {top2_career:<24}: {P[order[1]]*100:.2f}%")
        print(f"    3. {top3_career:<24}: {P[order[2]]*100:.2f}%")
        print(f"    Normalized Entropy: {h_norm:.4f}, Top1/Top2 Ratio: {P[order[0]]/(P[order[1]]+1e-9):.2f}")


if __name__ == "__main__":
    profiles = sample_pilot_profiles(n=5000, seed=42)
    alpha_calibrated, p_final = calibrate_intercepts(profiles, temperature=1.35, max_iter=60, tol=0.001)
    
    print("\n" + "=" * 80)
    print("FINAL CALIBRATED CAREER INTERCEPTS (alpha^*):")
    print("=" * 80)
    calibrated_dict = {}
    for c_name, a_val, p_val in zip(CAREER_CLASSES, alpha_calibrated, p_final):
        calibrated_dict[c_name] = round(float(a_val), 4)
        print(f"  \"{c_name}\": {a_val:>8.4f},  # Marginal Prob = {p_val*100:.2f}% (Target: 7.14%)")
        
    evaluate_temperature_and_hybrid(profiles, alpha_calibrated, temperatures=[1.20, 1.35, 1.50])
