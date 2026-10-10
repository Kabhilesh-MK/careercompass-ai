"""
CareerCompass — Feature Building & Label Normalization Module
Orchestrates primary label normalization, external transfer mapping,
and dataset partitioning across the three study datasets.
"""

from pathlib import Path
from typing import Dict, Any, Tuple, Optional
import pandas as pd
import numpy as np

from src.utils.reproducibility import get_base_dir, load_config
from src.features.skill_features import build_skill_vocabulary_report
from src.features.category_features import clean_categorical_dataframe


# Explicit 55-label normalization lookup for Divya Eldho dataset
PRIMARY_LABEL_MAPPING: Dict[str, Tuple[Optional[str], str]] = {
    "AI Engineer": (
        "AI & Machine Learning Engineering",
        "Direct machine learning, neural networks, and applied AI systems focus."
    ),
    "Data Scientist": (
        "AI & Machine Learning Engineering",
        "Machine learning modeling, scientific Python computing, and data inference."
    ),
    "Software Developer": (
        "Software Development & Engineering",
        "Application programming, web systems, and core software engineering."
    ),
    "Software Engineer": (
        "Software Development & Engineering",
        "Core computer science algorithms, systems programming, and software design."
    ),
    "Web Developer": (
        "Software Development & Engineering",
        "Frontend, backend, and full-stack web application development."
    ),
    "Data Analyst": (
        "Data Analytics & Business Intelligence",
        "Quantitative data analysis, SQL reporting, and business intelligence."
    ),
    "Business Analyst": (
        "Data Analytics & Business Intelligence",
        "Enterprise analytics, requirements engineering, and BI reporting."
    ),
    "Software Architect": (
        "Software Development & Engineering",
        "Software systems architecture, application frameworks, and senior software engineering (taxonomy correction from Database Engineering)."
    ),
    "System Analyst": (
        "Cloud, DevOps & Systems Engineering",
        "Systems analysis, enterprise computing environments, and infrastructure."
    ),
    # Discarded / Out-of-Scope Vocations (Documented explicitly)
    "Academic Coordinator": (None, "Academic administration outside IT/CS scope."),
    "Accountant": (None, "Corporate accounting and financial bookkeeping."),
    "Analyst": (None, "General physics and laboratory analysis lacking IT/CS focus."),
    "Animator": (None, "Visual animation and multimedia creative arts."),
    "Assistant Manager": (None, "General business commercial management."),
    "Auditor": (None, "Financial taxation and compliance auditing."),
    "AutoCAD Designer": (None, "Mechanical and civil drafting design."),
    "Civil Engineer": (None, "Traditional civil construction engineering."),
    "Clerk": (None, "General administrative and clerical office support."),
    "Consultant": (None, "Social science research and general consulting."),
    "Content Writer": (None, "Journalism, content creation, and copywriting."),
    "Customer Support Executive": (None, "Customer service and client helpline support."),
    "Data Entry Operator": (None, "Clerical data typing, not data engineering or analytics."),
    "Design Engineer": (None, "Hardware simulation and structural CAD engineering."),
    "Doctor": (None, "Clinical medicine and healthcare diagnosis."),
    "Editor": (None, "Publishing and editorial manuscript review."),
    "Electrical Engineer": (None, "Power systems and electrical hardware engineering."),
    "Energy Analyst": (None, "Renewable energy and power grid systems analysis."),
    "Fashion Designer": (None, "Apparel and textile fashion design."),
    "Finance Manager": (None, "Corporate financial portfolio management."),
    "Financial Analyst": (None, "Banking, investment, and equity financial analysis."),
    "General Practitioner": (None, "Primary healthcare and general medical practice."),
    "Graphic Designer": (None, "Visual design, illustration, and branding."),
    "HR Specialist": (None, "Human resources recruitment and employee relations."),
    "Journalist": (None, "News reporting and political journalism."),
    "Junior Assistant": (None, "Clerical office support and record keeping."),
    "Junior Engineer": (None, "Mechanical and electrical maintenance operations."),
    "Lab Technician": (None, "Natural sciences wet-laboratory technician work."),
    "Lecturer": (None, "Higher-education academic teaching."),
    "Manager": (None, "General operations and team personnel management."),
    "Marketing Executive": (None, "Brand marketing and advertising sales."),
    "Mechanical Engineer": (None, "Thermodynamics and mechanical machine engineering."),
    "Principal": (None, "Educational institution executive leadership."),
    "Professor": (None, "Academic university research and instruction."),
    "Receptionist": (None, "Front-desk administrative reception."),
    "Research Assistant": (None, "Biological laboratory research assistance."),
    "Research Scientist": (None, "Chemical and physical natural sciences research."),
    "Sales Assistant": (None, "Retail commercial sales support."),
    "Sales Executive": (None, "Commercial sales and client acquisition."),
    "School Coordinator": (None, "Secondary school student curriculum coordination."),
    "Senior Accountant": (None, "Advanced financial accounting and reporting."),
    "Surgeon": (None, "Medical operative surgery."),
    "Teacher": (None, "Primary and secondary school classroom instruction."),
    "Technician": (None, "Electrical wiring and hardware maintenance."),
    "Tutor": (None, "Private educational tutoring and instruction."),
    "Writer": (None, "Creative and literary book writing."),
}


