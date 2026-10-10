"""API package — aggregates all route modules."""

from .routes import (
    auth_routes, profile_routes, skills_routes, resume_routes,
    project_routes, certification_routes, roadmap_routes,
    career_routes, report_routes, settings_routes,
    mentor_routes, admin_routes, ml_routes,
    achievement_routes, notification_routes, favorites_routes,
    progress_routes, resume_analysis_routes, report_export_routes,
)

__all__ = [
    "auth_routes", "profile_routes", "skills_routes", "resume_routes",
    "project_routes", "certification_routes", "roadmap_routes",
    "career_routes", "report_routes", "settings_routes",
    "mentor_routes", "admin_routes", "ml_routes",
    "achievement_routes", "notification_routes", "favorites_routes",
    "progress_routes", "resume_analysis_routes", "report_export_routes",
]
