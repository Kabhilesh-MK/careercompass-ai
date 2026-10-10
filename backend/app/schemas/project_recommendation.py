"""
Pydantic schemas for CareerCompass Project Intelligence Engine.
Defines request and response models for deterministic project recommendations,
catalog items, deliverables, and portfolio evidence tracking.
"""

from __future__ import annotations

import re
from typing import Any, List, Optional
from pydantic import BaseModel, Field, field_validator

from app.schemas.career_intelligence import VALID_CAREER_TRACKS


class ProjectRecommendationRequest(BaseModel):
    """
    Request schema for project recommendations.
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
        examples=["AI & Machine Learning Engineering"],
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
        for valid in VALID_CAREER_TRACKS:
            if valid.lower() == target.lower():
                return valid

        slug_norm = re.sub(r"[^a-z0-9]+", "", target.lower())
        for valid in VALID_CAREER_TRACKS:
            valid_slug = re.sub(r"[^a-z0-9]+", "", valid.lower())
            if slug_norm == valid_slug:
                return valid

        raise ValueError(
            f"Invalid target career track '{target}'. Must be one of the four ML-supported tracks: "
            f"{', '.join(VALID_CAREER_TRACKS)}"
        )


class ProjectItem(BaseModel):
    """
    Curated project definition with skills, deliverables, and evidence checklists.
    """
    project_id: str = Field(..., description="Unique deterministic identifier for the project.")
    title: str = Field(..., description="Title of the project.")
    career_track: str = Field(..., description="ML-supported career track this project belongs to.")
    description: str = Field(..., description="Technical summary and problem statement.")
    difficulty: str = Field(..., description="Difficulty tier: 'Beginner', 'Intermediate', or 'Advanced'.")
    estimated_effort: str = Field(..., description="Estimated effort to complete (e.g. '25 hours').")
    skills_demonstrated: List[str] = Field(
        ...,
        description="Canonical skills practiced and demonstrated by completing this project.",
    )
    skills_targeted: List[str] = Field(
        ...,
        description="Primary canonical skills this project is specifically built to address.",
    )
    prerequisites: List[str] = Field(
        default_factory=list,
        description="Canonical prerequisite skills required prior to commencing project.",
    )
    recommended_stage: int = Field(..., description="Roadmap stage (1-5) where this project is most pedagogically effective.")
    portfolio_value: str = Field(
        ...,
        description="Portfolio evidence value weight ('medium', 'high', 'very_high').",
    )
    suggested_deliverables: List[str] = Field(
        ...,
        description="Concrete technical artifacts to produce (e.g., REST API, schema migrations).",
    )
    suggested_evidence: List[str] = Field(
        ...,
        description="Portfolio evidence items to demonstrate project completion and competency.",
    )
    technology_stack: Optional[List[str]] = Field(
        default_factory=list,
        description="Recommended modern tooling and libraries.",
    )


class RecommendedProject(ProjectItem):
    """
    Recommended project with dynamic user-relative relevance score and gap matching.
    """
    matched_missing_skills: List[str] = Field(
        default_factory=list,
        description="Missing skills for the target career track that this project closes.",
    )
    prerequisites_met: bool = Field(
        ...,
        description="Whether the user currently possesses all prerequisites for this project.",
    )
    relevance_score: float = Field(
        ...,
        description=(
            "Deterministic heuristic relevance score (0-100) based on targeted missing skills, "
            "prerequisite satisfaction, stage alignment, and portfolio value. NOT an ML confidence score."
        ),
    )


class ProjectRecommendationResponse(BaseModel):
    """
    Response schema for POST /api/v1/career/projects/recommendations.
    """
    target_career_track: str = Field(..., description="Authoritative planning career track.")
    target_source: str = Field(
        ...,
        description="Source of the target track: 'model_prediction' or 'user_selected'.",
    )
    projects: List[RecommendedProject] = Field(
        ...,
        description="Curated projects ranked deterministically by Project Relevance Score.",
    )
