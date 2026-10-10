"""
Pydantic schemas for CareerCompass Career Intelligence Engine.
Defines request and response models for career intelligence, skill gaps,
deterministic roadmaps, and curated learning recommendations.
"""

from __future__ import annotations

import re
from typing import Any, List, Optional
from pydantic import BaseModel, Field, field_validator

from app.schemas.prediction import ModelSummary, PredictionDetail


VALID_CAREER_TRACKS = [
    "Software Development & Engineering",
    "AI & Machine Learning Engineering",
    "Data Analytics & Business Intelligence",
    "Cloud, DevOps & Systems Engineering",
]


class CareerIntelligenceRequest(BaseModel):
    """
    Request schema for Career Intelligence evaluation.
    Accepts skills tokens and an optional target career track override.
    """
    skills: List[str] = Field(
        ...,
        description="List of student technical and domain skills to evaluate.",
        examples=[["python", "programming", "ai"]],
    )
    target_career_track: Optional[str] = Field(
        default=None,
        description=(
            "Optional target career track override. If omitted, the real ML "
            "predicted track will be used as the target."
        ),
        examples=["Software Development & Engineering"],
    )

    @field_validator("skills", mode="before")
    @classmethod
    def validate_and_normalize_skills(cls, value: Any) -> List[str]:
        if not isinstance(value, list):
            raise ValueError("skills must be a list of strings.")
        if len(value) == 0:
            raise ValueError("skills list cannot be empty. At least one skill must be provided.")
        if len(value) > 100:
            raise ValueError("skills list cannot exceed 100 items.")

        cleaned_skills: List[str] = []
        seen = set()

        for item in value:
            if not isinstance(item, str):
                raise ValueError(f"All skill entries must be strings. Received: {type(item).__name__}")
            if len(item) > 100:
                raise ValueError("Individual skill token cannot exceed 100 characters.")
            trimmed = item.strip().lower()
            if not trimmed:
                continue

            # Standardize whitespace and hyphens to underscore tokens
            token = re.sub(r"[\s\-]+", "_", trimmed)
            token = re.sub(r"^[\"\'\.\(\)]+|[\"\'\.\(\)]+$", "", token)

            if token and token not in seen:
                seen.add(token)
                cleaned_skills.append(token)

        if not cleaned_skills:
            raise ValueError("skills list must contain at least one non-empty skill string.")

        return cleaned_skills

    @field_validator("target_career_track", mode="before")
    @classmethod
    def validate_target_career_track(cls, value: Any) -> Optional[str]:
        if value is None or (isinstance(value, str) and not value.strip()):
            return None
        if not isinstance(value, str):
            raise ValueError("target_career_track must be a string if provided.")

        target = value.strip()
        # Case-insensitive resolution against valid tracks
        for valid in VALID_CAREER_TRACKS:
            if valid.lower() == target.lower():
                return valid

        # Flexible matching for common abbreviations/slugs
        slug_norm = re.sub(r"[^a-z0-9]+", "", target.lower())
        for valid in VALID_CAREER_TRACKS:
            valid_slug = re.sub(r"[^a-z0-9]+", "", valid.lower())
            if slug_norm == valid_slug:
                return valid

        raise ValueError(
            f"Invalid target career track '{target}'. Must be one of the four ML-supported tracks: "
            f"{', '.join(VALID_CAREER_TRACKS)}"
        )


class RequiredSkillCoverage(BaseModel):
    """
    Ontology-derived required skill coverage metrics.
    Mathematically transparent: present_required_skills / required_skills.
    """
    decimal: float = Field(
        ...,
        description="Coverage as a decimal (0.0 to 1.0).",
        examples=[0.6],
    )
    percentage: float = Field(
        ...,
        description="Coverage formatted as percentage (0.0 to 100.0).",
        examples=[60.0],
    )
    present_count: int = Field(
        ...,
        description="Number of required skills the candidate currently possesses.",
        examples=[3],
    )
    required_count: int = Field(
        ...,
        description="Total number of required skills in the career ontology track.",
        examples=[5],
    )


class PrioritizedGap(BaseModel):
    """
    Detailed gap record for an absent required skill.
    Priority is derived deterministically from the ontology, NOT from ML probabilities.
    """
    skill: str = Field(..., description="Canonical skill token.")
    priority: str = Field(..., description="Ontology priority: 'core', 'supporting', or 'advanced'.")
    category: str = Field(..., description="Skill category in competency framework.")
    reason: str = Field(..., description="Defensible product rule explanation for why this skill is needed.")
    prerequisites: List[str] = Field(default_factory=list, description="List of prerequisite canonical skills.")
    prerequisites_met: bool = Field(..., description="Whether all prerequisite skills are already present.")
    recommended_order: int = Field(..., description="Deterministic sequence order in the learning path.")


