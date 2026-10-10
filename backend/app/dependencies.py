"""Dependency injection providers for CareerCompass ML Inference Service."""

from fastapi import Depends
from app.services.career_intelligence_service import CareerIntelligenceService
from app.services.career_ontology import CareerOntologyService
from app.services.model_service import ModelService
from app.services.prediction_service import PredictionService
from app.services.project_catalog import ProjectCatalogService
from app.services.project_recommendation_service import ProjectRecommendationService


def get_model_service() -> ModelService:
    """Provides the singleton ModelService instance."""
    return ModelService.get_instance()


def get_prediction_service(
    model_service: ModelService = Depends(get_model_service),
) -> PredictionService:
    """Provides the PredictionService instance with injected ModelService."""
    return PredictionService(model_service=model_service)


def get_career_ontology_service() -> CareerOntologyService:
    """Provides the CareerOntologyService singleton instance."""
    return CareerOntologyService.get_instance()


def get_career_intelligence_service(
    model_service: ModelService = Depends(get_model_service),
    prediction_service: PredictionService = Depends(get_prediction_service),
    ontology_service: CareerOntologyService = Depends(get_career_ontology_service),
) -> CareerIntelligenceService:
    """Provides the CareerIntelligenceService instance with injected dependencies."""
    return CareerIntelligenceService(
        model_service=model_service,
        prediction_service=prediction_service,
        ontology_service=ontology_service,
    )
def get_project_catalog_service() -> ProjectCatalogService:
    """Provides the ProjectCatalogService singleton instance."""
    return ProjectCatalogService.get_instance()


def get_project_recommendation_service(
    catalog_service: ProjectCatalogService = Depends(get_project_catalog_service),
    ontology_service: CareerOntologyService = Depends(get_career_ontology_service),
    model_service: ModelService = Depends(get_model_service),
    prediction_service: PredictionService = Depends(get_prediction_service),
) -> ProjectRecommendationService:
    """Provides the ProjectRecommendationService instance with injected dependencies."""
    return ProjectRecommendationService(
        catalog_service=catalog_service,
        ontology_service=ontology_service,
        model_service=model_service,
        prediction_service=prediction_service,
    )
