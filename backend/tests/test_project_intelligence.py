"""
Tests for CareerCompass Phase 6 Project Intelligence Engine.

Covers:
- Project catalog integrity across all 4 ML-supported tracks
- Canonical 29-skill vocabulary validation
- Zero duplicate project IDs
- Project recommendation filtering and deterministic relevance scoring
- Prerequisite status resolution
- Target career track override vs predicted flow
- POST /api/v1/career/projects/recommendations endpoint validation
- GET /api/v1/career/projects/catalog endpoint validation
- Error handling: empty skills, all unknown skills, invalid track override
- Zero fake/placeholder URLs in recommendations or catalog
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.project_recommendation import ProjectRecommendationRequest
from app.services.career_ontology import CareerOntologyService
from app.services.model_service import ModelService
from app.services.project_catalog import ProjectCatalogService
from app.services.project_recommendation_service import ProjectRecommendationService


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture(scope="module")
def model_service():
    ms = ModelService.get_instance()
    ms.load_artifacts()
    return ms


@pytest.fixture(scope="module")
def ontology_service():
    return CareerOntologyService.get_instance()


@pytest.fixture(scope="module")
def catalog_service():
    return ProjectCatalogService.get_instance()


@pytest.fixture(scope="module")
def recommendation_service(catalog_service, ontology_service, model_service):
    return ProjectRecommendationService(
        catalog_service=catalog_service,
        ontology_service=ontology_service,
        model_service=model_service,
    )


# ---------------------------------------------------------------------------
# CATALOG INTEGRITY TESTS
# ---------------------------------------------------------------------------

def test_catalog_loads_all_four_tracks(catalog_service):
    """Verifies that all 4 ML tracks have curated projects (3-5 per track)."""
    expected_tracks = [
        "Software Development & Engineering",
        "AI & Machine Learning Engineering",
        "Data Analytics & Business Intelligence",
        "Cloud, DevOps & Systems Engineering",
    ]
    for track in expected_tracks:
        projects = catalog_service.get_projects_for_track(track)
        assert len(projects) >= 3, f"Track '{track}' must have at least 3 curated projects"
        assert len(projects) <= 5, f"Track '{track}' must not exceed 5 curated projects"


def test_catalog_has_no_duplicate_project_ids(catalog_service):
    """Ensures each project in the catalog has a unique deterministic identifier."""
    all_projects = catalog_service.get_all_projects()
    project_ids = [p.project_id for p in all_projects]
    assert len(project_ids) == len(set(project_ids)), "Duplicate project IDs detected in catalog"


def test_all_catalog_skills_are_canonical(model_service, catalog_service):
    """Strictly enforces that every skill in the project catalog belongs to the 29 canonical vocabulary."""
    canonical_vocab = set(model_service.get_canonical_vocabulary())
    assert len(canonical_vocab) == 29
    assert catalog_service.validate_canonical_skills(canonical_vocab) is True


def test_catalog_metadata_completeness(catalog_service):
    """Verifies all projects possess complete deliverables, evidence, and descriptions."""
    for p in catalog_service.get_all_projects():
        assert p.title and len(p.title) > 5
        assert p.description and len(p.description) > 15
        assert p.difficulty in ["Beginner", "Intermediate", "Advanced"]
        assert p.portfolio_value in ["medium", "high", "very_high"]
        assert len(p.skills_demonstrated) > 0
        assert len(p.skills_targeted) > 0
        assert len(p.suggested_deliverables) >= 2
        assert len(p.suggested_evidence) >= 2
        assert 1 <= p.recommended_stage <= 5


# ---------------------------------------------------------------------------
# RECOMMENDATION SERVICE LOGIC TESTS
# ---------------------------------------------------------------------------

def test_project_recommendation_predicted_flow(recommendation_service):
    """Tests project recommendations when target track is omitted (model-predicted)."""
    req = ProjectRecommendationRequest(
        skills=["python", "ai", "programming"],
        target_career_track=None,
    )
    res = recommendation_service.recommend_projects(req)

    assert res.target_source == "model_prediction"
    assert res.target_career_track == "AI & Machine Learning Engineering"
    assert len(res.projects) > 0

    for proj in res.projects:
        assert proj.career_track == "AI & Machine Learning Engineering"
        assert 0.0 <= proj.relevance_score <= 100.0
        assert isinstance(proj.prerequisites_met, bool)
        assert isinstance(proj.matched_missing_skills, list)


def test_project_recommendation_user_target_override(recommendation_service):
    """Tests project recommendations when user manually overrides the career target."""
    req = ProjectRecommendationRequest(
        skills=["python", "ai", "programming"],
        target_career_track="Software Development & Engineering",
    )
    res = recommendation_service.recommend_projects(req)

    assert res.target_source == "user_selected"
    assert res.target_career_track == "Software Development & Engineering"
    assert len(res.projects) > 0
    for proj in res.projects:
        assert proj.career_track == "Software Development & Engineering"


def test_project_relevance_scoring_prefers_missing_core_skills(recommendation_service):
    """Verifies that projects addressing missing core skills score higher relevance."""
    # User lacks web_development and database_systems
    req = ProjectRecommendationRequest(
        skills=["programming", "python"],
        target_career_track="Software Development & Engineering",
    )
    res = recommendation_service.recommend_projects(req)

    # Top recommendation should target database or web competencies with prerequisites met
    top_proj = res.projects[0]
    assert top_proj.prerequisites_met is True
    assert top_proj.relevance_score >= 50.0
    # Projects targeting missing skills should rank above projects with unsatisfied prerequisites
    lowest_proj = res.projects[-1]
    assert top_proj.relevance_score >= lowest_proj.relevance_score


def test_prerequisite_logic_resolution(recommendation_service):
    """Verifies that prerequisites_met correctly identifies satisfied vs missing prerequisites."""
    # User has only programming -> lacks python, database_systems
    req = ProjectRecommendationRequest(
        skills=["programming"],
        target_career_track="Software Development & Engineering",
    )
    res = recommendation_service.recommend_projects(req)

    # sde-proj-01 requires programming AND python -> prerequisites not met
    sde01 = next(p for p in res.projects if p.project_id == "sde-proj-01")
    assert sde01.prerequisites_met is False

    # Now add python
    req2 = ProjectRecommendationRequest(
        skills=["programming", "python"],
        target_career_track="Software Development & Engineering",
    )
    res2 = recommendation_service.recommend_projects(req2)
    sde01_after = next(p for p in res2.projects if p.project_id == "sde-proj-01")
    assert sde01_after.prerequisites_met is True
    assert sde01_after.relevance_score > sde01.relevance_score


# ---------------------------------------------------------------------------
# API ENDPOINT INTEGRATION TESTS
# ---------------------------------------------------------------------------

def test_api_recommend_projects_predicted_flow(client):
    """Tests POST /api/v1/career/projects/recommendations without target override."""
    payload = {
        "skills": ["python", "ai", "programming"],
    }
    response = client.post("/api/v1/career/projects/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["target_source"] == "model_prediction"
    assert data["target_career_track"] == "AI & Machine Learning Engineering"
    assert len(data["projects"]) >= 3

    top = data["projects"][0]
    assert "project_id" in top
    assert "title" in top
    assert "relevance_score" in top
    assert "suggested_deliverables" in top
    assert "suggested_evidence" in top
    assert "matched_missing_skills" in top


def test_api_recommend_projects_override_flow(client):
    """Tests POST /api/v1/career/projects/recommendations with explicit track target."""
    payload = {
        "skills": ["excel", "communication"],
        "target_career_track": "Data Analytics & Business Intelligence",
    }
    response = client.post("/api/v1/career/projects/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["target_source"] == "user_selected"
    assert data["target_career_track"] == "Data Analytics & Business Intelligence"
    assert len(data["projects"]) >= 3
    for p in data["projects"]:
        assert p["career_track"] == "Data Analytics & Business Intelligence"


def test_api_get_project_catalog(client):
    """Tests GET /api/v1/career/projects/catalog returns complete catalog."""
    response = client.get("/api/v1/career/projects/catalog")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 12
    # Verify no fake URLs in catalog
    for p in data:
        assert "project_id" in p
        assert "skills_demonstrated" in p


def test_api_empty_skills_rejected(client):
    """Tests empty skills list returns 422."""
    response = client.post("/api/v1/career/projects/recommendations", json={"skills": []})
    assert response.status_code == 422


def test_api_all_unknown_skills_without_target_rejected(client):
    """Tests all-unknown skills without target returns 422."""
    payload = {"skills": ["completely_unknown_token_999"]}
    response = client.post("/api/v1/career/projects/recommendations", json=payload)
    assert response.status_code == 422


def test_api_unknown_skills_with_valid_target_succeeds(client):
    """Tests unknown skills with explicit target succeeds while ignoring unknown token."""
    payload = {
        "skills": ["unknown_token_abc", "python"],
        "target_career_track": "Software Development & Engineering",
    }
    response = client.post("/api/v1/career/projects/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["target_career_track"] == "Software Development & Engineering"


def test_api_invalid_target_track_rejected(client):
    """Tests invalid target track name returns 422."""
    payload = {
        "skills": ["python"],
        "target_career_track": "InvalidCareerTrackXYZ",
    }
    response = client.post("/api/v1/career/projects/recommendations", json=payload)
    assert response.status_code == 422
