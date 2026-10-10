"""
CareerCompass — Skill Normalization & Representation Module
Deterministic parsing, normalization, vocabulary building, and multi-hot encoding
for comma-separated and semicolon-separated skill fields.
"""

from typing import List, Set, Dict, Tuple
import re
import pandas as pd
import numpy as np


# Deterministic mapping for minor formatting / typo variations without inventing external skills
SKILL_SYNONYMS: Dict[str, str] = {
    "databases": "database_systems",
    "database design": "database_design",
    "web development": "web_development",
    "data analysis": "data_analysis",
    "machine learning": "machine_learning",
    "power analysis": "power_analysis",
    "critical thinking": "critical_thinking",
    "advanced excel": "advanced_excel",
    "design optimization": "design_optimization",
    "basic programming": "basic_programming",
    "basic accounting": "basic_accounting",
    "team management": "team_management",
    "basic computer": "basic_computer",
    "business analytics": "business_analytics",
    "scientific writing": "scientific_writing",
    "educational planning": "educational_planning",
    "assessment design": "assessment_design",
    "electrical wiring": "electrical_wiring",
    "student mentoring": "student_mentoring",
    "customer handling": "customer_handling",
    "customer service": "customer_service",
    "content writing": "content_writing",
    "data entry": "data_entry",
    "data collection": "data_collection",
    "public speaking": "public_speaking",
    "tax management": "tax_management",
    "tax filing": "tax_filing",
    "project work": "project_work",
    "lab work": "lab_work",
    "office work": "office_work",
}


def normalize_skill_token(token: str) -> str:
    """
    Normalizes a single skill token deterministically:
    - Lowercase
    - Strip whitespace and outer quotes
    - Remove superfluous punctuation
    - Apply canonical technical token formatting
    """
    if not isinstance(token, str):
        return ""
    t = token.lower().strip()
    # Remove surrounding quotes, brackets, or trailing dots
    t = re.sub(r"^[\"\'\[\(]+|[\"\'\]\)\.]+$", "", t).strip()
    if not t:
        return ""

    if t in SKILL_SYNONYMS:
        return SKILL_SYNONYMS[t]

    # Convert inner whitespace/hyphens to underscore for clean feature column naming
    t_clean = re.sub(r"[\s\-/]+", "_", t)
    return t_clean


def parse_skills_cell(cell_value: str, separators: str = ",;") -> List[str]:
    """
    Parses a delimited string of skills into unique, normalized skill tokens.
    """
    if not isinstance(cell_value, str) or not cell_value.strip():
        return []
    # Split on any comma or semicolon
    raw_tokens = re.split(rf"[{separators}]", cell_value)
    normalized = []
    for raw in raw_tokens:
        tok = normalize_skill_token(raw)
        if tok and tok not in normalized:
            normalized.append(tok)
    return normalized


def build_skill_vocabulary_report(df: pd.DataFrame, skill_col: str = "Skills") -> Tuple[List[str], pd.DataFrame]:
    """
    Analyzes all raw skill entries in a dataframe, records observed frequencies,
    and returns (vocabulary_list, report_df).
    Report DataFrame columns: ['raw_skill', 'normalized_skill', 'frequency']
    """
    raw_counter: Dict[str, int] = {}
    mapping_dict: Dict[str, str] = {}

    for val in df[skill_col].dropna():
        tokens = re.split(r"[,;]", str(val))
        for t in tokens:
            raw_t = t.strip()
            if not raw_t:
                continue
            raw_counter[raw_t] = raw_counter.get(raw_t, 0) + 1
            if raw_t not in mapping_dict:
                mapping_dict[raw_t] = normalize_skill_token(raw_t)

    records = []
    normalized_vocab = set()
    for raw_skill, freq in sorted(raw_counter.items(), key=lambda x: -x[1]):
        norm = mapping_dict[raw_skill]
        records.append({
            "raw_skill": raw_skill,
            "normalized_skill": norm,
            "frequency": freq,
        })
        normalized_vocab.add(norm)

    report_df = pd.DataFrame(records)
    vocab_list = sorted(list(normalized_vocab))
    return vocab_list, report_df


class MultiHotSkillEncoder:
    """
    Scikit-learn compatible Multi-Hot Binary Indicator Vectorizer for skills.
    Fit strictly on training data to prevent vocabulary or feature leakage.
    """

    def __init__(self, min_freq: int = 1, prefix: str = "skill_"):
        self.min_freq = min_freq
        self.prefix = prefix
        self.vocabulary_: List[str] = []
        self.feature_names_: List[str] = []

    def fit(self, X_series: pd.Series, y=None):
        """
        Learns the skill vocabulary from a pandas Series of delimited skill strings.
        """
        freq_dict: Dict[str, int] = {}
        for val in X_series.dropna():
            tokens = parse_skills_cell(val)
            for tok in tokens:
                freq_dict[tok] = freq_dict.get(tok, 0) + 1

        # Keep tokens meeting minimum frequency
        self.vocabulary_ = sorted([tok for tok, cnt in freq_dict.items() if cnt >= self.min_freq])
        self.feature_names_ = [f"{self.prefix}{tok}" for tok in self.vocabulary_]
        return self

    def transform(self, X_series: pd.Series) -> pd.DataFrame:
        """
        Transforms delimited skill strings into a binary indicator DataFrame.
        """
        rows = []
        vocab_set = set(self.vocabulary_)
        for val in X_series:
            tokens = set(parse_skills_cell(val))
            row = {f"{self.prefix}{tok}": (1 if tok in tokens else 0) for tok in self.vocabulary_}
            rows.append(row)

        return pd.DataFrame(rows, index=X_series.index)

    def fit_transform(self, X_series: pd.Series, y=None) -> pd.DataFrame:
        return self.fit(X_series, y).transform(X_series)

    def get_feature_names_out(self) -> List[str]:
        return self.feature_names_
