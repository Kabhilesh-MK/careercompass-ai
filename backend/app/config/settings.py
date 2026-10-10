"""Centralized application settings loaded from environment variables."""

from functools import lru_cache
from pathlib import Path
from typing import List, Optional

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
PROJECT_ROOT_DEFAULT = BACKEND_DIR.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "career_compass_ai"

    # JWT
    JWT_SECRET_KEY: str = "change-me"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_EXPIRE_MINUTES: int = 60
    JWT_REFRESH_EXPIRE_DAYS: int = 7

    # CORS
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"
    CORS_ORIGINS: Optional[str] = None

    # Uploads
    UPLOAD_DIR: str = str(BACKEND_DIR / "app" / "uploads")
    MAX_UPLOAD_SIZE_MB: int = 5

    # SMTP (optional — for email reports)
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    FROM_EMAIL: str = ""

    # App
    APP_NAME: str = "CareerCompass AI"
    APP_ENV: str = "development"
    APP_DEBUG: bool = True
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    LOG_LEVEL: str = "INFO"

    # ML Configuration
    PROJECT_ROOT: str = str(PROJECT_ROOT_DEFAULT)
    ML_MODELS_DIR: Optional[str] = None
    ML_MODEL_FILENAME: str = "careercompass_phase3_4_model.joblib"
    ML_PREPROCESSOR_FILENAME: str = "careercompass_phase3_4_preprocessor.joblib"
    ML_METADATA_FILENAME: str = "careercompass_phase3_4_metadata.json"

    @property
    def project_root_path(self) -> Path:
        return Path(self.PROJECT_ROOT).resolve()

    @property
    def ml_models_dir_path(self) -> Path:
        if self.ML_MODELS_DIR:
            return Path(self.ML_MODELS_DIR).resolve()
        return self.project_root_path / "ml" / "models"

    @property
    def ml_model_path(self) -> Path:
        return self.ml_models_dir_path / self.ML_MODEL_FILENAME

    @property
    def ml_preprocessor_path(self) -> Path:
        return self.ml_models_dir_path / self.ML_PREPROCESSOR_FILENAME

    @property
    def ml_metadata_path(self) -> Path:
        return self.ml_models_dir_path / self.ML_METADATA_FILENAME

    @property
    def allowed_origins_list(self) -> List[str]:
        origins = set()
        for source in [self.CORS_ORIGINS, self.FRONTEND_ORIGIN, self.ALLOWED_ORIGINS]:
            if source:
                for o in source.split(","):
                    cleaned = o.strip().rstrip("/")
                    if cleaned and cleaned != "*":
                        origins.add(cleaned)
        if not origins:
            return ["http://localhost:5173"]
        return sorted(list(origins))

    @field_validator("APP_DEBUG", mode="before")
    @classmethod
    def _parse_bool(cls, v):
        if isinstance(v, str):
            return v.lower() in ("1", "true", "yes", "on")
        return bool(v)


@lru_cache
def get_settings() -> Settings:
    s = Settings()
    # Ensure upload directory exists
    Path(s.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
    return s


settings = get_settings()
