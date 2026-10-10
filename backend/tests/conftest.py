"""Pytest configuration and shared fixtures for backend tests."""

import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Ensure backend, project root, and ml are on sys.path
TEST_DIR = Path(__file__).resolve().parent
BACKEND_DIR = TEST_DIR.parent
PROJECT_ROOT = BACKEND_DIR.parent

for p in [str(BACKEND_DIR), str(PROJECT_ROOT), str(PROJECT_ROOT / "ml")]:
    if p not in sys.path:
        sys.path.insert(0, p)

from app.config import settings
from app.services.model_service import ModelService
from app.main import app


@pytest.fixture(scope="session", autouse=True)
def initialize_model_service():
    """Ensure ModelService is initialized once for the test session."""
    svc = ModelService.get_instance()
    svc.load_artifacts()
    return svc


@pytest.fixture(scope="session")
def client(initialize_model_service):
    """Provides a TestClient for making API requests."""
    with TestClient(app) as test_client:
        yield test_client
