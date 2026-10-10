"""
Tests for CareerCompass Phase 5 Career Intelligence Engine.

Covers:
- Ontology structure & canonical 29-skill compliance for all 4 ML tracks
- Skill gap analysis, coverage calculation, and deterministic prioritization
- Prerequisite status resolution
- 5-stage roadmap generation and milestone statuses
- Learning recommendation mapping to curated catalog
- POST /api/v1/career/intelligence endpoint with predicted and user-selected targets
- GET /api/v1/career/ontology endpoint
- Error handling: empty skills, all-unknown skills, invalid track override
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.career_intelligence import CareerIntelligenceRequest
from app.services.career_intelligence_service import CareerIntelligenceService
from app.services.career_ontology import CareerOntologyService
from app.services.learning_recommendation_service import LearningRecommendationService
from app.services.model_service import ModelService
from app.services.roadmap_service import RoadmapService
from app.services.skill_gap_service import SkillGapService


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
def intelligence_service(model_service, ontology_service):
    return CareerIntelligenceService(
        model_service=model_service,
        ontology_service=ontology_service,
    )


# ---------------------------------------------------------------------------
# ONTOLOGY TESTS
# ---------------------------------------------------------------------------

def test_ontology_loads_all_four_ml_tracks(ontology_service):
    """Verifies that all 4 ML-supported tracks exist in the ontology."""
    tracks = ontology_service.get_supported_tracks()
    expected = [
        "Software Development & Engineering",
        "AI & Machine Learning Engineering",
        "Data Analytics & Business Intelligence",
        "Cloud, DevOps & Systems Engineering",
    ]
    assert len(tracks) == 4
    for t in expected:
        assert t in tracks


def test_all_ontology_skills_belong_to_canonical_vocabulary(model_service, ontology_service):
    """Strictly enforces that zero non-canonical skills are in any track ontology."""
    canonical_vocab = set(model_service.get_canonical_vocabulary())
    assert len(canonical_vocab) == 29
    assert ontology_service.validate_against_canonical_vocabulary(canonical_vocab) is True


def test_required_skills_are_deterministic(ontology_service):
    """Verifies that required skills are deterministically returned in order."""
    skills_sde = ontology_service.get_required_skills("Software Development & Engineering")
    assert skills_sde == [
        "programming",
        "python",
        "database_systems",
        "database_design",
        "web_development",
        "critical_thinking",
        "cloud",
        "design",
        "team_management",
        "design_optimization",
        "simulation",
    ]
    assert len(skills_sde) == 11


def test_ontology_tiers_and_prerequisites(ontology_service):
    """Tests core/supporting/advanced partitioning and prerequisite relationships."""
    ai_core = ontology_service.get_core_skills("AI & Machine Learning Engineering")
    assert "machine_learning" in ai_core
    assert "python" in ai_core
    assert "ai" in ai_core

    prereqs = ontology_service.get_prerequisites("AI & Machine Learning Engineering", "machine_learning")
    assert "python" in prereqs
    assert "data_analysis" in prereqs


# ---------------------------------------------------------------------------
# SKILL GAP & COVERAGE TESTS
# ---------------------------------------------------------------------------

def test_skill_gap_and_coverage_calculation(ontology_service):
    """Verifies required skills, present skills, missing skills, and coverage mathematics."""
    gap_service = SkillGapService(ontology_service)
    recognized = ["programming", "python", "database_systems"]
    track = "Software Development & Engineering"

    (
        required,
        present,
        missing,
        coverage,
        prioritized_gaps,
    ) = gap_service.analyze_gaps(recognized, track)

    assert set(present) == {"programming", "python", "database_systems"}
    assert len(present) == 3
    assert len(required) == 11
    assert len(missing) == 8
    # Coverage calculation: 3 / 11 = 0.2727, percentage = 27.3%
    assert coverage.present_count == 3
    assert coverage.required_count == 11
    assert coverage.decimal == 0.2727
    assert coverage.percentage == 27.3


def test_prioritized_gaps_prerequisite_logic(ontology_service):
    """Verifies that prerequisites_met is calculated correctly for missing skills."""
    gap_service = SkillGapService(ontology_service)
    # python and data_analysis are present -> machine_learning prereqs met!
    recognized = ["programming", "python", "data_analysis"]
    track = "AI & Machine Learning Engineering"

    (
        required,
        present,
        missing,
        coverage,
        prioritized_gaps,
    ) = gap_service.analyze_gaps(recognized, track)

    ml_gap = next((g for g in prioritized_gaps if g.skill == "machine_learning"), None)
    assert ml_gap is not None
    assert ml_gap.priority == "core"
    assert ml_gap.prerequisites_met is True

    # ai has machine_learning as prerequisite -> not met yet
    ai_gap = next((g for g in prioritized_gaps if g.skill == "ai"), None)
    assert ai_gap is not None
    assert ai_gap.prerequisites_met is False

    # Gaps with satisfied prereqs should be ordered before dependent gaps within same tier
    assert ml_gap.recommended_order < ai_gap.recommended_order


# ---------------------------------------------------------------------------
# ROADMAP TESTS
# ---------------------------------------------------------------------------

def test_roadmap_generation_stages_and_statuses(ontology_service):
    """Verifies deterministic 5-stage roadmap structure and milestone completion."""
    roadmap_service = RoadmapService(ontology_service)
    recognized = ["programming", "python"]
    track = "Software Development & Engineering"

    items = roadmap_service.generate_roadmap(track, recognized)
    assert len(items) == 11

    stages_found = {item.stage for item in items}
    assert stages_found == {1, 2, 3, 4, 5}

    prog_item = next(i for i in items if i.skill == "programming")
    assert prog_item.status == "completed"
    assert prog_item.stage == 1

    web_item = next(i for i in items if i.skill == "web_development")
    assert web_item.status == "not_started"
    assert web_item.stage == 2
    assert web_item.prerequisites == ["programming"]
    assert web_item.prerequisites_met is True


# ---------------------------------------------------------------------------
# LEARNING RECOMMENDATIONS TESTS
# ---------------------------------------------------------------------------

def test_learning_recommendation_mapping(ontology_service):
    """Verifies missing skills map to curated catalog resources."""
    gap_service = SkillGapService(ontology_service)
    learning_service = LearningRecommendationService(ontology_service)

    recognized = ["programming"]
    track = "AI & Machine Learning Engineering"
    _, _, _, _, gaps = gap_service.analyze_gaps(recognized, track)

    recs = learning_service.get_recommendations_for_gaps(track, gaps)
    assert len(recs) > 0

    skills_in_recs = {r.skill for r in recs}
    assert "python" in skills_in_recs
    assert "machine_learning" in skills_in_recs

    py_rec = next(r for r in recs if r.skill == "python")
    assert py_rec.provider == "Coursera"
    assert py_rec.difficulty == "Beginner"

    # Verify Step 2 requirement: zero placeholder example.com URLs
    for r in recs:
        assert r.url is None or "example.com" not in r.url
        assert isinstance(r.prerequisites, list)
        assert isinstance(r.prerequisites_met, bool)


# ---------------------------------------------------------------------------
# API ENDPOINT INTEGRATION TESTS
# ---------------------------------------------------------------------------

def test_api_predicted_target_flow(client):
    """Tests POST /api/v1/career/intelligence when target_career_track is omitted."""
    payload = {
        "skills": ["python", "ai", "programming"],
        "target_career_track": None,
    }
    response = client.post("/api/v1/career/intelligence", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["target_source"] == "model_prediction"
    assert data["target_career_track"] == "AI & Machine Learning Engineering"
    assert data["prediction"] is not None
    assert data["prediction"]["career_track"] == "AI & Machine Learning Engineering"
    assert data["prediction"]["probability"] > 0.0
    assert len(data["recognized_skills"]) == 3
    assert len(data["unknown_skills"]) == 0
    assert "required_skill_coverage" in data
    assert data["required_skill_coverage"]["percentage"] > 0.0
    assert len(data["prioritized_gaps"]) > 0
    assert len(data["roadmap"]) > 0
    assert len(data["learning_recommendations"]) > 0


def test_api_user_selected_target_override(client):
    """Tests POST /api/v1/career/intelligence with manual career target override."""
    payload = {
        "skills": ["python", "ai", "programming"],
        "target_career_track": "Software Development & Engineering",
    }
    response = client.post("/api/v1/career/intelligence", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["target_source"] == "user_selected"
    assert data["target_career_track"] == "Software Development & Engineering"
    # Real ML prediction is still preserved and visible separately
    assert data["prediction"] is not None
    assert data["prediction"]["career_track"] == "AI & Machine Learning Engineering"
    # Skill gaps and roadmap must adhere to the user-selected target
    assert "web_development" in data["required_skills"]


def test_api_unknown_skills_reported_cleanly(client):
    """Tests unknown skill tokens are partitioned without breaking real ML prediction."""
    payload = {
        "skills": ["unknown_skill_xyz", "python", "custom_framework_abc"],
    }
    response = client.post("/api/v1/career/intelligence", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "python" in data["recognized_skills"]
    assert "unknown_skill_xyz" in data["unknown_skills"]
    assert "custom_framework_abc" in data["unknown_skills"]
    assert data["prediction"] is not None


def test_api_empty_skills_returns_422(client):
    """Tests empty skills list is rejected with HTTP 422."""
    response = client.post("/api/v1/career/intelligence", json={"skills": []})
    assert response.status_code == 422


def test_api_invalid_career_track_returns_422(client):
    """Tests invalid career track override is rejected with HTTP 422."""
    payload = {
        "skills": ["python"],
        "target_career_track": "NonExistentTrack123",
    }
    response = client.post("/api/v1/career/intelligence", json=payload)
    assert response.status_code == 422


def test_api_get_career_ontology(client):
    """Tests GET /api/v1/career/ontology returns all 4 tracks and metadata."""
    response = client.get("/api/v1/career/ontology")
    assert response.status_code == 200
    data = response.json()
    assert "tracks" in data
    assert len(data["supported_track_names"]) == 4
    assert "Software Development & Engineering" in data["tracks"]
    sde = data["tracks"]["Software Development & Engineering"]
    assert "programming" in sde["core_skills"]
