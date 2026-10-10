"""Tests for prediction API endpoints, validation, normalization, and determinism."""

import math
import pytest


def test_07_prediction_endpoint_accepts_valid_skills(client):
    """Test 7: Prediction endpoint returns 200 for valid input skills."""
    payload = {"skills": ["python", "ai", "programming"]}
    response = client.post("/api/v1/predictions/career", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "prediction" in data
    assert "alternatives" in data
    assert "probabilities" in data
    assert "input" in data
    assert "model" in data


def test_08_prediction_returns_one_of_four_supported_classes(client):
    """Test 8: Prediction returns a valid canonical career track."""
    payload = {"skills": ["python", "ai"]}
    response = client.post("/api/v1/predictions/career", json=payload)
    assert response.status_code == 200
    data = response.json()
    top_track = data["prediction"]["career_track"]
    valid_classes = [
        "AI & Machine Learning Engineering",
        "Cloud, DevOps & Systems Engineering",
        "Data Analytics & Business Intelligence",
        "Software Development & Engineering",
    ]
    assert top_track in valid_classes


def test_09_prediction_returns_all_four_probabilities(client):
    """Test 9: Prediction returns probabilities for ALL 4 supported career tracks."""
    payload = {"skills": ["python", "web_development", "database_systems"]}
    response = client.post("/api/v1/predictions/career", json=payload)
    assert response.status_code == 200
    data = response.json()
    probs = data["probabilities"]
    assert len(probs) == 4
    tracks = [p["career_track"] for p in probs]
    assert len(set(tracks)) == 4


def test_10_probabilities_sum_approximately_to_one(client):
    """Test 10: All 4 predicted probabilities sum to ~1.0 within floating point tolerance."""
    payload = {"skills": ["excel", "communication", "critical_thinking"]}
    response = client.post("/api/v1/predictions/career", json=payload)
    assert response.status_code == 200
    data = response.json()
    total_prob = sum(p["probability"] for p in data["probabilities"])
    assert math.isclose(total_prob, 1.0, abs_tol=1e-3), f"Probabilities sum to {total_prob}, expected ~1.0"


def test_11_probabilities_are_sorted_descending(client):
    """Test 11: Probabilities and alternatives are strictly sorted in descending probability order."""
    payload = {"skills": ["python", "ai", "programming"]}
    response = client.post("/api/v1/predictions/career", json=payload)
    assert response.status_code == 200
    data = response.json()

    prob_values = [p["probability"] for p in data["probabilities"]]
    assert prob_values == sorted(prob_values, reverse=True), "Probabilities must be sorted descending."

    alt_values = [a["probability"] for a in data["alternatives"]]
    assert alt_values == sorted(alt_values, reverse=True), "Alternatives must be sorted descending."
    assert len(data["alternatives"]) == 3


def test_12_top_prediction_equals_highest_probability(client):
    """Test 12: Top prediction matches the maximum predicted probability in probabilities list."""
    payload = {"skills": ["python", "ai"]}
    response = client.post("/api/v1/predictions/career", json=payload)
    assert response.status_code == 200
    data = response.json()

    top_pred = data["prediction"]
    highest_prob_item = data["probabilities"][0]
    assert top_pred["career_track"] == highest_prob_item["career_track"]
    assert top_pred["probability"] == highest_prob_item["probability"]


def test_13_duplicate_skills_are_normalized(client):
    """Test 13: Duplicate skills in input are deduplicated while preserving order."""
    payload = {"skills": ["python", "python", "ai", "python"]}
    response = client.post("/api/v1/predictions/career", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["input"]["recognized_skills"] == ["python", "ai"]


def test_14_whitespace_and_case_normalization(client):
    """Test 14: Input skills undergo consistent whitespace stripping and casing normalization."""
    payload = {"skills": [" Python ", "python", "AI", "", "Programming"]}
    response = client.post("/api/v1/predictions/career", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["input"]["recognized_skills"] == ["python", "ai", "programming"]


def test_15_unknown_skills_are_reported(client):
    """Test 15: Unknown skills are partitioned and explicitly returned in input summary."""
    payload = {"skills": ["python", "rust", "kubernetes", "ai"]}
    response = client.post("/api/v1/predictions/career", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "python" in data["input"]["recognized_skills"]
    assert "ai" in data["input"]["recognized_skills"]
    assert "rust" in data["input"]["unknown_skills"]
    assert "kubernetes" in data["input"]["unknown_skills"]


def test_16_empty_skills_are_rejected(client):
    """Test 16: Empty skills list is rejected with HTTP 422."""
    payload = {"skills": []}
    response = client.post("/api/v1/predictions/career", json=payload)
    assert response.status_code == 422


def test_17_no_recognized_skills_rejected(client):
    """Test 17: Skills payload with zero recognized skills is rejected with HTTP 422."""
    payload = {"skills": ["unknown_skill_xyz", "unrecognized_tool_123"]}
    response = client.post("/api/v1/predictions/career", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data
    assert "None of the provided skills match the model vocabulary" in str(data)


def test_18_malformed_input_rejected(client):
    """Test 18: Malformed input (wrong types, non-string items) is rejected with HTTP 422."""
    # Skills not a list
    response = client.post("/api/v1/predictions/career", json={"skills": "python"})
    assert response.status_code == 422

    # Skills containing numbers
    response = client.post("/api/v1/predictions/career", json={"skills": [123, 456]})
    assert response.status_code == 422

    # Missing skills key
    response = client.post("/api/v1/predictions/career", json={"wrong_key": ["python"]})
    assert response.status_code == 422

    # Excessive skill list length (> 100 items)
    excessive_skills = [f"skill_{i}" for i in range(101)]
    response = client.post("/api/v1/predictions/career", json={"skills": excessive_skills})
    assert response.status_code == 422
    assert "cannot exceed 100 items" in response.text

    # Excessive skill string length (> 100 chars)
    long_skill = "a" * 101
    response = client.post("/api/v1/predictions/career", json={"skills": [long_skill]})
    assert response.status_code == 422
    assert "cannot exceed 100 characters" in response.text


def test_25_deterministic_identical_input_produces_identical_output(client):
    """Test 25: Identical input payloads produce exactly identical outputs and probabilities."""
    payload = {"skills": ["python", "ai", "programming"]}
    res1 = client.post("/api/v1/predictions/career", json=payload).json()
    res2 = client.post("/api/v1/predictions/career", json=payload).json()

    assert res1["prediction"] == res2["prediction"]
    assert res1["probabilities"] == res2["probabilities"]
    assert res1["alternatives"] == res2["alternatives"]
    assert res1["input"] == res2["input"]


def test_canonical_skills_vocabulary_endpoint(client):
    """Test that GET /api/v1/predictions/career/skills returns all 29 canonical skills."""
    response = client.get("/api/v1/predictions/career/skills")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 29
    assert len(data["skills"]) == 29
    assert data["skills"] == sorted(data["skills"])
    assert data["model_version"] == "phase3.4"
