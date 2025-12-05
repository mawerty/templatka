"""Application configuration using pydantic-settings."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    database_url: str = "sqlite:///app.db"

    # Server
    debug: bool = True
    api_prefix: str = "/api"

    # CORS
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    # ===========================================
    # FEATURE FLAGS - Enable what you need
    # ===========================================

    # Auth - JWT-based authentication
    enable_auth: bool = True
    jwt_secret: str = "change-me-in-production-use-a-long-random-string"
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24 * 7  # 1 week

    # File Upload
    enable_file_upload: bool = True
    upload_dir: str = "./uploads"
    max_file_size_mb: int = 10
    allowed_extensions: list[str] = [".jpg", ".jpeg", ".png", ".gif", ".pdf", ".txt"]

    # WebSockets
    enable_websockets: bool = True

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
