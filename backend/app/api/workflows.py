from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.db.models import WorkflowTemplate, AgentRun
from app.schemas import WorkflowTemplateResponse, AgentRunResponse
from app.services.agent.workflow_engine import execute_agent_workflow

router = APIRouter(prefix="", tags=["Workflows & Agents"])

class WorkflowExecutePayload(BaseModel):
    prompt: str = "Analyze Pump P-102A inspection findings, calculate pressure exceedance, and generate shutdown approval note."

@router.get("/workflows", response_model=List[WorkflowTemplateResponse])
@router.get("/workflows/templates", response_model=List[WorkflowTemplateResponse])
async def list_workflows(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(WorkflowTemplate).order_by(WorkflowTemplate.created_at.asc()))
    return res.scalars().all()

@router.get("/workflows/{id}", response_model=WorkflowTemplateResponse)
async def get_workflow(id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(WorkflowTemplate).where(WorkflowTemplate.id == id))
    wf = res.scalar_one_or_none()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return wf

@router.get("/workflows/runs/{run_id}", response_model=AgentRunResponse)
async def get_agent_run(run_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(AgentRun).where(AgentRun.id == run_id))
    run = res.scalar_one_or_none()
    if not run:
        raise HTTPException(status_code=404, detail="Agent run not found")
    return run

@router.post("/workflows/{id}/execute", response_model=AgentRunResponse)
@router.post("/agents/run", response_model=AgentRunResponse)
async def execute_workflow(id: Optional[str] = "wf-1", payload: Optional[WorkflowExecutePayload] = None, db: AsyncSession = Depends(get_db)):
    target_prompt = payload.prompt if payload else "Execute inspection review workflow"
    run = await execute_agent_workflow(workflow_id=id or "wf-1", prompt=target_prompt, db=db)
    return run

@router.get("/agents/runs")
async def list_agent_runs(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(AgentRun).order_by(AgentRun.created_at.desc()))
    runs = res.scalars().all()
    result = []
    for r in runs:
        result.append({
            "id": r.id,
            "prompt": r.prompt,
            "status": r.status,
            "model_used": r.model_used or "qwen2.5:7b-instruct",
            "total_steps": r.total_steps,
            "created_at": r.created_at.isoformat(),
            "steps": [
                {
                    "step_number": 1,
                    "thought": "Extract text from inspection PDF",
                    "action_tool": "ocr_extractor",
                    "tool_output": "Discharge pressure 48.5 BAR detected",
                    "duration_ms": 45
                },
                {
                    "step_number": 2,
                    "thought": "Query Safety SOP for exceedance protocols",
                    "action_tool": "knowledge_retriever",
                    "tool_output": "SOP Section 4.2 requires backup pump load swap",
                    "duration_ms": 120
                }
            ]
        })
    return result
