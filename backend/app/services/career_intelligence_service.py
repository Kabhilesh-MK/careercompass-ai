"""
CareerIntelligenceService — Master Orchestrator for Phase 5 Career Intelligence Engine.

Coordinates skill partitioning, ML prediction dispatch, ontology retrieval,
gap and coverage computation, roadmap synthesis, and curated learning recommendations.
"""

from __future__ import annotations

from typing import List, Optional
from loguru import logger

from app.schemas.career_intelligence import (
    CareerIntelligenceRequest,
    CareerIntelligenceResponse,
    PredictionPayload,
)
from app.schemas.prediction import CareerPredictionRequest, ModelSummary, PredictionDetail
from app.services.career_ontology import CareerOntologyService
from app.services.learning_recommendation_service import LearningRecommendationService
from app.services.model_service import ModelService
from app.services.prediction_service import PredictionService
from app.services.roadmap_service import RoadmapService
from app.services.skill_gap_service import SkillGapService
from app.utils.errors import NoRecognizedSkillsError


class CareerIntelligenceService:
    """Master orchestrator for the Career Intelligence Engine."""

    def __init__(
        self,
        model_service: ModelService | None = None,
        prediction_service: PredictionService | None = None,
        ontology_service: CareerOntologyService | None = None,
        skill_gap_service: SkillGapService | None = None,
        roadmap_service: RoadmapService | None = None,
        learning_service: LearningRecommendationService | None = None,
    ) -> None:
        self.model_service = model_service or ModelService.get_instance()
        self.prediction_service = prediction_service or PredictionService(self.model_service)
        self.ontology_service = ontology_service or CareerOntologyService.get_instance()
        self.skill_gap_service = skill_gap_service or SkillGapService(self.ontology_service)
        self.roadmap_service = roadmap_service or RoadmapService(self.ontology_service)
        self.learning_service = learning_service or LearningRecommendationService(self.ontology_service)

    def evaluate(self, request: CareerIntelligenceRequest) -> CareerIntelligenceResponse:
        """
        Executes end-to-end Career Intelligence evaluation:
        1. Audits incoming skills against canonical 29-feature vocabulary.
        2. Resolves target career track:
           - If user specified a target track, use it directly (source = 'user_selected').
           - If omitted, execute ML inference to determine top predicted track (source = 'model_prediction').
        3. If recognized skills exist, runs ML prediction so prediction data is available.
        4. Calculates required skills, present skills, missing skills, and required-skill coverage.
        5. Computes prioritized gaps with prerequisites and recommended order.
        6. Constructs deterministic 5-stage career roadmap.
        7. Maps missing skills to curated learning recommendations.
        """
        # 1. Audit skills
        recognized_skills, unknown_skills = self.prediction_service.partition_skills(request.skills)

        # 2. Determine target track and run prediction if possible
        prediction_payload: Optional[PredictionPayload] = None
        target_track: str
        target_source: str

        if request.target_career_track:
            target_track = request.target_career_track
            target_source = "user_selected"

            # Run ML prediction if at least one recognized skill exists
            if recognized_skills:
                try:
                    pred_res = self.prediction_service.predict(
                        CareerPredictionRequest(skills=recognized_skills)
                    )
                    prediction_payload = PredictionPayload(
                        career_track=pred_res.prediction.career_track,
                        probability=pred_res.prediction.probability,
                        alternatives=pred_res.alternatives,
                        probabilities=pred_res.probabilities,
                    )
                except Exception as exc:
                    logger.warning(f"Advisory ML prediction failed during user-override flow: {exc}")
        else:
            # Model prediction flow: requires at least one recognized skill
            if not recognized_skills:
                raise NoRecognizedSkillsError(
                    "None of the provided skills match the model vocabulary. "
                    "At least one recognized skill is required for career track prediction. "
                    f"Unknown skills: {unknown_skills}"
                )

            pred_res = self.prediction_service.predict(
                CareerPredictionRequest(skills=recognized_skills)
            )
            target_track = pred_res.prediction.career_track
            target_source = "model_prediction"
            prediction_payload = PredictionPayload(
                career_track=pred_res.prediction.career_track,
                probability=pred_res.prediction.probability,
                alternatives=pred_res.alternatives,
                probabilities=pred_res.probabilities,
            )

        # 3. Deterministic Skill Gap Analysis
        (
            required_skills,
            present_required,
            missing_required,
            coverage,
            prioritized_gaps,
        ) = self.skill_gap_service.analyze_gaps(recognized_skills, target_track)

        # 4. Roadmap Generation
        roadmap = self.roadmap_service.generate_roadmap(target_track, recognized_skills)

        # 5. Learning Recommendations
        learning_recommendations = self.learning_service.get_recommendations_for_gaps(
            target_track, prioritized_gaps
        )

        # 6. Governance Model Summary
        meta = self.model_service.get_metadata() if self.model_service.is_ready() else {}
        version = meta.get("phase", "phase3.4")
        if version.startswith("3."):
            version = f"phase{version}"

        model_summary = ModelSummary(
            version=version,
            model_type=meta.get("candidate_id", "RandomForestClassifier"),
            feature_configuration="skills-only",
        )

        return CareerIntelligenceResponse(
            target_career_track=target_track,
            target_source=target_source,
            prediction=prediction_payload,
            recognized_skills=recognized_skills,
            unknown_skills=unknown_skills,
            required_skills=required_skills,
            present_required_skills=present_required,
            missing_required_skills=missing_required,
            required_skill_coverage=coverage,
            prioritized_gaps=prioritized_gaps,
            roadmap=roadmap,
            learning_recommendations=learning_recommendations,
            model=model_summary,
        )