class RoadmapItem(BaseModel):
    """
    Deterministic milestone item on the career roadmap.
    """
    id: str = Field(..., description="Unique deterministic identifier for the roadmap item.")
    stage: int = Field(..., description="Roadmap stage number (1-5).")
    stage_title: str = Field(..., description="Human-readable title of the stage.")
    title: str = Field(..., description="Title of the milestone.")
    skill: str = Field(..., description="Canonical skill associated with this roadmap item.")
    status: str = Field(
        default="not_started",
        description="Milestone status: 'not_started', 'in_progress', or 'completed'.",
    )
    prerequisites: List[str] = Field(default_factory=list, description="Prerequisite skills.")
    prerequisites_met: bool = Field(..., description="Whether prerequisites are satisfied.")
    priority: str = Field(..., description="Competency priority tier: 'core', 'supporting', 'advanced'.")
    description: str = Field(..., description="Detailed pedagogical description of this milestone.")


class LearningRecommendation(BaseModel):
    """
    Curated learning resource recommendation matched to a prioritized missing skill.
    """
    resource_id: str = Field(..., description="Identifier from curated catalog.")
    title: str = Field(..., description="Resource title.")
    provider: str = Field(..., description="Content provider / platform (Coursera, DataCamp, etc.).")
    skill: str = Field(..., description="Canonical skill covered by this resource.")
    resource_type: str = Field(..., description="Type of resource (Course, Specialization, Simulation).")
    difficulty: str = Field(..., description="Skill difficulty level (Beginner, Intermediate, Advanced).")
    estimated_effort: str = Field(..., description="Estimated completion effort (e.g. '18 hours').")
    roadmap_stage: int = Field(..., description="Associated roadmap stage (1-5).")
    url: Optional[str] = Field(default=None, description="Direct URL or catalog link if verified, else None.")
    prerequisites: List[str] = Field(default_factory=list, description="List of prerequisite canonical skills.")
    prerequisites_met: bool = Field(default=True, description="Whether all prerequisite skills are already satisfied.")


class PredictionPayload(BaseModel):
    """
    Encapsulated ML prediction information.
    """
    career_track: str = Field(..., description="ML top predicted career track.")
    probability: float = Field(..., description="Raw Random Forest class probability.")
    alternatives: List[PredictionDetail] = Field(default_factory=list, description="Ranked alternative tracks.")
    probabilities: List[PredictionDetail] = Field(default_factory=list, description="All 4 track probabilities.")


class CareerIntelligenceResponse(BaseModel):
    """
    Unified Career Intelligence Engine response.
    Explicitly separates ML prediction from ontology-derived planning and recommendations.
    """
    target_career_track: str = Field(..., description="Authoritative planning career track.")
    target_source: str = Field(
        ...,
        description="Source of the target track: 'model_prediction' or 'user_selected'.",
        examples=["model_prediction", "user_selected"],
    )
    prediction: Optional[PredictionPayload] = Field(
        default=None,
        description="Random Forest ML prediction results (always separated from ontology metrics).",
    )
    recognized_skills: List[str] = Field(..., description="Input skills recognized by 29-feature vocabulary.")
    unknown_skills: List[str] = Field(..., description="Input skills not in canonical vocabulary.")
    required_skills: List[str] = Field(..., description="All required skills defined in track ontology.")
    present_required_skills: List[str] = Field(..., description="Required skills already possessed by user.")
    missing_required_skills: List[str] = Field(..., description="Required skills absent from user profile.")
    required_skill_coverage: RequiredSkillCoverage = Field(
        ...,
        description="Transparent mathematical ratio of present required skills / total required skills.",
    )
    prioritized_gaps: List[PrioritizedGap] = Field(
        ...,
        description="Prioritized skill gaps ordered by ontology tier and prerequisites.",
    )
    roadmap: List[RoadmapItem] = Field(
        ...,
        description="Deterministic 5-stage career progression roadmap.",
    )
    learning_recommendations: List[LearningRecommendation] = Field(
        ...,
        description="Curated learning catalog recommendations matching prioritized missing skills.",
    )
    model: ModelSummary = Field(
        ...,
        description="Governance metadata describing active Candidate H ML model.",
    )
