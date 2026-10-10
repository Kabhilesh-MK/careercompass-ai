"""
ProjectRecommendationService — Deterministic Heuristic Recommendation Engine.

=============================================================================
ARCHITECTURAL & METHODOLOGICAL DISTINCTION:
=============================================================================
This engine computes a deterministic 'Project Relevance Score' based on:
1. Target career track alignment
2. Missing canonical skills targeted by the project
3. Ontology competency tier of targeted missing skills (core > supporting > advanced)
4. Prerequisite readiness status
5. Roadmap stage alignment
6. Curated portfolio evidence value

The score is a PLANNING HEURISTIC, NOT an ML confidence estimate or employability probability.
No LLMs or statistical classifiers are used to score or rank projects.
=============================================================================
"""

from __future__ import annotations

from typing import List, Optional, Set
from loguru import logger

from app.schemas.prediction import CareerPredictionRequest
from app.schemas.project_recommendation import (
    ProjectItem,
    ProjectRecommendationRequest,
    ProjectRecommendationResponse,
    RecommendedProject,
)
from app.services.career_ontology import CareerOntologyService
from app.services.model_service import ModelService
from app.services.prediction_service import PredictionService
from app.services.project_catalog import ProjectCatalogService
from app.utils.errors import NoRecognizedSkillsError


class ProjectRecommendationService:
    """Service computing transparent project recommendations based on student competencies."""

    def __init__(
        self,
        catalog_service: ProjectCatalogService | None = None,
        ontology_service: CareerOntologyService | None = None,
        model_service: ModelService | None = None,
        prediction_service: PredictionService | None = None,
    ) -> None:
        self.catalog_service = catalog_service or ProjectCatalogService.get_instance()
        self.ontology_service = ontology_service or CareerOntologyService.get_instance()
        self.model_service = model_service or ModelService.get_instance()
        self.prediction_service = prediction_service or PredictionService(self.model_service)

    def recommend_projects(
        self, request: ProjectRecommendationRequest
    ) -> ProjectRecommendationResponse:
        """
        Generates prioritized project recommendations:
        1. Partitions skills into recognized and unknown tokens.
        2. Resolves target career track (user override or model prediction).
        3. Identifies missing required skills for the target track.
        4. Calculates deterministic Project Relevance Score for each catalog project.
        5. Ranks projects descending by score.
        """
        # 1. Audit skills against canonical vocabulary
        recognized_skills, unknown_skills = self.prediction_service.partition_skills(request.skills)

        # 2. Resolve target career track
        target_track: str
        target_source: str

        if request.target_career_track:
            target_track = request.target_career_track
            target_source = "user_selected"
        else:
            if not recognized_skills:
                raise NoRecognizedSkillsError(
                    "None of the provided skills match the model vocabulary. "
                    "At least one recognized skill is required for project recommendations "
                    "when target_career_track is omitted. "
                    f"Unknown skills: {unknown_skills}"
                )
            pred_res = self.prediction_service.predict(
                CareerPredictionRequest(skills=recognized_skills)
            )
            target_track = pred_res.prediction.career_track
            target_source = "model_prediction"

        # 3. Retrieve ontology metadata and compute missing skills
        ontology = self.ontology_service.get_track_ontology(target_track)
        recognized_set = set(recognized_skills)
        missing_skills_set = set(ontology.all_required_skills) - recognized_set

        # Determine user's current roadmap stage baseline
        # Highest stage among present core skills, or 1 if none
        user_stages = [
            ontology.skills_metadata[s].stage
            for s in ontology.all_required_skills
            if s in recognized_set and s in ontology.skills_metadata
        ]
        current_stage = max(user_stages) if user_stages else 1

        # 4. Score projects curated for the target track
        track_projects: List[ProjectItem] = self.catalog_service.get_projects_for_track(target_track)
        scored_projects: List[RecommendedProject] = []

        for p in track_projects:
            # Check which missing skills are targeted by this project
            matched_targeted = [s for s in p.skills_targeted if s in missing_skills_set]
            # Additional demonstrated missing skills not in targeted
            matched_demonstrated = [
                s for s in p.skills_demonstrated
                if s in missing_skills_set and s not in p.skills_targeted
            ]
            all_matched_missing = list(dict.fromkeys(matched_targeted + matched_demonstrated))

            # Prerequisite readiness
            prereqs_met = (
                True
                if not p.prerequisites
                else all(pr in recognized_set for pr in p.prerequisites)
            )

            # Deterministic Relevance Scoring Heuristic (0 to 100)
            # Base score:
            score = 10.0

            # Value for missing skills targeted directly by project
            for s in matched_targeted:
                meta = ontology.skills_metadata.get(s)
                tier = meta.tier if meta else "supporting"
                if tier == "core":
                    score += 20.0
                elif tier == "supporting":
                    score += 12.0
                else:  # advanced
                    score += 8.0

            # Value for missing skills demonstrated secondary
            for s in matched_demonstrated:
                score += 5.0

            # Prerequisite readiness: satisfied grants bonus, missing incurs penalty
            if prereqs_met:
                score += 15.0
            else:
                score -= 15.0

            # Stage alignment: projects close to current stage receive bonus
            if p.recommended_stage <= current_stage + 1:
                score += 10.0

            # Portfolio value weight
            if p.portfolio_value == "very_high":
                score += 5.0
            elif p.portfolio_value == "high":
                score += 3.0

            # Clamp score between 0.0 and 100.0
            clamped_score = max(0.0, min(100.0, round(score, 1)))

            scored_projects.append(
                RecommendedProject(
                    project_id=p.project_id,
                    title=p.title,
                    career_track=p.career_track,
                    description=p.description,
                    difficulty=p.difficulty,
                    estimated_effort=p.estimated_effort,
                    skills_demonstrated=p.skills_demonstrated,
                    skills_targeted=p.skills_targeted,
                    prerequisites=p.prerequisites,
                    recommended_stage=p.recommended_stage,
                    portfolio_value=p.portfolio_value,
                    suggested_deliverables=p.suggested_deliverables,
                    suggested_evidence=p.suggested_evidence,
                    technology_stack=p.technology_stack,
                    matched_missing_skills=all_matched_missing,
                    prerequisites_met=prereqs_met,
                    relevance_score=clamped_score,
                )
            )

        # 5. Rank projects deterministically: highest relevance score first, then earliest stage
        scored_projects.sort(key=lambda item: (-item.relevance_score, item.recommended_stage))

        return ProjectRecommendationResponse(
            target_career_track=target_track,
            target_source=target_source,
            projects=scored_projects,
        )
