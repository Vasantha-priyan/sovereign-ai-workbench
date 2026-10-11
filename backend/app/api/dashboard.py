from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.db.models import Document, KnowledgeBase, AIModel, AgentRun, Deliverable, AuditLog
from app.schemas import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    doc_count = (await db.execute(select(func.count(Document.id)))).scalar_one() or 0
    kb_doc_count = (await db.execute(select(func.count(KnowledgeBase.id)))).scalar_one() or 0
    model_count = (await db.execute(select(func.count(AIModel.id)).where(AIModel.is_active == True))).scalar_one() or 0
    agent_count = (await db.execute(select(func.count(AgentRun.id)))).scalar_one() or 0
    deliverables_count = (await db.execute(select(func.count(Deliverable.id)))).scalar_one() or 0
    audit_count = (await db.execute(select(func.count(AuditLog.id)))).scalar_one() or 0

    return DashboardStats(
        documents_processed=doc_count,
        kb_documents=kb_doc_count,
        active_models=model_count,
        agent_executions=agent_count,
        generated_deliverables=deliverables_count,
        recent_activity_count=audit_count,
        security_status="LOCAL / PRIVATE",
        external_connections=0,
        system_health="OPTIMAL"
    )

@router.get("/recent-activity")
async def get_recent_activity(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AuditLog).order_by(AuditLog.created_at.desc()).limit(10))
    logs = result.scalars().all()
    return logs
