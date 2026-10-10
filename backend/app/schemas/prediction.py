"""Prediction request and response schemas for CareerCompass ML Inference Service."""

from typing import Any, List, Optional
import re
from pydantic import BaseModel, Field, field_validator


class CareerPredictionRequest(BaseModel):
    """
    Request schema for career track prediction.
    Accepts a list of student skill tokens.
    """
    skills: List[str] = Field(
        ...,
        description="List of technical and domain skills to evaluate.",
        examples=[["python", "programming", "ai"]],
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
            # Normalize whitespace: strip outer whitespace and collapse internal consecutive whitespace
            trimmed = item.strip()
            # Normalize casing
            lowered = trimmed.lower()
            if not lowered:
                continue

            # Multi-word skills with spaces or hyphens should be unified to standard underscore token
            # while preserving single words
            token = re.sub(r"[\s\-]+", "_", lowered)
            # Remove leading/trailing non-alphanumeric punctuation (e.g. quotes or dots)
            token = re.sub(r"^[\"\'\.\(\)]+|[\"\'\.\(\)]+$", "", token)

            if token and token not in seen:
                seen.add(token)
                cleaned_skills.append(token)

        if not cleaned_skills:
            raise ValueError("skills list must contain at least one non-empty skill string.")

        return cleaned_skills


class PredictionDetail(BaseModel):
    """Individual career track prediction with model-predicted probability."""
    career_track: str = Field(..., description="Canonical career track title.")
    probability: float = Field(
        ...,
        description=(
            "Model-predicted class probability from RandomForestClassifier. "
            "Note: This is a raw model probability and has not been post-hoc calibrated."
        ),
    )


class InputSkillsSummary(BaseModel):
    """Summary of incoming skills partitioned into recognized and unknown."""
    recognized_skills: List[str] = Field(
        ...,
        description="Skills recognized by the model's 29-feature canonical vocabulary.",
    )
    unknown_skills: List[str] = Field(
        ...,
        description="Skills provided that are not part of the model's training vocabulary.",
    )


class ModelSummary(BaseModel):
    """Metadata describing the active inference model."""
    version: str = Field(default="phase3.4", description="Model release version.")
    model_type: str = Field(default="RandomForestClassifier", description="ML algorithm family.")
    feature_configuration: str = Field(
        default="skills-only",
        description="Feature configuration used during inference (29 skills).",
    )


class CareerPredictionResponse(BaseModel):
    """
    Standardized career track inference response containing top prediction,
    ranked alternatives, all track probabilities, and input auditing.
    """
    prediction: PredictionDetail = Field(
        ...,
        description="Top-ranked career track based on maximum predicted probability.",
    )
    alternatives: List[PredictionDetail] = Field(
        ...,
        description="Remaining 3 career tracks ranked in descending probability order.",
    )
    probabilities: List[PredictionDetail] = Field(
        ...,
        description="All 4 career tracks sorted by descending model-predicted probability.",
    )
    input: InputSkillsSummary = Field(
        ...,
        description="Input audit showing recognized vs unknown skills.",
    )
    model: ModelSummary = Field(
        ...,
        description="Active model metadata and feature configuration.",
    )
    explanation: Optional[Any] = Field(
        default=None,
        description="Reserved for future explainability output (Phase 3.6/3.7).",
    )


class SkillVocabularyResponse(BaseModel):
    """Canonical model skill vocabulary response."""
    skills: List[str] = Field(
        ...,
        description="Sorted list of the 29 canonical skills recognized by the model.",
    )
    count: int = Field(..., description="Total count of recognized vocabulary skills (29).")
    model_version: str = Field(..., description="Active model release version identifier.")


class FeatureContribution(BaseModel):
    """Local attribution of an individual skill feature toward the predicted class."""
    skill: str = Field(..., description="Canonical skill name from the 29-feature vocabulary.")
    present: bool = Field(..., description="Whether this skill was present in the candidate input.")
    direction: str = Field(..., description="'supports' if contribution > 0, 'opposes' if < 0, 'neutral' if 0.")
    contribution: float = Field(..., description="Additive probability attribution towards the predicted class.")


class CareerExplanationResponse(BaseModel):
    """
    Standardized explanation response decomposing the model prediction
    into local feature attributions using TreeExplainer.
    """
    prediction: PredictionDetail = Field(
        ...,
        description="Predicted career track and its raw model probability.",
    )
    explanation_method: str = Field(
        default="TreeExplainer",
        description="Explanation algorithm utilized (e.g. TreeExplainer or TreePathAttribution).",
    )
    features: List[FeatureContribution] = Field(
        ...,
        description="List of influential skill feature attributions for the predicted class.",
    )
    input: InputSkillsSummary = Field(
        ...,
        description="Input audit showing recognized vs unknown skills.",
    )
    model: ModelSummary = Field(
        ...,
        description="Active model metadata and feature configuration.",
    )
