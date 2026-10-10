"""
Career Intelligence Engine API routes.

Provides:
- POST /api/v1/career/intelligence — End-to-end intelligence evaluation (ML prediction + ontology gap + roadmap + learning recommendations)
- GET  /api/v1/career/ontology — Curated competency framework for all 4 ML-supported career tracks
"""

from __future__ import annotations

from typing import Any, Dict, List
from fastapi import APIRouter, Depends, status

from app.dependencies import (
    get_career_intelligence_service,
    get_career_ontology_service,
    get_project_catalog_service,
    get_project_recommendation_service,
)
from app.schemas.career_intelligence import (
    CareerIntelligenceRequest,
    CareerIntelligenceResponse,
)
from app.schemas.project_recommendation import (
    ProjectItem,
    ProjectRecommendationRequest,
    ProjectRecommendationResponse,
)
from app.services.career_intelligence_service import CareerIntelligenceService
from app.services.career_ontology import CareerOntologyService
from app.services.project_catalog import ProjectCatalogService
from app.services.project_recommendation_service import ProjectRecommendationService

router = APIRouter(prefix="/career", tags=["Career Intelligence Engine"])


@router.post(
    "/intelligence",
    response_model=CareerIntelligenceResponse,
    status_code=status.HTTP_200_OK,
    summary="Evaluate Career Intelligence",
    description=(
        "Transforms student skills into an end-to-end career intelligence plan. "
        "Coordinates real Candidate H Random Forest inference (or user-selected override), "
        "curated career skill ontology, deterministic skill gap analysis, transparent "
        "required-skill coverage, a 5-stage progression roadmap, and curated course recommendations. "
        "NOTE: ML prediction probabilities are non-calibrated class probabilities, while "
        "skill gaps, roadmaps, and priorities are derived from curated product ontology rules."
    ),
    responses={
        200: {"description": "Comprehensive Career Intelligence evaluation result."},
        422: {"description": "Validation error — empty skill list, all unknown skills with no target, or invalid career track."},
        500: {"description": "Internal evaluation failure."},
        503: {"description": "ML model service unavailable / not loaded."},
    },
)
async def evaluate_career_intelligence(
    request: CareerIntelligenceRequest,
    service: CareerIntelligenceService = Depends(get_career_intelligence_service),
) -> CareerIntelligenceResponse:
    """Delegates evaluation directly to CareerIntelligenceService without inline business logic."""
    return service.evaluate(request)


@router.get(
    "/ontology",
    response_model=Dict[str, Any],
    status_code=status.HTTP_200_OK,
    summary="Get Career Competency Ontology",
    description=(
        "Returns the authoritative curated competency framework for the four ML-supported tracks. "
        "All skills are drawn strictly from the 29-feature canonical vocabulary."
    ),
)
async def get_career_ontology(
    ontology_service: CareerOntologyService = Depends(get_career_ontology_service),
) -> Dict[str, Any]:
    """Returns curated competency metadata for all supported career tracks."""
    tracks = ontology_service.get_supported_tracks()
    result = {}
    for track_name in tracks:
        track = ontology_service.get_track_ontology(track_name)
        result[track_name] = {
            "track_name": track.track_name,
            "slug": track.slug,
            "description": track.description,
            "core_skills": track.core_skills,
            "supporting_skills": track.supporting_skills,
            "advanced_skills": track.advanced_skills,
            "all_required_skills": track.all_required_skills,
            "recommended_learning_order": track.recommended_learning_order,
            "prerequisites": track.prerequisites,
        }
    return {"tracks": result, "supported_track_names": tracks}


@router.post(
    "/projects/recommendations",
    response_model=ProjectRecommendationResponse,
    status_code=status.HTTP_200_OK,
    summary="Recommend Curated Engineering Projects",
    description=(
        "Returns deterministic project recommendations mapped to the candidate's target career track "
        "and prioritized missing skills. Relevance scores are computed via transparent heuristics "
        "(skill gap closure, prerequisite satisfaction, stage alignment, portfolio value) "
        "and are NOT ML confidence estimates or LLM outputs."
    ),
    responses={
        200: {"description": "Ranked curated project recommendations."},
        422: {"description": "Validation error — empty skill list, all unknown skills with no target, or invalid career track."},
        500: {"description": "Internal recommendation failure."},
        503: {"description": "ML model service unavailable / not loaded."},
    },
)
async def recommend_career_projects(
    request: ProjectRecommendationRequest,
    service: ProjectRecommendationService = Depends(get_project_recommendation_service),
) -> ProjectRecommendationResponse:
    """Delegates recommendation scoring directly to ProjectRecommendationService."""
    return service.recommend_projects(request)


@router.get(
    "/projects/catalog",
    response_model=List[ProjectItem],
    status_code=status.HTTP_200_OK,
    summary="Get Curated Project Catalog",
    description=(
        "Returns the complete curated project catalog across all four ML-supported tracks. "
        "All skill references strictly adhere to the 29-feature canonical vocabulary."
    ),
)
async def get_project_catalog(
    catalog_service: ProjectCatalogService = Depends(get_project_catalog_service),
) -> List[ProjectItem]:
    """Returns all curated projects."""
    return catalog_service.get_all_projects()

