import os
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.db.models import Deliverable, AuditLog, User
from app.schemas import DeliverableResponse

router = APIRouter(prefix="/deliverables", tags=["Deliverables"])

@router.get("", response_model=List[DeliverableResponse])
async def list_deliverables(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Deliverable).order_by(Deliverable.created_at.desc()))
    return res.scalars().all()

@router.get("/{id}", response_model=DeliverableResponse)
async def get_deliverable(id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Deliverable).where(Deliverable.id == id))
    deliv = res.scalar_one_or_none()
    if not deliv:
        raise HTTPException(status_code=404, detail="Deliverable not found")
    return deliv

@router.post("/{id}/approve", response_model=DeliverableResponse)
async def approve_deliverable(id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Deliverable).where(Deliverable.id == id))
    deliv = res.scalar_one_or_none()
    if not deliv:
        raise HTTPException(status_code=404, detail="Deliverable not found")

    user_res = await db.execute(select(User))
    user = user_res.scalars().first()

    deliv.approval_status = "APPROVED"

    audit = AuditLog(
        organization_id=deliv.organization_id,
        user_id=user.id if user else "user-1",
        user_name=user.full_name if user else "Rajesh Verma",
        action="DELIVERABLE_APPROVAL",
        resource_type="DELIVERABLE",
        resource_id=deliv.id,
        status="SUCCESS",
        details_json=f'{{"title": "{deliv.title}", "file_type": "{deliv.file_type}"}}'
    )
    db.add(audit)
    await db.commit()
    await db.refresh(deliv)
    return deliv

@router.get("/{id}/download")
async def download_deliverable(id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Deliverable).where(Deliverable.id == id))
    deliv = res.scalar_one_or_none()
    if not deliv:
        raise HTTPException(status_code=404, detail="Deliverable not found")

    if not os.path.exists(deliv.file_path):
        raise HTTPException(status_code=404, detail="Physical file not found on disk")

    media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document" if deliv.file_type == "DOCX" else "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    filename = os.path.basename(deliv.file_path)

    return FileResponse(
        path=deliv.file_path,
        media_type=media_type,
        filename=filename
    )
