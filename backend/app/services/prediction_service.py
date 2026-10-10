"""
PredictionService — Coordinates request skill normalization, vocabulary auditing,
inference dispatch, and structured response formatting.
"""

from __future__ import annotations

import math
from typing import List, Tuple
from loguru import logger

from app.schemas.prediction import (
    CareerExplanationResponse,
    CareerPredictionRequest,
    CareerPredictionResponse,
    FeatureContribution,
    InputSkillsSummary,
    ModelSummary,
    PredictionDetail,
    SkillVocabularyResponse,
)
from app.services.model_service import ModelService
from app.utils.errors import NoRecognizedSkillsError


class PredictionService:
    """Service handling skill normalization and ML inference orchestration."""

    def __init__(self, model_service: ModelService | None = None) -> None:
        self.model_service = model_service or ModelService.get_instance()

    def get_skill_vocabulary(self) -> SkillVocabularyResponse:
        """Returns the canonical 29-skill vocabulary sorted deterministically."""
        vocab = self.model_service.get_canonical_vocabulary()
        metadata = self.model_service.get_metadata()
        version = metadata.get("phase", "phase3.4")
        if version.startswith("3."):
            version = f"phase{version}"

        return SkillVocabularyResponse(
            skills=sorted(vocab),
            count=len(vocab),
            model_version="phase3.4",
        )

    def partition_skills(self, skills: List[str]) -> Tuple[List[str], List[str]]:
        """
        Partitions input skills into recognized and unknown lists
        against the authoritative model vocabulary.
        Preserves input ordering.
        """
        vocab_set = set(self.model_service.get_canonical_vocabulary())
        recognized: List[str] = []
        unknown: List[str] = []

        for skill in skills:
            if skill in vocab_set:
                recognized.append(skill)
            else:
                unknown.append(skill)

        return recognized, unknown

    def predict(self, request: CareerPredictionRequest) -> CareerPredictionResponse:
        """
        Processes prediction request:
        1. Audits skills against canonical vocabulary.
        2. Raises 422 if zero skills are recognized.
        3. Invokes model inference without fitting.
        4. Validates probability distribution sums to ~1.0.
        5. Formats top prediction and ranked alternatives.
        """
        recognized, unknown = self.partition_skills(request.skills)

        # Fail fast with 422 if no recognized skills
        if not recognized:
            logger.warning(
                f"Prediction rejected: 0 of {len(request.skills)} skills recognized. "
                f"Unknown skills: {unknown}"
            )
            raise NoRecognizedSkillsError(
                "None of the provided skills match the model vocabulary. "
                "At least one recognized skill is required for prediction."
            )

        # Delimit recognized skills for inference
        skills_str = ", ".join(recognized)
        probs, classes = self.model_service.predict_proba(skills_str)

        # Verify probability sum
        prob_sum = float(sum(probs))
        if not math.isclose(prob_sum, 1.0, rel_tol=1e-3, abs_tol=1e-3):
            logger.error(f"Inference warning: Probabilities do not sum to 1.0 (sum={prob_sum})")

        # Format probability distribution
        items: List[PredictionDetail] = [
            PredictionDetail(career_track=c, probability=round(float(p), 4))
            for c, p in zip(classes, probs)
        ]

        # Sort all 4 classes strictly descending by model-predicted probability
        sorted_items = sorted(items, key=lambda x: x.probability, reverse=True)

        top_prediction = sorted_items[0]
        alternatives = sorted_items[1:]

        metadata = self.model_service.get_metadata()
        model_type = metadata.get("model_type", "RandomForestClassifier")

        return CareerPredictionResponse(
            prediction=top_prediction,
            alternatives=alternatives,
            probabilities=sorted_items,
            input=InputSkillsSummary(
                recognized_skills=recognized,
                unknown_skills=unknown,
            ),
            model=ModelSummary(
                version="phase3.4",
                model_type=model_type,
                feature_configuration="skills-only",
            ),
            explanation=None,
        )

    def explain(self, request: CareerPredictionRequest) -> CareerExplanationResponse:
        """
        Processes local explanation request:
        1. Audits skills against canonical vocabulary using identical normalization.
        2. Raises 422 if zero skills are recognized.
        3. Invokes model explain_instance without fitting or altering model state.
        4. Returns structured explanation response with non-causal feature attributions.
        """
        recognized, unknown = self.partition_skills(request.skills)

        # Fail fast with 422 if no recognized skills
        if not recognized:
            logger.warning(
                f"Explanation rejected: 0 of {len(request.skills)} skills recognized. "
                f"Unknown skills: {unknown}"
            )
            raise NoRecognizedSkillsError(
                "None of the provided skills match the model vocabulary. "
                "At least one recognized skill is required to explain prediction."
            )

        skills_str = ", ".join(recognized)
        pred_dict, method_used, features_list = self.model_service.explain_instance(
            skills_str, recognized
        )

        metadata = self.model_service.get_metadata()
        model_type = metadata.get("model_type", "RandomForestClassifier")

        return CareerExplanationResponse(
            prediction=PredictionDetail(**pred_dict),
            explanation_method=method_used,
            features=[FeatureContribution(**f) for f in features_list],
            input=InputSkillsSummary(
                recognized_skills=recognized,
                unknown_skills=unknown,
            ),
            model=ModelSummary(
                version="phase3.4",
                model_type=model_type,
                feature_configuration="skills-only",
            ),
        )
