from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.db.models import WorkflowTemplate, AgentRun, User, AuditLog
from app.schemas import WorkflowTemplateResponse, WorkflowExecutionResponse

router = APIRouter(prefix="", tags=["Workflows"])

class WorkflowRunPayload(BaseModel):
    prompt: Optional[str] = "Analyze inspection report and prepare approval note"

@router.get("/workflows", response_model=List[WorkflowTemplateResponse])
async def list_workflows(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(WorkflowTemplate))
    return res.scalars().all()

@router.get("/workflows/{id}", response_model=WorkflowTemplateResponse)
async def get_workflow(id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(WorkflowTemplate).where(WorkflowTemplate.id == id))
    wf = res.scalar_one_or_none()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return wf

@router.post("/workflows/{id}/execute", response_model=WorkflowExecutionResponse)
@router.post("/agents/run")
async def execute_workflow(id: Optional[str] = None, payload: Optional[WorkflowRunPayload] = None, db: AsyncSession = Depends(get_db)):
    user_res = await db.execute(select(User))
    user = user_res.scalars().first()

    target_prompt = payload.prompt if payload else "Execute inspection workflow"

    # Create AgentRun record (status: QUEUED)
    run = AgentRun(
        workflow_id=id,
        user_id=user.id if user else "user-1",
        prompt=target_prompt,
        status="QUEUED",
        model_used="qwen2.5:7b-instruct",
        total_steps=5,
        output_summary="Workflow execution queued."
    )
    db.add(run)
    await db.flush()

    # Create Audit Event
    audit = AuditLog(
        organization_id=user.organization_id if user else "org-1",
        user_id=user.id if user else "user-1",
        user_name=user.full_name if user else "Rajesh Verma",
        action="WORKFLOW_EXECUTION",
        resource_type="WORKFLOW",
        resource_id=run.id,
        status="SUCCESS",
        details_json=f'{{"prompt": "{target_prompt}", "execution_id": "{run.id}"}}'
    )
    db.add(audit)
    await db.commit()
    await db.refresh(run)
    return run

@router.get("/agents/runs")
async def list_agent_runs(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(AgentRun).order_by(AgentRun.created_at.desc()))
    runs = res.scalars().all()
    # Format with steps for frontend workflow execution timeline
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
