"""Schemas for roadmaps, projects, certifications, learning resources."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from .base import MongoModel


class RoadmapMilestone(BaseModel):
    id: Optional[str] = None
    week: Optional[str] = "Milestone"
    title: str
    description: str = ""
    tasks: list[str] = Field(default_factory=list)
    target_skills: list[str] = Field(default_factory=list)
    priority: str = "Important"  # Critical | Important | Developing
    status: str = "not_started"  # not_started | in-progress | completed | upcoming
    progress: int = Field(default=0, ge=0, le=100)
    projects: list[dict] = Field(default_factory=list)
    certifications: list[dict] = Field(default_factory=list)
    resources: list[dict] = Field(default_factory=list)



class Roadmap(BaseModel):
    user_id: str
    target_role: str
    milestones: list[RoadmapMilestone] = Field(default_factory=list)


class RoadmapResponse(Roadmap, MongoModel):
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class Project(BaseModel):
    title: str
    description: str
    difficulty: str = "Intermediate"  # Beginner | Intermediate | Advanced
    technologies: list[str] = Field(default_factory=list)
    duration: str = "2 weeks"
    match_score: int = Field(default=70, ge=0, le=100)
    category: str = "AI/ML"
    skills_gained: list[str] = Field(default_factory=list)


class ProjectResponse(Project, MongoModel):
    pass


class Certification(BaseModel):
    title: str
    provider: str
    difficulty: str = "Intermediate"
    duration: str = "4 weeks"
    price: str = "$100"
    match_score: int = Field(default=70, ge=0, le=100)
    skills: list[str] = Field(default_factory=list)
    description: str = ""
    logo: Optional[str] = None


class CertificationResponse(Certification, MongoModel):
    pass


class LearningResource(BaseModel):
    title: str
    type: str = "course"  # course | book | video | article
    url: Optional[str] = None
    provider: Optional[str] = None
    duration: Optional[str] = None


class LearningResourceResponse(LearningResource, MongoModel):
    pass
