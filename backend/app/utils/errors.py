"""Custom errors and exceptions for CareerCompass ML Inference Service."""

from typing import Any, Optional
from app.utils.exceptions import AppException


class ModelNotReadyError(AppException):
    """Raised when the ML model service is not yet loaded or ready."""
    def __init__(self, message: str = "ML model service is not ready"):
        super().__init__(message, status_code=503, code="model_not_ready")


class ModelArtifactError(AppException):
    """Raised when ML model artifacts cannot be found or deserialized."""
    def __init__(self, message: str = "Failed to load model artifacts"):
        super().__init__(message, status_code=500, code="model_artifact_error")


class ModelCompatibilityError(AppException):
    """Raised when ML model artifacts fail compatibility verification."""
    def __init__(self, message: str = "Model artifacts failed compatibility validation"):
        super().__init__(message, status_code=500, code="model_incompatible")


class NoRecognizedSkillsError(AppException):
    """Raised when user input contains zero recognized skills."""
    def __init__(
        self,
        message: str = (
            "None of the provided skills match the model vocabulary. "
            "At least one recognized skill is required for prediction."
        ),
    ):
        super().__init__(message, status_code=422, code="no_recognized_skills")


class InvalidSkillInputError(AppException):
    """Raised when skill input is malformed or invalid."""
    def __init__(self, message: str = "Invalid skill input provided"):
        super().__init__(message, status_code=422, code="invalid_skill_input")
