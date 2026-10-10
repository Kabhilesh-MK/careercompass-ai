"""Schemas for careers, predictions, skill gap, placement."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from .base import MongoModel


class Career(BaseModel):
    title: str
    match: int = Field(ge=0, le=100)
    salary: str
    growth: str
    demand: str
    description: str
    required_skills: list[str] = Field(default_factory=list)
    future_scope: str = ""
    pros: list[str] = Field(default_factory=list)
    cons: list[str] = Field(default_factory=list)


class CareerResponse(Career, MongoModel):
    pass


class Prediction(BaseModel):
    user_id: str
    career_title: str
    probability: int = Field(ge=0, le=100)
    created_at: Optional[datetime] = None


class SkillGapItem(BaseModel):
    name: str
    current: int = Field(ge=0, le=100)
    required: int = Field(ge=0, le=100)
    priority: str = "Medium"


class SkillGapResponse(BaseModel):
    target_role: str
    match_percentage: int = Field(ge=0, le=100)
    current_skills: list[dict] = Field(default_factory=list)
    missing_skills: list[SkillGapItem] = Field(default_factory=list)
    recommendations: list[dict] = Field(default_factory=list)


class PlacementScore(BaseModel):
    user_id: str
    overall_score: int = Field(ge=0, le=100)
    aptitude: int = Field(ge=0, le=100)
    technical: int = Field(ge=0, le=100)
    communication: int = Field(ge=0, le=100)
    problem_solving: int = Field(ge=0, le=100)
    system_design: int = Field(ge=0, le=100)
    projects: int = Field(ge=0, le=100)


class PlacementResponse(PlacementScore, MongoModel):
    pass
