"""
ModelService — Singleton responsible for artifact loading, compatibility validation,
and inference execution for CareerCompass Phase 3.4.1 Random Forest model.
"""

from __future__ import annotations

import json
import os
import sys
import threading
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import joblib
import numpy as np
import pandas as pd
from loguru import logger

from app.config import settings
from app.utils.errors import (
    ModelArtifactError,
    ModelCompatibilityError,
    ModelNotReadyError,
)

EXPECTED_MODEL_FAMILY = "RandomForestClassifier"
EXPECTED_N_ESTIMATORS = 300
EXPECTED_CLASS_WEIGHT = None
EXPECTED_RANDOM_STATE = 42
EXPECTED_FEATURE_COUNT = 29
EXPECTED_FEATURE_CONFIG = "skills-only"


class ModelService:
    """Singleton service managing ML model lifecycle and deterministic inference."""

    _instance: Optional[ModelService] = None
    _lock: threading.Lock = threading.Lock()

    def __init__(self) -> None:
        self.model: Optional[Any] = None
        self.preprocessor: Optional[Any] = None
        self.metadata: Optional[Dict[str, Any]] = None
        self.classes_: List[str] = []
        self.canonical_vocabulary: List[str] = []
        self.explainer: Optional[Any] = None
        self.explanation_method: str = "none"
        self._is_loaded: bool = False
        self._load_lock: threading.Lock = threading.Lock()

    @classmethod
    def get_instance(cls) -> ModelService:
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = cls()
        return cls._instance

    @classmethod
    def reset_instance(cls) -> None:
        """Reset the singleton instance (primarily for isolated test fixtures)."""
        with cls._lock:
            cls._instance = None

    def is_ready(self) -> bool:
        """Check if all artifacts are loaded, validated, and ready for inference."""
        return (
            self._is_loaded
            and self.model is not None
            and self.preprocessor is not None
            and self.metadata is not None
            and len(self.canonical_vocabulary) == EXPECTED_FEATURE_COUNT
            and len(self.classes_) > 0
        )

    def load_artifacts(
        self,
        model_path: Optional[Path] = None,
        preprocessor_path: Optional[Path] = None,
        metadata_path: Optional[Path] = None,
        force_reload: bool = False,
    ) -> None:
        """
        Loads and validates model, preprocessor, and metadata artifacts once.
        Fails fast if artifacts are missing, corrupt, or incompatible.
        """
        with self._load_lock:
            if self._is_loaded and not force_reload:
                logger.debug("ModelService artifacts already loaded. Skipping reload.")
                return

            m_path = model_path or settings.ml_model_path
            p_path = preprocessor_path or settings.ml_preprocessor_path
            meta_path = metadata_path or settings.ml_metadata_path

            logger.info(f"Loading ML model artifacts from: {m_path.parent}")

            # 1. Verify file existence
            if not m_path.is_file():
                raise ModelArtifactError(f"Model artifact not found at: {m_path}")
            if not p_path.is_file():
                raise ModelArtifactError(f"Preprocessor artifact not found at: {p_path}")
            if not meta_path.is_file():
                raise ModelArtifactError(f"Metadata artifact not found at: {meta_path}")

            # Ensure ml/ directory is in sys.path so pickled custom transformer can resolve
            ml_dir = settings.project_root_path / "ml"
            if str(ml_dir) not in sys.path:
                sys.path.insert(0, str(ml_dir))

            # 2. Deserialization
            try:
                with open(meta_path, "r", encoding="utf-8") as f:
                    metadata = json.load(f)
            except Exception as exc:
                raise ModelArtifactError(f"Failed to parse metadata JSON at {meta_path}: {exc}") from exc

            try:
                preprocessor = joblib.load(p_path)
            except Exception as exc:
                raise ModelArtifactError(f"Failed to deserialize preprocessor at {p_path}: {exc}") from exc

            try:
                model = joblib.load(m_path)
            except Exception as exc:
                raise ModelArtifactError(f"Failed to deserialize model at {m_path}: {exc}") from exc

            # 3. Compatibility Validation
            self._validate_artifacts(model, preprocessor, metadata)

            # 4. Assign state
            self.model = model
            self.preprocessor = preprocessor
            self.metadata = metadata
            self.classes_ = list(model.classes_)
            # Authoritative canonical vocabulary directly from the fitted transformer
            raw_vocab = getattr(preprocessor.encoder, "vocabulary_", [])
            self.canonical_vocabulary = sorted(list(raw_vocab))

            # Initialize SHAP TreeExplainer for fast, deterministic local feature attribution
            try:
                import shap
                self.explainer = shap.TreeExplainer(self.model)
                self.explanation_method = "TreeExplainer"
                logger.info("Initialized SHAP TreeExplainer for Candidate H Random Forest.")
            except Exception as exc:
                logger.warning(
                    f"SHAP TreeExplainer initialization failed ({exc}). "
                    "Will utilize deterministic TreePathAttribution fallback."
                )
                self.explainer = None
                self.explanation_method = "TreePathAttribution"

            self._is_loaded = True

            logger.info(
                f"ModelService successfully initialized: {metadata.get('candidate_id', 'Model')} "
                f"({len(self.classes_)} classes, {len(self.canonical_vocabulary)} features, "
                f"explainer: {self.explanation_method})."
            )

    def _validate_artifacts(
        self,
        model: Any,
        preprocessor: Any,
        metadata: Dict[str, Any],
    ) -> None:
        """Enforces strict compatibility checks on loaded artifacts."""
        model_type = model.__class__.__name__
        if model_type != EXPECTED_MODEL_FAMILY:
            raise ModelCompatibilityError(
                f"Expected model family {EXPECTED_MODEL_FAMILY}, but received {model_type}."
            )

        n_estimators = getattr(model, "n_estimators", None)
        if n_estimators != EXPECTED_N_ESTIMATORS:
            raise ModelCompatibilityError(
                f"Expected n_estimators={EXPECTED_N_ESTIMATORS}, but got {n_estimators}."
            )

        class_weight = getattr(model, "class_weight", None)
        if class_weight != EXPECTED_CLASS_WEIGHT:
            raise ModelCompatibilityError(
                f"Expected class_weight={EXPECTED_CLASS_WEIGHT}, but got {class_weight}."
            )

        random_state = getattr(model, "random_state", None)
        if random_state != EXPECTED_RANDOM_STATE:
            raise ModelCompatibilityError(
                f"Expected random_state={EXPECTED_RANDOM_STATE}, but got {random_state}."
            )

        n_features = getattr(model, "n_features_in_", None)
        if n_features != EXPECTED_FEATURE_COUNT:
            raise ModelCompatibilityError(
                f"Expected {EXPECTED_FEATURE_COUNT} input features, but model expects {n_features}."
            )

        # Validate Preprocessor
        if not getattr(preprocessor, "is_fitted_", False):
            raise ModelCompatibilityError("Preprocessor artifact is not marked as fitted.")

        encoder = getattr(preprocessor, "encoder", None)
        if encoder is None or not hasattr(encoder, "vocabulary_"):
            raise ModelCompatibilityError("Preprocessor missing MultiHotSkillEncoder vocabulary.")

        prep_vocab_len = len(encoder.vocabulary_)
        if prep_vocab_len != EXPECTED_FEATURE_COUNT:
            raise ModelCompatibilityError(
                f"Preprocessor vocabulary length ({prep_vocab_len}) does not match expected {EXPECTED_FEATURE_COUNT}."
            )

        # Validate Feature configuration in metadata
        feature_cfg = metadata.get("feature_configuration", "").strip().lower()
        if feature_cfg != EXPECTED_FEATURE_CONFIG:
            raise ModelCompatibilityError(
                f"Expected feature configuration '{EXPECTED_FEATURE_CONFIG}', but metadata reports '{feature_cfg}'."
            )

        # Validate Classes
        model_classes = list(getattr(model, "classes_", []))
        meta_classes = metadata.get("class_labels", [])
        if model_classes != meta_classes:
            raise ModelCompatibilityError(
                f"Model classes {model_classes} do not match metadata class labels {meta_classes}."
            )

        if len(model_classes) != 4:
            raise ModelCompatibilityError(
                f"Expected exactly 4 career classes, got {len(model_classes)}: {model_classes}"
            )

    def get_canonical_vocabulary(self) -> List[str]:
        """Returns the canonical 29-skill vocabulary sorted deterministically."""
        if not self.is_ready():
            raise ModelNotReadyError()
        return list(self.canonical_vocabulary)

    def get_classes(self) -> List[str]:
        """Returns the career track classes as ordered by the serialized model."""
        if not self.is_ready():
            raise ModelNotReadyError()
        return list(self.classes_)

    def get_metadata(self) -> Dict[str, Any]:
        """Returns the loaded metadata dictionary."""
        if not self.is_ready():
            raise ModelNotReadyError()
        return dict(self.metadata)  # type: ignore

    def predict_proba(self, skills_delimited: str) -> Tuple[np.ndarray, List[str]]:
        """
        Executes inference for a single input record.
        Strictly transforms features and queries predict_proba without calling fit.
        """
        if not self.is_ready():
            raise ModelNotReadyError()

        # Build single-row DataFrame matching the training preprocessor interface
        df = pd.DataFrame({"Skills": [skills_delimited]})

        # Pure inference transform — no fitting
        feature_matrix = self.preprocessor.transform(df)

        # Model predict_proba
        probabilities = self.model.predict_proba(feature_matrix)[0]

        return probabilities, self.classes_

    def get_explanation_metadata(self) -> Dict[str, Any]:
        """Returns explainability availability and active algorithm."""
        if not self.is_ready():
            raise ModelNotReadyError()
        return {
            "available": True,
            "method": self.explanation_method if self.explanation_method != "none" else "TreeExplainer",
        }

    def explain_instance(
        self,
        skills_delimited: str,
        recognized_skills: List[str],
    ) -> Tuple[Dict[str, Any], str, List[Dict[str, Any]]]:
        """
        Computes local feature attribution for a single student profile toward the top predicted class.
        Utilizes SHAP TreeExplainer with fallback to deterministic tree-path probability decomposition.
        Strictly non-causal attribution over the canonical 29-skill vocabulary.
        Does not fit or modify model state.
        """
        if not self.is_ready():
            raise ModelNotReadyError()

        df = pd.DataFrame({"Skills": [skills_delimited]})
        feature_matrix = self.preprocessor.transform(df)

        probabilities = self.model.predict_proba(feature_matrix)[0]
        pred_idx = int(np.argmax(probabilities))
        top_track = self.classes_[pred_idx]
        top_prob = round(float(probabilities[pred_idx]), 4)

        prediction_detail = {
            "career_track": top_track,
            "probability": top_prob,
        }

        method_used = self.explanation_method
        class_shap = None

        # Primary: SHAP TreeExplainer
        if self.explainer is not None:
            try:
                vals = self.explainer.shap_values(feature_matrix)
                # For TreeExplainer on multi-class, vals is shape (1, 29, 4) or list of 4 arrays each (1, 29)
                if isinstance(vals, list):
                    class_shap = vals[pred_idx][0]
                elif len(vals.shape) == 3:
                    class_shap = vals[0, :, pred_idx]
                method_used = "TreeExplainer"
            except Exception as exc:
                logger.warning(
                    f"SHAP TreeExplainer execution failed ({exc}). Falling back to tree-path attribution."
                )
                class_shap = None

        # Fallback: Deterministic Tree Path Decomposition
        if class_shap is None:
            try:
                from src.analysis.local_explanations import compute_instance_tree_contributions
                x_vec = feature_matrix.iloc[0].values if hasattr(feature_matrix, "iloc") else np.array(feature_matrix)[0]
                _, contributions = compute_instance_tree_contributions(self.model, x_vec, self.classes_)
                class_shap = contributions[pred_idx]
                method_used = "TreePathAttribution"
            except Exception as exc:
                logger.error(f"Fallback TreePathAttribution failed: {exc}")
                class_shap = np.zeros(len(self.canonical_vocabulary), dtype=np.float64)
                method_used = "FallbackZeroAttribution"

        recognized_set = set(recognized_skills)
        features: List[Dict[str, Any]] = []

        for j, skill in enumerate(self.canonical_vocabulary):
            is_present = skill in recognized_set
            contrib = round(float(class_shap[j]), 4)
            if contrib > 0:
                direction = "supports"
            elif contrib < 0:
                direction = "opposes"
            else:
                direction = "neutral"

            features.append({
                "skill": skill,
                "present": is_present,
                "direction": direction,
                "contribution": contrib,
            })

        # Feature selection rule (Part G):
        # Always include all present recognized skills entered by user,
        # plus non-zero absent features (|contribution| >= 0.0001).
        # Sorted descending by absolute contribution magnitude.
        meaningful_features = [
            f for f in features
            if f["present"] or abs(f["contribution"]) >= 0.0001
        ]
        sorted_features = sorted(meaningful_features, key=lambda x: abs(x["contribution"]), reverse=True)

        return prediction_detail, method_used, sorted_features
