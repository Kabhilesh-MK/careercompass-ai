"""User and profile schemas."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field

from .base import MongoModel


class Education(BaseModel):
    institution: str
    degree: str
    start_year: int
    end_year: int
    cgpa: Optional[float] = None
    status: str = "Completed"


class SkillItem(BaseModel):
    name: str
    level: int = Field(ge=0, le=100)
    verified: bool = False


class SkillCategory(BaseModel):
    id: str
    name: str
    icon: str = "Code2"
    color: str = "primary"
    skills: list[SkillItem] = Field(default_factory=list)


class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str = "student"
    degree: Optional[str] = None
    department: Optional[str] = None
    college: Optional[str] = None
    year: Optional[int] = None
    cgpa: Optional[float] = None
    skills: list[SkillCategory] = Field(default_factory=list)
    interests: list[str] = Field(default_factory=list)
    education: list[Education] = Field(default_factory=list)
    avatar: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    profile_completed: bool = False
    preferred_domain: Optional[str] = None
    internships: Optional[int] = 0
    projects_completed: Optional[int] = 0
    certifications_count: Optional[int] = 0


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    degree: Optional[str] = None
    department: Optional[str] = None
    college: Optional[str] = None
    year: Optional[int] = None
    cgpa: Optional[float] = None
    interests: Optional[list[str]] = None
    education: Optional[list[Education]] = None
    avatar: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    profile_completed: Optional[bool] = None
    preferred_domain: Optional[str] = None
    internships: Optional[int] = None
    projects_completed: Optional[int] = None
    certifications_count: Optional[int] = None


class SkillsUpdate(BaseModel):
    skills: list[SkillCategory]


class UserResponse(UserBase, MongoModel):
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