def build_primary_features(df_raw: pd.DataFrame, config: Dict[str, Any] = None) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Cleans raw primary dataset (Divya Eldho):
    1. Purges Career_Description (Direct target leakage)
    2. Maps Recommended_Career to canonical_career_track using deterministic taxonomy
    3. Drops unmapped / out-of-scope non-technical vocations
    4. Cleans categorical features
    5. Generates reports/dataset_audit/primary_label_mapping.csv
    Returns: (cleaned_technical_df, mapping_report_df)
    """
    if config is None:
        config = load_config()

    target_col = config["primary_dataset"]["target_column"]
    canonical_col = config["primary_dataset"]["canonical_target_column"]
    excluded_cols = config["primary_dataset"]["excluded_columns"]

    # Generate mapping audit report table
    mapping_records = []
    observed_careers = sorted(df_raw[target_col].unique())
    for raw_career in observed_careers:
        if raw_career in PRIMARY_LABEL_MAPPING:
            canonical, reason = PRIMARY_LABEL_MAPPING[raw_career]
        else:
            canonical, reason = None, "Unknown raw label unmapped by taxonomy."

        status = "RETAINED" if canonical else "DISCARDED"
        mapping_records.append({
            "RAW LABEL": raw_career,
            "CANONICAL LABEL": canonical if canonical else "DISCARDED / OUT OF SCOPE",
            "STATUS": status,
            "MAPPING REASON": reason,
        })
    mapping_df = pd.DataFrame(mapping_records)

    # Apply mapping
    df = df_raw.copy()
    # Exclude leakage columns immediately
    for col in excluded_cols:
        if col in df.columns:
            df = df.drop(columns=[col])

    df[canonical_col] = df[target_col].map(lambda x: PRIMARY_LABEL_MAPPING.get(x, (None, ""))[0])

    # Filter strictly to retained technical records
    df_tech = df[df[canonical_col].notnull()].copy()

    # Clean categorical text columns
    cat_cols = config["primary_dataset"]["features"]["categorical"]
    df_tech = clean_categorical_dataframe(df_tech, cat_cols)

    # Reset index
    df_tech = df_tech.reset_index(drop=True)
    return df_tech, mapping_df


def classify_breejesh_title(raw_title: Any) -> Tuple[Optional[str], str]:
    """
    Deterministic rule-based mapping of Breejesh Dhar free-text job titles
    into the 5 canonical technical tracks.
    """
    if not isinstance(raw_title, str) or pd.isna(raw_title):
        return None, "Missing / Null survey response"

    t = raw_title.lower().strip()
    if t in [
        "na", "none", "nil", "null", "student (unemployed)", "unemployed", "student",
        "no", "not working", "fresher", "looking for job", "not yet", "not applicable",
        "seeking job", "still searching", "graduate", "job seeker", "waiting for job"
    ]:
        return None, "Unemployed / Non-outcome transition record"

    # AI & ML
    if any(k in t for k in ["ai ", "ai/", "artificial intelligence", "machine learning", "ml ", "ml/", "deep learning", "data scientist", "computer vision", "nlp"]):
        return "AI & Machine Learning Engineering", "AI/ML specialized engineering title"

    # Database & Data Engineering
    if any(k in t for k in ["data engineer", "database", "dba", "sql developer", "etl", "big data", "data warehousing", "database admin"]):
        return "Database & Data Engineering", "Data pipeline, ETL, and database administration title"

    # Cloud, DevOps & Systems
    if any(k in t for k in ["devops", "cloud", "system administrator", "sysadmin", "network engineer", "aws", "azure", "infrastructure", "site reliability", "sre", "systems engineer", "system engineer"]):
        return "Cloud, DevOps & Systems Engineering", "Cloud infrastructure, systems, or DevOps title"

    # Data Analytics & BI
    if any(k in t for k in ["data analyst", "business analyst", "bi analyst", "analytics", "tableau", "power bi", "reporting analyst", "data specialist"]):
        return "Data Analytics & Business Intelligence", "Analytics, reporting, and BI specialist title"

    # Software Engineering
    if any(k in t for k in ["software", "developer", "frontend", "backend", "full stack", "fullstack", "web", "programmer", "application", "android", "ios", "java", "python developer", "sde", "engineer", "associate engineer"]):
        # Discard non-IT engineering
        if any(non_it in t for non_it in ["mechanical", "civil", "chemical", "structural", "electrical", "biomedical", "production", "aeronautical", "textile"]):
            return None, "Non-IT traditional engineering discipline"
        return "Software Development & Engineering", "Software application programming and engineering title"

    return None, "Non-IT or unmapped occupational domain"


def build_external_features(df_raw: pd.DataFrame, config: Dict[str, Any] = None) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Cleans raw external dataset (Breejesh Dhar):
    1. Removes privacy identifiers, gender, and post-outcome employment status
    2. Normalizes first job title and maps to 5 canonical tracks
    3. Excludes unemployed, missing, and non-IT professions
    4. Generates reports/dataset_audit/external_label_mapping.csv
    Returns: (cleaned_external_df, mapping_report_df)
    """
    if config is None:
        config = load_config()

    target_col = config["external_dataset"]["target_column"]
    canonical_col = config["external_dataset"]["canonical_target_column"]
    drop_cols = config["external_dataset"]["drop_columns"]

    # Purge privacy/leakage columns
    df = df_raw.copy()
    for col in drop_cols:
        if col in df.columns:
            df = df.drop(columns=[col])

    # Classify all observed titles
    results = [classify_breejesh_title(t) for t in df[target_col]]
    df[canonical_col] = [r[0] for r in results]
    df["mapping_reason"] = [r[1] for r in results]

    # Generate external mapping report table
    mapping_summary = []
    vc = df[[target_col, canonical_col, "mapping_reason"]].value_counts(dropna=False).reset_index()
    for _, row in vc.iterrows():
        raw_val = str(row[target_col])
        canonical = row[canonical_col]
        reason = row["mapping_reason"]
        count = row["count"] if "count" in row else 1
        status = "RETAINED" if pd.notnull(canonical) else "DISCARDED"
        mapping_summary.append({
            "RAW TITLE": raw_val.strip() if pd.notnull(raw_val) else "NULL / MISSING",
            "CANONICAL TRACK": canonical if pd.notnull(canonical) else "DISCARDED / OUT OF SCOPE",
            "STATUS": status,
            "FREQUENCY": count,
            "MAPPING REASON": reason,
        })
    mapping_df = pd.DataFrame(mapping_summary).sort_values("FREQUENCY", ascending=False).reset_index(drop=True)

    # Filter to retained technical records
    df_retained = df[df[canonical_col].notnull()].copy()
    df_retained = df_retained.drop(columns=["mapping_reason"]).reset_index(drop=True)

    return df_retained, mapping_df


def build_riasec_features(df_raw: pd.DataFrame, config: Dict[str, Any] = None) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series]:
    """
    Prepares the RIASEC benchmark dataset into two feature configurations:
    - CONFIG A: Cognitive & Aptitude Baseline (Math, Science, Programming, Comm, Logic)
    - CONFIG B: Full Psychometric Inventory (Config A + 6 Holland RIASEC scores)
    Returns: (df_config_a, df_config_b, y_target)
    """
    if config is None:
        config = load_config()

    feat_a = config["riasec_dataset"]["config_a_features"]
    feat_b = config["riasec_dataset"]["config_b_features"]
    target_col = config["riasec_dataset"]["target_column"]

    df_a = df_raw[feat_a].copy()
    df_b = df_raw[feat_b].copy()
    y = df_raw[target_col].copy()

    return df_a, df_b, y
