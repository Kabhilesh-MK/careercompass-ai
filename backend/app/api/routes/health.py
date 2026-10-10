"""Health and readiness probe routes for CareerCompass ML Inference Service."""

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse

from app.dependencies import get_model_service
from app.schemas.health import HealthResponse, ReadinessResponse
from app.services.model_service import ModelService

router = APIRouter(tags=["Health & Readiness"])


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Service Liveness Probe",
    description="Indicates whether the FastAPI application process is up and running.",
)
async def health_check() -> HealthResponse:
    """Liveness probe indicating process is responsive."""
    return HealthResponse(status="ok", service="careercompass-ml")


@router.get(
    "/ready",
    response_model=ReadinessResponse,
    status_code=status.HTTP_200_OK,
    responses={
        503: {
            "description": "Service Unavailable — ML artifacts not loaded or failed validation",
            "content": {
                "application/json": {
                    "example": {
                        "status": "not_ready",
                        "model_loaded": False,
                        "preprocessor_loaded": False,
                        "metadata_loaded": False,
                        "model_version": None,
                        "detail": "ML model artifacts not loaded.",
                    }
                }
            },
        }
    },
    summary="Service Readiness Probe",
    description="Verifies that all Phase 3.4.1 ML artifacts (model, preprocessor, metadata) are loaded and validated.",
)
async def readiness_check(
    model_service: ModelService = Depends(get_model_service),
):
    """Readiness probe checking that ML artifacts are loaded and ready for inference."""
    is_ready = model_service.is_ready()
    if not is_ready:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "not_ready",
                "model_loaded": model_service.model is not None,
                "preprocessor_loaded": model_service.preprocessor is not None,
                "metadata_loaded": model_service.metadata is not None,
                "model_version": None,
                "detail": "ML model artifacts not loaded or failed validation.",
            },
        )

    return ReadinessResponse(
        status="ready",
        model_loaded=True,
        preprocessor_loaded=True,
        metadata_loaded=True,
        model_version="phase3.4",
    )
