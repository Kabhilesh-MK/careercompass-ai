"""Schemas package — exposes all request/response models."""

from .auth import (
    RegisterRequest, LoginRequest, ForgotPasswordRequest, ResetPasswordRequest,
    TokenResponse, RefreshRequest, MessageResponse,
)
from .user import (
    UserBase, UserUpdate, UserResponse, SkillsUpdate,
    Education, SkillItem, SkillCategory,
)
from .career import (
    Career, CareerResponse, Prediction, SkillGapItem, SkillGapResponse,
    PlacementScore, PlacementResponse,
)
from .learning import (
    Roadmap, RoadmapMilestone, RoadmapResponse,
    Project, ProjectResponse, Certification, CertificationResponse,
    LearningResource, LearningResourceResponse,
)
from .misc import (
    ResumeMetadata, ResumeResponse, ChatMessage, ChatHistory, ChatHistoryResponse,
    ReportResponse, NotificationSettings, PrivacySettings,
    SettingsUpdate, SettingsResponse, ChangePasswordRequest, AdminStatsResponse,
)

__all__ = [
    # auth
    "RegisterRequest", "LoginRequest", "ForgotPasswordRequest", "ResetPasswordRequest",
    "TokenResponse", "RefreshRequest", "MessageResponse",
    # user
    "UserBase", "UserUpdate", "UserResponse", "SkillsUpdate",
    "Education", "SkillItem", "SkillCategory",
    # career
    "Career", "CareerResponse", "Prediction", "SkillGapItem", "SkillGapResponse",
    "PlacementScore", "PlacementResponse",
    # learning
    "Roadmap", "RoadmapMilestone", "RoadmapResponse",
    "Project", "ProjectResponse", "Certification", "CertificationResponse",
    "LearningResource", "LearningResourceResponse",
    # misc
    "ResumeMetadata", "ResumeResponse", "ChatMessage", "ChatHistory", "ChatHistoryResponse",
    "ReportResponse", "NotificationSettings", "PrivacySettings",
    "SettingsUpdate", "SettingsResponse", "ChangePasswordRequest", "AdminStatsResponse",
]
