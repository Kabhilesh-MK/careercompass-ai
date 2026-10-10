"""Schemas for achievements, notifications, favorites, learning progress."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field

from .base import MongoModel


# ---------------------------------------------------------------------------
# Achievements
# ---------------------------------------------------------------------------

class Achievement(BaseModel):
    key: str                          # unique slug e.g. "python_beginner"
    title: str
    description: str
    icon: str = "Award"               # Lucide icon name
    color: str = "primary"            # tailwind color token
    category: str = "skills"          # skills | career | learning | profile
    earned: bool = False
    earned_at: Optional[datetime] = None
    points: int = 10


class AchievementResponse(Achievement, MongoModel):
    user_id: str


# ---------------------------------------------------------------------------
# Notifications
# ---------------------------------------------------------------------------

class Notification(BaseModel):
    user_id: str
    type: str = "info"                # info | success | warning | reminder
    title: str
    message: str
    icon: str = "Bell"
    read: bool = False
    action_url: Optional[str] = None
    created_at: Optional[datetime] = None


class NotificationResponse(Notification, MongoModel):
    pass


class MarkReadRequest(BaseModel):
    ids: list[str] = Field(default_factory=list)   # empty = mark all


# ---------------------------------------------------------------------------
# Favorites
# ---------------------------------------------------------------------------

class FavoriteItem(BaseModel):
    user_id: str
    item_type: str                    # project | course | certification | roadmap | career
    item_id: str
    item_title: str
    item_meta: dict[str, Any] = Field(default_factory=dict)
    created_at: Optional[datetime] = None


class FavoriteResponse(FavoriteItem, MongoModel):
    pass


class AddFavoriteRequest(BaseModel):
    item_type: str
    item_id: str
    item_title: str
    item_meta: dict[str, Any] = Field(default_factory=dict)


# ---------------------------------------------------------------------------
# Learning Progress
# ---------------------------------------------------------------------------

class CourseProgress(BaseModel):
    course_id: str
    title: str
    provider: str = ""
    completed: bool = False
    progress_pct: int = Field(default=0, ge=0, le=100)
    completed_at: Optional[datetime] = None


class ProjectProgress(BaseModel):
    project_id: str
    title: str
    completed: bool = False
    progress_pct: int = Field(default=0, ge=0, le=100)
    completed_at: Optional[datetime] = None


class CertProgress(BaseModel):
    cert_id: str
    title: str
    provider: str = ""
    completed: bool = False
    completed_at: Optional[datetime] = None


class LearningProgress(BaseModel):
    user_id: str
    courses: list[CourseProgress] = Field(default_factory=list)
    projects: list[ProjectProgress] = Field(default_factory=list)
    certifications: list[CertProgress] = Field(default_factory=list)
    roadmap_completion: int = Field(default=0, ge=0, le=100)
    overall_pct: int = Field(default=0, ge=0, le=100)
    total_hours: float = 0.0
    streak_days: int = 0
    last_activity: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class LearningProgressResponse(LearningProgress, MongoModel):
    pass


class UpdateProgressRequest(BaseModel):
    item_type: str                    # course | project | certification | roadmap
    item_id: str
    completed: bool = False
    progress_pct: int = Field(default=0, ge=0, le=100)
    title: str = ""
    provider: str = ""


# ---------------------------------------------------------------------------
# Resume Analysis
# ---------------------------------------------------------------------------

class ResumeAnalysis(BaseModel):
    resume_id: str
    user_id: str
    extracted_skills: list[str] = Field(default_factory=list)
    extracted_projects: list[str] = Field(default_factory=list)
    extracted_certifications: list[str] = Field(default_factory=list)
    extracted_education: list[str] = Field(default_factory=list)
    extracted_achievements: list[str] = Field(default_factory=list)
    resume_score: int = Field(default=0, ge=0, le=100)
    ats_score: int = Field(default=0, ge=0, le=100)
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    suggestions: list[str] = Field(default_factory=list)
    missing_keywords: list[str] = Field(default_factory=list)
    predicted_career_match: str = ""
    analyzed_at: Optional[datetime] = None


class ResumeAnalysisResponse(ResumeAnalysis, MongoModel):
    pass
