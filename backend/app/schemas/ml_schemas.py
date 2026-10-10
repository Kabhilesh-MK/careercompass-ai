"""Pydantic schemas for the ML prediction API."""

from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Input
# ---------------------------------------------------------------------------

class StudentProfile(BaseModel):
    """Incoming student skill profile for ML prediction."""

    # Technical skills (0-100)
    Python: float = Field(default=0, ge=0, le=100)
    Java: float = Field(default=0, ge=0, le=100)
    Cpp: float = Field(default=0, ge=0, le=100, alias="C++")
    SQL: float = Field(default=0, ge=0, le=100)
    HTML: float = Field(default=0, ge=0, le=100)
    CSS: float = Field(default=0, ge=0, le=100)
    JavaScript: float = Field(default=0, ge=0, le=100)
    React: float = Field(default=0, ge=0, le=100)
    NodeJS: float = Field(default=0, ge=0, le=100)
    MongoDB: float = Field(default=0, ge=0, le=100)
    MySQL: float = Field(default=0, ge=0, le=100)
    Git: float = Field(default=0, ge=0, le=100)
    GitHub: float = Field(default=0, ge=0, le=100)
    AWS: float = Field(default=0, ge=0, le=100)
    Azure: float = Field(default=0, ge=0, le=100)
    Docker: float = Field(default=0, ge=0, le=100)
    Linux: float = Field(default=0, ge=0, le=100)
    MachineLearning: float = Field(default=0, ge=0, le=100, alias="Machine Learning")
    DeepLearning: float = Field(default=0, ge=0, le=100, alias="Deep Learning")
    PowerBI: float = Field(default=0, ge=0, le=100, alias="Power BI")
    Excel: float = Field(default=0, ge=0, le=100)
    Statistics: float = Field(default=0, ge=0, le=100)

    # Soft skills
    Communication: float = Field(default=0, ge=0, le=100)
    ProblemSolving: float = Field(default=0, ge=0, le=100, alias="Problem Solving")
    Leadership: float = Field(default=0, ge=0, le=100)
    Teamwork: float = Field(default=0, ge=0, le=100)
    Aptitude: float = Field(default=0, ge=0, le=100)

    # Profile features
    CGPA: float = Field(default=7.0, ge=0, le=10)
    ProjectsCompleted: int = Field(default=0, ge=0, alias="Projects Completed")
    Internship: int = Field(default=0, ge=0)
    Certifications: int = Field(default=0, ge=0)

    # Categorical
    Interest: str = Field(default="Web Development")
    PreferredDomain: str = Field(default="Full Stack", alias="Preferred Domain")

    model_config = {"populate_by_name": True}

    def to_ml_dict(self) -> dict[str, Any]:
        """Return a flat dict using the alias (original) field names."""
        return self.model_dump(by_alias=True)


# ---------------------------------------------------------------------------
# Output sub-schemas
# ---------------------------------------------------------------------------

class CareerProbability(BaseModel):
    career: str
    probability: float


class PredictionResult(BaseModel):
    predicted_career: str
    confidence: float
    top_5_careers: list[CareerProbability]
    all_predictions: Optional[list[CareerProbability]] = None
    explanation: Optional[dict[str, Any]] = None
    model_name: str
    model_accuracy: float


class SkillItem(BaseModel):
    name: str
    level: float


class MissingSkillItem(BaseModel):
    name: str
    current: float
    required: float
    gap: float
    priority: str


class SkillGapResult(BaseModel):
    target_career: str
    match_percentage: float
    current_skills: list[SkillItem]
    missing_skills: list[MissingSkillItem]
    strengths: list[SkillItem]
    weaknesses: list[SkillItem]
    total_required: int
    skills_met: int


class PlacementComponents(BaseModel):
    programming: float
    soft_skills: float
    projects: float
    cgpa: float
    internship: float
    certifications: float
    communication: float


class PlacementResult(BaseModel):
    overall_score: float
    components: PlacementComponents
    strengths: list[str]
    weaknesses: list[str]
    suggestions: list[str]
    readiness_level: str


class RecommendationResult(BaseModel):
    courses: list[str]
    certifications: list[str]
    projects: list[str]
    books: list[str]
    practice_sites: list[str]
    interview_topics: list[str]


class RoadmapMilestone(BaseModel):
    week: str
    title: str
    description: str
    tasks: list[str]
    status: str
    progress: int


class VisualizationData(BaseModel):
    career_probability_chart: dict[str, Any]
    skill_gap_chart: dict[str, Any]
    placement_score_chart: dict[str, Any]
    roadmap_progress: dict[str, Any]


class MLReportResponse(BaseModel):
    """Full ML report returned by POST /api/ml/predict."""

    prediction: PredictionResult
    skill_gap: SkillGapResult
    placement: PlacementResult
    recommendations: RecommendationResult
    roadmap: list[RoadmapMilestone]
    visualization_data: VisualizationData
