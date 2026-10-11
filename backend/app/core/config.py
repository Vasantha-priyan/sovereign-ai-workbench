import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Sovereign AI Workbench"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "SOVEREIGN_AI_WORKBENCH_SECRET_KEY_SIH2026_OFFLINE_PROTECTED"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours

    # Environment & Sovereignty Controls
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    EXTERNAL_AI_ENABLED: bool = False # STRICT SOVEREIGNTY REQUIREMENT: 0 EXTERNAL CALLS

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./sovereign_workbench.db")

    # Local AI & Mode
    OFFLINE_MODE: bool = True
    SANDBOX_ENABLED: bool = True
    SANDBOX_NETWORK_DISABLED: bool = True
    
    # Model Server Defaults (Ollama / Local OpenAI Endpoint)
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    DEFAULT_GENERAL_MODEL: str = os.getenv("DEFAULT_GENERAL_MODEL", "qwen2.5:7b-instruct")
    DEFAULT_CODING_MODEL: str = os.getenv("DEFAULT_CODING_MODEL", "qwen2.5-coder:7b")
    DEFAULT_VISION_MODEL: str = os.getenv("DEFAULT_VISION_MODEL", "llama3.2-vision:11b")

    # Storage Paths
    UPLOAD_DIR: str = os.path.join(os.getcwd(), "storage", "uploads")
    DELIVERABLES_DIR: str = os.path.join(os.getcwd(), "storage", "deliverables")
    VECTOR_DB_DIR: str = os.path.join(os.getcwd(), "storage", "vector_db")

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="allow")

settings = Settings()

# Ensure directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.DELIVERABLES_DIR, exist_ok=True)
os.makedirs(settings.VECTOR_DB_DIR, exist_ok=True)
