"""
Application Configuration
Centralized settings management using Pydantic Settings
"""
from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List
from functools import lru_cache
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # ---- App ----
    APP_NAME: str = "ProductivityTracker"
    APP_ENV: str = "development"
    APP_DEBUG: bool = True
    APP_VERSION: str = "1.0.0"

    # ---- API ----
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    API_WORKERS: int = 4
    API_CORS_ORIGINS: str = "*"

    # ---- JWT ----
    JWT_SECRET_KEY: str = "dev-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ---- Database ----
    # Default to SQLite for local development so the app works without PostgreSQL
    DATABASE_URL: str = "sqlite+aiosqlite:///./productivity_tracker.db"

    # ---- Redis ----
    REDIS_URL: str = "redis://localhost:6379/0"

    # ---- Screenshots ----
    SCREENSHOT_STORAGE: str = "local"
    SCREENSHOT_PATH: str = "./uploads/screenshots"
    SCREENSHOT_ENCRYPTION_KEY: str = "dev-encryption-key-32bytes!!"
    SCREENSHOT_MAX_SIZE_MB: int = 5
    SCREENSHOT_QUALITY: int = 70
    SCREENSHOT_INTERVAL_SECONDS: int = 300

    # ---- AI ----
    AI_MODEL_PATH: str = "./models"
    AI_ANALYSIS_INTERVAL_MINUTES: int = 60

    # ---- Email ----
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""

    @property
    def IS_SQLITE(self) -> bool:
        """Check if using SQLite database."""
        return "sqlite" in self.DATABASE_URL

    @property
    def CORS_ORIGINS(self) -> List[str]:
        return [origin.strip() for origin in self.API_CORS_ORIGINS.split(",")]

    @property
    def SYNC_DATABASE_URL(self) -> str:
        if self.IS_SQLITE:
            return self.DATABASE_URL.replace("+aiosqlite", "")
        return self.DATABASE_URL.replace("+asyncpg", "")

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance."""
    return Settings()


settings = get_settings()
