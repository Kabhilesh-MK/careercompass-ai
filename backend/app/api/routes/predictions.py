"""Career prediction and model metadata API endpoints."""

from fastapi import APIRouter, Depends, status
from loguru import logger

from app.dependencies import get_model_service, get_prediction_service
from app.schemas.health import CalibrationInfo, ExplainabilityInfo, ModelInfoResponse
from app.schemas.prediction import (
    CareerExplanationResponse,
    CareerPredictionRequest,
    CareerPredictionResponse,
    SkillVocabularyResponse,
)
from app.services.model_service import ModelService
from app.services.prediction_service import PredictionService

router = APIRouter(tags=["ML Predictions"])


@router.post(
    "/predictions/career",
    response_model=CareerPredictionResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate Career Track Predictions",
    description=(
        "Evaluates student skills using the locked Phase 3.4.1 Random Forest model. "
        "Returns top-ranked track, ranked alternatives, all 4 track probabilities, "
        "and an audit of recognized vs unknown skills. "
        "NOTE: The returned probability is the Random Forest model's predicted class "
        "probability and has not been post-hoc calibrated."
    ),
    responses={
        200: {"description": "Successful inference response with probabilities for all 4 tracks."},
        422: {"description": "Validation error — empty skill list or zero recognized skills."},
        500: {"description": "Internal inference failure without leaking internal stack traces."},
        503: {"description": "ML model service unavailable / not loaded."},
    },
)
async def predict_career_track(
    request: CareerPredictionRequest,
    prediction_service: PredictionService = Depends(get_prediction_service),
) -> CareerPredictionResponse:
    """
    Executes dynamic inference on incoming skills.
    Normalizes skills, checks against the 29-feature vocabulary, and returns
    full probability distribution across the 4 canonical career tracks.
    """
    return prediction_service.predict(request)


@router.post(
    "/predictions/career/explain",
    response_model=CareerExplanationResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate Local Career Prediction Explanation",
    description=(
        "Decomposes the Candidate H Random Forest prediction into additive feature "
        "attributions using TreeExplainer. Explains which input skills contributed "
        "toward or against the top predicted career track within the trained benchmark. "
        "Non-causal standard: These contributions describe model behavior, not real-world causality."
    ),
    responses={
        200: {"description": "Successful local explanation with feature contributions."},
        422: {"description": "Validation error — empty skill list or zero recognized skills."},
        500: {"description": "Internal explanation failure without leaking internal stack traces."},
        503: {"description": "ML model service unavailable / not loaded."},
    },
)
async def explain_career_prediction(
    request: CareerPredictionRequest,
    prediction_service: PredictionService = Depends(get_prediction_service),
) -> CareerExplanationResponse:
    """
    Executes local prediction explanation for incoming skills.
    Uses identical skill normalization and vocabulary handling as /predictions/career.
    """
    return prediction_service.explain(request)


@router.get(
    "/predictions/career/skills",
    response_model=SkillVocabularyResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Canonical Skill Vocabulary",
    description=(
        "Returns the complete 29-skill vocabulary recognized by the Phase 3.4.1 model. "
        "Sorted deterministically."
    ),
)
async def get_skill_vocabulary(
    prediction_service: PredictionService = Depends(get_prediction_service),
) -> SkillVocabularyResponse:
    """Returns canonical model skill vocabulary."""
    return prediction_service.get_skill_vocabulary()


@router.get(
    "/model/info",
    response_model=ModelInfoResponse,
    status_code=status.HTTP_200_OK,
    summary="Model Metadata & Governance Info",
    description=(
        "Returns verified model metadata including algorithm family, feature configuration, "
        "class labels, sample counts, taxonomy version, calibration, and decision threshold policy. "
        "Never exposes internal filesystem paths."
    ),
    responses={
        200: {"description": "Model governance metadata."},
        503: {"description": "Model service not loaded."},
    },
)
async def get_model_info(
    model_service: ModelService = Depends(get_model_service),
) -> ModelInfoResponse:
    """Returns metadata for the active ML model."""
    metadata = model_service.get_metadata()
    classes = model_service.get_classes()
    vocab = model_service.get_canonical_vocabulary()
    exp_meta = model_service.get_explanation_metadata()

    # Extract clean threshold policy name
    raw_thresh = metadata.get("threshold_policy_status", "argmax")
    threshold_policy = "argmax" if "argmax" in raw_thresh.lower() else raw_thresh

    return ModelInfoResponse(
        model_version="phase3.4",
        model_type=metadata.get("model_type", "RandomForestClassifier"),
        feature_configuration="skills-only",
        feature_count=len(vocab),
        classes=classes,
        training_samples=metadata.get("training_sample_count", 192),
        taxonomy_version=metadata.get(
            "taxonomy_version",
            "Phase 3.4 / 3.4.1 (4 active technical tracks)",
        ),
        calibration="uncalibrated",
        threshold_policy=threshold_policy,
        explainability=ExplainabilityInfo(
            available=exp_meta.get("available", True),
            method=exp_meta.get("method", "TreeExplainer"),
        ),
        calibration_info=CalibrationInfo(
            status="uncalibrated",
            method="raw_ensemble",
        ),
    )
