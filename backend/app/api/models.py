from typing import List, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.db.models import AIModel
from app.schemas import AIModelResponse
from app.services.llm.router import select_model_for_prompt

router = APIRouter(prefix="", tags=["AI Models"])

class RoutePromptPayload(BaseModel):
    prompt: str

@router.get("/models", response_model=List[AIModelResponse])
@router.get("/ai-models", response_model=List[AIModelResponse])
async def list_models(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(AIModel).order_by(AIModel.is_default.desc()))
    models = res.scalars().all()
    if not models:
        # Fallback list if DB seeding pending
        return [
            {
                "id": "model-1",
                "name": "qwen2.5:7b-instruct",
                "model_type": "GENERAL",
                "provider": "OLLAMA",
                "endpoint_url": "http://localhost:11434",
                "is_active": True,
                "is_default": True,
                "context_window": 8192,
                "latency_ms": 45,
                "status": "ONLINE",
                "created_at": "2026-08-28T00:00:00Z"
            },
            {
                "id": "model-2",
                "name": "qwen2.5-coder:7b",
                "model_type": "CODING",
                "provider": "OLLAMA",
                "endpoint_url": "http://localhost:11434",
                "is_active": True,
                "is_default": False,
                "context_window": 8192,
                "latency_ms": 38,
                "status": "ONLINE",
                "created_at": "2026-08-28T00:00:00Z"
            },
            {
                "id": "model-3",
                "name": "llama3.2-vision:11b",
                "model_type": "VISION",
                "provider": "OLLAMA",
                "endpoint_url": "http://localhost:11434",
                "is_active": True,
                "is_default": False,
                "context_window": 8192,
                "latency_ms": 62,
                "status": "ONLINE",
                "created_at": "2026-08-28T00:00:00Z"
            }
        ]
    return models

@router.post("/models/route")
async def route_model(payload: RoutePromptPayload):
    decision = select_model_for_prompt(payload.prompt)
    return decision
