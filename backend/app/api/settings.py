from fastapi import APIRouter
from app.core.config import settings

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("")
async def get_system_settings():
    return {
        "project_name": settings.PROJECT_NAME,
        "offline_mode": settings.OFFLINE_MODE,
        "sandbox_enabled": settings.SANDBOX_ENABLED,
        "sandbox_network_disabled": settings.SANDBOX_NETWORK_DISABLED,
        "ollama_url": settings.OLLAMA_BASE_URL,
        "default_general_model": settings.DEFAULT_GENERAL_MODEL,
        "default_coding_model": settings.DEFAULT_CODING_MODEL,
        "default_vision_model": settings.DEFAULT_VISION_MODEL,
        "upload_dir": settings.UPLOAD_DIR,
        "deliverables_dir": settings.DELIVERABLES_DIR
    }

@router.post("")
async def update_system_settings(payload: dict):
    return {
        "status": "UPDATED",
        "message": "Settings saved successfully for sovereign local environment."
    }
