from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.db.models import AuditLog
from app.schemas import AuditLogResponse

router = APIRouter(prefix="", tags=["Audit"])

@router.get("/audit/events", response_model=List[AuditLogResponse])
@router.get("/audit", response_model=List[AuditLogResponse])
async def list_audit_events(
    user_id: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    resource_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    query = select(AuditLog)
    if user_id:
        query = query.where(AuditLog.user_id == user_id)
    if action:
        query = query.where(AuditLog.action == action)
    if resource_type:
        query = query.where(AuditLog.resource_type == resource_type)
    if status:
        query = query.where(AuditLog.status == status)

    res = await db.execute(query.order_by(AuditLog.created_at.desc()))
    return res.scalars().all()
