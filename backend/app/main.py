import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import init_db
from app.seed.demo_data import seed_demo_data
from app.schemas import HealthCheckResponse
from app.api import (
    auth, dashboard, documents, knowledge_base,
    chat, workflows, models, tools, deliverables,
    security, audit, settings as settings_api
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database & Seed Demo Data
    await init_db()
    await seed_demo_data()
    yield
    # Shutdown

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Sovereign On-Premise Agentic AI Workbench using Open-Weight Multimodal LLMs for Confidential Industrial Work",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers under /api/v1
api_v1 = settings.API_V1_STR
app.include_router(auth.router, prefix=api_v1)
app.include_router(dashboard.router, prefix=api_v1)
app.include_router(documents.router, prefix=api_v1)
app.include_router(knowledge_base.router, prefix=api_v1)
app.include_router(chat.router, prefix=api_v1)
app.include_router(workflows.router, prefix=api_v1)
app.include_router(models.router, prefix=api_v1)
app.include_router(tools.router, prefix=api_v1)
app.include_router(deliverables.router, prefix=api_v1)
app.include_router(security.router, prefix=api_v1)
app.include_router(audit.router, prefix=api_v1)
app.include_router(settings_api.router, prefix=api_v1)

# Serve generated deliverables static files
if os.path.exists(settings.DELIVERABLES_DIR):
    app.mount("/static/deliverables", StaticFiles(directory=settings.DELIVERABLES_DIR), name="deliverables")

@app.get("/health", response_model=HealthCheckResponse)
@app.get(f"{api_v1}/health", response_model=HealthCheckResponse)
async def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "environment": settings.ENVIRONMENT,
        "external_ai": settings.EXTERNAL_AI_ENABLED,
        "project": settings.PROJECT_NAME
    }
