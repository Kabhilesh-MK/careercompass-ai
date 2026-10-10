"""CareerCompass AI — FastAPI application entrypoint."""

import sys
from pathlib import Path
from contextlib import asynccontextmanager

# Ensure backend, root, and ml directories are on sys.path regardless of launch cwd
_CURRENT_DIR = Path(__file__).resolve().parent
_BACKEND_DIR = _CURRENT_DIR.parent
_PROJECT_ROOT = _BACKEND_DIR.parent
for _p in [str(_BACKEND_DIR), str(_PROJECT_ROOT), str(_PROJECT_ROOT / "ml")]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from loguru import logger

from app.config import settings
from app.database.connection import connect_db, close_db
from app.database.init_db import ensure_indexes
from app.middleware import register_error_handlers, LoggingMiddleware, SecurityHeadersMiddleware
from app.services.model_service import ModelService
from app.api.routes import health, predictions, career_intelligence

from app.api import (
    auth_routes, profile_routes, skills_routes, resume_routes,
    project_routes, certification_routes, roadmap_routes,
    career_routes, report_routes, settings_routes,
    mentor_routes, admin_routes, ml_routes,
    achievement_routes, notification_routes, favorites_routes,
    progress_routes, resume_analysis_routes, report_export_routes,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.APP_NAME} ({settings.APP_ENV})...")

    # 1. Load ML model artifacts once on startup (Fail Fast)
    try:
        model_service = ModelService.get_instance()
        model_service.load_artifacts()
        logger.info("CareerCompass ML model artifacts loaded and validated successfully.")
    except Exception as exc:
        logger.error(f"Critical startup failure: Could not load ML artifacts: {exc}")
        raise

    # 2. Connect Database (resilient in test/offline modes)
    try:
        await connect_db()
        await ensure_indexes()
        logger.info("MongoDB connected.")
    except Exception as db_err:
        logger.warning(f"MongoDB connection skipped or failed: {db_err}. ML inference service remains active.")

    yield

    # Shutdown
    try:
        await close_db()
        logger.info("MongoDB closed. Goodbye.")
    except Exception:
        pass


app = FastAPI(
    title=settings.APP_NAME,
    version="2.0.0",
    description=(
        "Intelligent Skill Gap Analysis and Career Recommendation System. "
        "The returned probability is the Random Forest model's predicted class "
        "probability and has not been post-hoc calibrated."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS — configured origins only, never wildcard '*'
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
    allow_headers=["*"],
)

# Logging + error handling + security headers
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(LoggingMiddleware)
register_error_handlers(app)

# Static uploads
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Dedicated Phase 3.5 ML API routes under /api/v1
api_v1_router = APIRouter(prefix="/api/v1")
api_v1_router.include_router(health.router)
api_v1_router.include_router(predictions.router)
api_v1_router.include_router(career_intelligence.router)
app.include_router(api_v1_router)

# Legacy application routes
app.include_router(auth_routes.router)
app.include_router(profile_routes.router)
app.include_router(skills_routes.router)
app.include_router(resume_routes.router)
app.include_router(project_routes.router)
app.include_router(certification_routes.router)
app.include_router(roadmap_routes.router)
app.include_router(career_routes.router)
app.include_router(report_routes.router)
app.include_router(settings_routes.router)
app.include_router(mentor_routes.router)
app.include_router(admin_routes.router)
app.include_router(ml_routes.router)

# Phase 4 — advanced features
app.include_router(achievement_routes.router)
app.include_router(notification_routes.router)
app.include_router(favorites_routes.router)
app.include_router(progress_routes.router)
app.include_router(resume_analysis_routes.router)
app.include_router(report_export_routes.router)


@app.get("/", tags=["Health"])
async def root_health():
    return {"status": "ok", "app": settings.APP_NAME, "version": "2.0.0"}
