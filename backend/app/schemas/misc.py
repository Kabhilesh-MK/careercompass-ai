"""Schemas for resumes, chat history, reports, settings, admin."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from .base import MongoModel
from .auth import PASSWORD_REGEX  # noqa: F401


class ResumeMetadata(BaseModel):
    user_id: str
    filename: str
    file_path: str
    file_size: int
    content_type: str
    extracted_skills: list[str] = Field(default_factory=list)
    analysis: Optional[dict] = None


class ResumeResponse(ResumeMetadata, MongoModel):
    uploaded_at: Optional[datetime] = None


class ChatMessage(BaseModel):
    role: str  # user | assistant
    text: str
    time: str = ""


class ChatHistory(BaseModel):
    user_id: str
    messages: list[ChatMessage] = Field(default_factory=list)


class ChatHistoryResponse(ChatHistory, MongoModel):
    pass


class ReportResponse(BaseModel):
    user_id: str
    generated_at: datetime
    skill_progress: list[dict] = Field(default_factory=list)
    learning_hours: list[dict] = Field(default_factory=list)
    assessment_scores: list[dict] = Field(default_factory=list)
    milestones: list[dict] = Field(default_factory=list)
    insights: list[str] = Field(default_factory=list)


class NotificationSettings(BaseModel):
    career: bool = True
    roadmap: bool = True
    certs: bool = True
    reports: bool = False
    mentor: bool = True
    marketing: bool = False


class PrivacySettings(BaseModel):
    profile: str = "public"  # public | private | connections
    show_progress: bool = True
    show_skills: bool = True


class SettingsUpdate(BaseModel):
    theme: Optional[str] = None  # light | dark
    accent_color: Optional[str] = None
    notifications: Optional[NotificationSettings] = None
    privacy: Optional[PrivacySettings] = None


class SettingsResponse(BaseModel):
    theme: str = "light"
    accent_color: str = "#6D4CFF"
    notifications: NotificationSettings = Field(default_factory=NotificationSettings)
    privacy: PrivacySettings = Field(default_factory=PrivacySettings)


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=128)

    @classmethod
    def validate_new_password(cls, v: str) -> str:
        import re
        if not re.match(PASSWORD_REGEX, v):
            raise ValueError(
                "Password must be at least 8 chars with one uppercase, one digit, and one special character."
            )
        return v


class AdminStatsResponse(BaseModel):
    total_users: int
    active_users: int
    new_this_week: int
    projects_count: int
    certifications_count: int
    assessments_taken: int
    premium_users: int
    retention_rate: int
