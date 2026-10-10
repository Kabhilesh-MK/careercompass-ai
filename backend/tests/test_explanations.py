"""
CareerCompass — Phase 4 Backend Tests
Validates the Local Prediction Explanation endpoint (/api/v1/predictions/career/explain)
and ensures strict non-causal attribution, vocabulary enforcement, determinism,
and model state immutability.
"""

import pytest


def test_01_explanation_endpoint_accepts_valid_skills(client):
    """Scenario 1: Explanation endpoint accepts valid recognized skills and returns HTTP 200."""
    response = client.post(
        "/api/v1/predictions/career/explain",
        json={"skills": ["python", "ai", "programming"]},
    )
    assert response.status_code == 200
    data = response.json()
    assert "prediction" in data
    assert "explanation_method" in data
    assert "features" in data
    assert "input" in data
    assert "model" in data


def test_02_explanation_returns_predicted_class(client):
    """Scenario 2: Explanation returns the predicted class and a valid probability."""
    response = client.post(
        "/api/v1/predictions/career/explain",
        json={"skills": ["python", "ai", "programming"]},
    )
    assert response.status_code == 200
    data = response.json()
    pred = data["prediction"]
    assert pred["career_track"] == "AI & Machine Learning Engineering"
    assert isinstance(pred["probability"], float)
    assert 0.0 <= pred["probability"] <= 1.0
    assert pred["probability"] > 0.5


def test_03_explanation_prediction_matches_normal_prediction_endpoint(client):
    """Scenario 3: Explanation prediction matches normal prediction endpoint exactly."""
    payload = {"skills": ["python", "web_development", "database_systems"]}

    pred_res = client.post("/api/v1/predictions/career", json=payload)
    exp_res = client.post("/api/v1/predictions/career/explain", json=payload)

    assert pred_res.status_code == 200
    assert exp_res.status_code == 200

    pred_data = pred_res.json()
    exp_data = exp_res.json()

    assert exp_data["prediction"]["career_track"] == pred_data["prediction"]["career_track"]
    assert exp_data["prediction"]["probability"] == pred_data["prediction"]["probability"]
    assert exp_data["input"]["recognized_skills"] == pred_data["input"]["recognized_skills"]
    assert exp_data["input"]["unknown_skills"] == pred_data["input"]["unknown_skills"]


def test_04_explanation_uses_recognized_skills(client):
    """Scenario 4: Explanation audit reflects recognized skills correctly."""
    response = client.post(
        "/api/v1/predictions/career/explain",
        json={"skills": ["excel", "communication", "critical_thinking"]},
    )
    assert response.status_code == 200
    data = response.json()
    recognized = data["input"]["recognized_skills"]
    assert set(recognized) == {"excel", "communication", "critical_thinking"}
    assert data["input"]["unknown_skills"] == []


def test_05_unknown_skills_are_reported_in_input_audit(client):
    """Scenario 5: Unknown skills are partitioned and reported in unknown_skills."""
    response = client.post(
        "/api/v1/predictions/career/explain",
        json={"skills": ["unknown_skill_xyz", "python", "quantum_wizardry_123"]},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["input"]["recognized_skills"] == ["python"]
    assert "unknown_skill_xyz" in data["input"]["unknown_skills"]
    assert "quantum_wizardry_123" in data["input"]["unknown_skills"]


def test_06_empty_skills_rejected(client):
    """Scenario 6: Empty skill list is rejected with HTTP 422."""
    response = client.post(
        "/api/v1/predictions/career/explain",
        json={"skills": []},
    )
    assert response.status_code == 422


def test_07_no_recognized_skills_rejected(client):
    """Scenario 7: Request with zero recognized skills is rejected with HTTP 422."""
    response = client.post(
        "/api/v1/predictions/career/explain",
        json={"skills": ["unknown_one", "unknown_two", "fake_nonexistent_skill"]},
    )
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data or "message" in data


def test_08_explanation_method_reported_correctly(client):
    """Scenario 8: Explanation method reports TreeExplainer (or TreePathAttribution fallback)."""
    response = client.post(
        "/api/v1/predictions/career/explain",
        json={"skills": ["python", "ai"]},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["explanation_method"] in ["TreeExplainer", "TreePathAttribution"]


def test_09_returned_feature_names_belong_to_29_skill_vocabulary(client, initialize_model_service):
    """Scenario 9: Every returned feature corresponds to a canonical skill in the 29-feature vocabulary."""
    vocab_set = set(initialize_model_service.get_canonical_vocabulary())
    assert len(vocab_set) == 29

    response = client.post(
        "/api/v1/predictions/career/explain",
        json={"skills": ["python", "ai", "programming"]},
    )
    assert response.status_code == 200
    data = response.json()

    features = data["features"]
    assert len(features) > 0

    for feat in features:
        assert feat["skill"] in vocab_set
        assert isinstance(feat["present"], bool)
        assert feat["direction"] in ["supports", "opposes", "neutral"]
        assert isinstance(feat["contribution"], (float, int))


def test_10_no_unknown_skill_appears_as_a_model_feature(client):
    """Scenario 10: Unknown skills never appear in model feature attributions."""
    response = client.post(
        "/api/v1/predictions/career/explain",
        json={"skills": ["unknown_skill_xyz", "python"]},
    )
    assert response.status_code == 200
    data = response.json()

    feature_skills = [f["skill"] for f in data["features"]]
    assert "unknown_skill_xyz" not in feature_skills
    assert "python" in feature_skills


def test_11_explanation_is_deterministic_for_identical_input(client):
    """Scenario 11: Consecutive identical calls yield strictly identical feature attributions."""
    payload = {"skills": ["python", "ai", "programming"]}

    res1 = client.post("/api/v1/predictions/career/explain", json=payload)
    res2 = client.post("/api/v1/predictions/career/explain", json=payload)

    assert res1.status_code == 200
    assert res2.status_code == 200

    assert res1.json() == res2.json()


def test_12_model_is_never_fitted_during_explanation(client, initialize_model_service):
    """Scenario 12: Model and preprocessor remain strictly unchanged with no fit invocations."""
    svc = initialize_model_service
    rf_model = svc.model
    estimators_before = [id(tree) for tree in rf_model.estimators_]

    response = client.post(
        "/api/v1/predictions/career/explain",
        json={"skills": ["python", "cad", "programming"]},
    )
    assert response.status_code == 200

    estimators_after = [id(tree) for tree in rf_model.estimators_]
    assert estimators_before == estimators_after, "RandomForest estimators must not be re-fitted or reallocated."


def test_13_explanation_does_not_modify_model_state(client, initialize_model_service):
    """Scenario 13: ModelService properties and classes remain immutable before and after explain."""
    svc = initialize_model_service
    classes_before = list(svc.classes_)
    vocab_before = list(svc.canonical_vocabulary)

    _ = client.post(
        "/api/v1/predictions/career/explain",
        json={"skills": ["excel", "communication"]},
    )

    assert svc.classes_ == classes_before
    assert svc.canonical_vocabulary == vocab_before
