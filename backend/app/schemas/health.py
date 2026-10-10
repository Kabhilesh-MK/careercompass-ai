"""Health and readiness schemas for CareerCompass ML Inference Service."""

from typing import List, Optional
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """Health check response schema."""
    status: str = Field(default="ok", description="Service health status")
    service: str = Field(default="careercompass-ml", description="Service identifier")


class ReadinessResponse(BaseModel):
    """Readiness check response schema."""
    status: str = Field(default="ready", description="Readiness status")
    model_loaded: bool = Field(..., description="Whether model artifact is loaded and verified")
    preprocessor_loaded: bool = Field(..., description="Whether preprocessor artifact is loaded and verified")
    metadata_loaded: bool = Field(..., description="Whether metadata artifact is loaded and verified")
    model_version: Optional[str] = Field(..., description="Active model version identifier")


class ExplainabilityInfo(BaseModel):
    """Explainability metadata schema."""
    available: bool = Field(default=True, description="Whether model explanation is available")
    method: str = Field(default="TreeExplainer", description="Explainability algorithm")


class CalibrationInfo(BaseModel):
    """Detailed calibration metadata schema."""
    status: str = Field(default="uncalibrated", description="Post-hoc calibration status")
    method: str = Field(default="none", description="Calibration post-processing method")


class ModelInfoResponse(BaseModel):
    """Model metadata and governance specification schema."""
    model_version: str = Field(..., description="Model release version identifier")
    model_type: str = Field(..., description="Classifier family name")
    feature_configuration: str = Field(..., description="Feature input configuration")
    feature_count: int = Field(..., description="Total input feature dimensionality")
    classes: List[str] = Field(..., description="Supported career tracks")
    training_samples: int = Field(..., description="Number of training records")
    taxonomy_version: str = Field(..., description="Career taxonomy version")
    calibration: str = Field(default="uncalibrated", description="Post-hoc calibration status")
    threshold_policy: str = Field(default="argmax", description="Decision threshold policy")
    explainability: ExplainabilityInfo = Field(
        default_factory=ExplainabilityInfo,
        description="Feature attribution method and availability.",
    )
    calibration_info: CalibrationInfo = Field(
        default_factory=CalibrationInfo,
        description="Detailed calibration metadata.",
    )
