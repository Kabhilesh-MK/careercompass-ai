"""
CareerCompass — Preprocessing Pipeline Module
Assembles scikit-learn compatible ColumnTransformer & MultiHot encoders.
Guarantees fitting strictly on training data with zero target leakage.
"""

from pathlib import Path
from typing import Dict, Any, List, Tuple
import json
import pandas as pd
import numpy as np
from sklearn.base import BaseEstimator, TransformerMixin

from src.utils.reproducibility import get_base_dir, load_config
from src.features.skill_features import MultiHotSkillEncoder
from src.features.category_features import build_categorical_pipeline


class PrimaryPreprocessor(BaseEstimator, TransformerMixin):
    """
    Unified preprocessor for Primary Technical Dataset:
    - Categorical features: SimpleImputer -> OneHotEncoder(handle_unknown='ignore')
    - Skills feature: MultiHotSkillEncoder fitted on training text
    - Excludes target column from any preprocessing transformations
    """

    def __init__(self, cat_cols: List[str] = None, skill_col: str = "Skills"):
        if cat_cols is None:
            cat_cols = ["Education_Level", "Specialization", "Interests"]
        self.cat_cols = cat_cols
        self.skill_col = skill_col

        self.cat_pipeline = build_categorical_pipeline(self.cat_cols)
        self.skill_encoder = MultiHotSkillEncoder(min_freq=1, prefix="skill_")

        self.cat_feature_names_: List[str] = []
        self.skill_feature_names_: List[str] = []
        self.all_feature_names_: List[str] = []
        self.is_fitted_: bool = False

    def fit(self, X: pd.DataFrame, y=None):
        """
        Fits preprocessor ONLY on training features.
        """
        # Fit categorical pipeline
        X_cat = X[self.cat_cols].copy()
        self.cat_pipeline.fit(X_cat)

        # Retrieve one-hot feature names
        onehot_encoder = self.cat_pipeline.named_steps["onehot"]
        self.cat_feature_names_ = onehot_encoder.get_feature_names_out(self.cat_cols).tolist()

        # Fit skill encoder
        X_skills = X[self.skill_col].copy()
        self.skill_encoder.fit(X_skills)
        self.skill_feature_names_ = self.skill_encoder.get_feature_names_out()

        self.all_feature_names_ = self.cat_feature_names_ + self.skill_feature_names_
        self.is_fitted_ = True
        return self

    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        """
        Transforms features into a unified numeric DataFrame.
        """
        if not self.is_fitted_:
            raise RuntimeError("PrimaryPreprocessor must be fitted before calling transform.")

        # Transform categorical
        X_cat = X[self.cat_cols].copy()
        cat_array = self.cat_pipeline.transform(X_cat)
        df_cat = pd.DataFrame(cat_array, columns=self.cat_feature_names_, index=X.index)

        # Transform skills
        X_skills = X[self.skill_col].copy()
        df_skills = self.skill_encoder.transform(X_skills)

        # Concatenate horizontally
        df_out = pd.concat([df_cat, df_skills], axis=1)
        return df_out

    def fit_transform(self, X: pd.DataFrame, y=None) -> pd.DataFrame:
        return self.fit(X, y).transform(X)

    def get_feature_names_out(self) -> List[str]:
        return self.all_feature_names_

    def get_metadata(self) -> Dict[str, Any]:
        """Returns serializable metadata about fitted preprocessor."""
        return {
            "is_fitted": self.is_fitted_,
            "n_features": len(self.all_feature_names_),
            "categorical_columns": self.cat_cols,
            "skill_column": self.skill_col,
            "cat_features_count": len(self.cat_feature_names_),
            "skill_features_count": len(self.skill_feature_names_),
            "cat_feature_names": self.cat_feature_names_,
            "skill_vocabulary": self.skill_encoder.vocabulary_,
            "all_feature_names": self.all_feature_names_,
        }
