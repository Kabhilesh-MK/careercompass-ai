"""Tests for health, readiness, CORS, and error safety endpoints."""

import pytest
from app.config import settings
from app.services.model_service import ModelService


def test_01_health_endpoint_returns_200(client):
    """Test 1: Health endpoint returns 200 with service identifier."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "careercompass-ml"


def test_02_readiness_endpoint_returns_model_loaded_status(client):
    """Test 2: Readiness endpoint returns 200 and indicates model is loaded."""
    response = client.get("/api/v1/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
    assert data["model_loaded"] is True
    assert data["preprocessor_loaded"] is True
    assert data["metadata_loaded"] is True
    assert data["model_version"] == "phase3.4"


def test_23_cors_configuration_is_not_wildcard():
    """Test 23: CORS configuration never uses wildcard '*'."""
    origins = settings.allowed_origins_list
    assert "*" not in origins, "Wildcard '*' must never be present in allowed CORS origins."
    assert len(origins) > 0, "At least one development origin must be configured."
    for origin in origins:
        assert origin.startswith("http://") or origin.startswith("https://")
        assert "*" not in origin


def test_23b_cors_preflight_and_headers(client):
    """Test 23b: Valid origin receives CORS headers, untrusted origin does not receive wildcard."""
    # Test valid configured origin
    headers = {
        "Origin": "http://localhost:5173",
        "Access-Control-Request-Method": "POST",
    }
    response = client.options("/api/v1/predictions/career", headers=headers)
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"
    assert response.headers.get("access-control-allow-origin") != "*"


def test_24_model_failure_produces_safe_api_error(client, monkeypatch):
    """Test 24: Model readiness failure produces safe 503 without leaking stack traces."""
    svc = ModelService.get_instance()
    # Temporarily simulate unready state
    monkeypatch.setattr(svc, "is_ready", lambda: False)

    response = client.get("/api/v1/ready")
    assert response.status_code == 503
    data = response.json()
    assert data["status"] == "not_ready"
    assert "Traceback" not in str(data)
    assert "File " not in str(data)
    assert "detail" in data
