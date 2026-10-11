import os
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db, AsyncSessionLocal
from app.core.config import settings
from app.db.models import Document, DocumentContent, DocumentChunk, Organization, User, AuditLog
from app.schemas import (
    DocumentResponse, DocumentContentResponse, DocumentChunkResponse, DocumentProcessingStatusResponse
)
from app.services.ingestion.validators import validate_uploaded_file, generate_safe_storage_path
from app.services.ingestion.pipeline import process_document_pipeline

router = APIRouter(prefix="/documents", tags=["Documents"])

async def run_pipeline_in_background(document_id: str):
    async with AsyncSessionLocal() as session:
        await process_document_pipeline(document_id, session)

@router.get("", response_model=List[DocumentResponse])
async def list_documents(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Document).order_by(Document.created_at.desc()))
    return res.scalars().all()

@router.get("/{id}", response_model=DocumentResponse)
async def get_document(id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Document).where(Document.id == id))
    doc = res.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.post("", response_model=DocumentResponse)
@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    # 1. Read bytes & validate
    contents = await file.read()
    file_size = len(contents)
    original_filename, ext = validate_uploaded_file(file.filename, file_size)

    # 2. Get org & user
    org_res = await db.execute(select(Organization))
    org = org_res.scalars().first()
    user_res = await db.execute(select(User))
    user = user_res.scalars().first()

    # 3. Generate safe storage path & save locally
    file_path, storage_uuid = generate_safe_storage_path(settings.UPLOAD_DIR, original_filename)
    with open(file_path, "wb") as f:
        f.write(contents)

    file_type = ext.replace(".", "").upper()

    # 4. Create Document DB record
    doc = Document(
        organization_id=org.id if org else "org-1",
        filename=original_filename,
        original_filename=original_filename,
        file_path=file_path,
        file_type=file_type,
        file_size=file_size,
        uploaded_by=user.id if user else "user-1",
        status="PROCESSING",
        processing_status="PROCESSING",
        ocr_status="PENDING" if file_type == "PDF" else "NOT_REQUIRED",
        ocr_applied=False,
        extracted_text=""
    )
    db.add(doc)
    await db.flush()

    # 5. Log audit upload event
    audit = AuditLog(
        organization_id=org.id if org else "org-1",
        user_id=user.id if user else "user-1",
        user_name=user.full_name if user else "Rajesh Verma",
        action="DOCUMENT_UPLOAD",
        resource_type="DOCUMENT",
        resource_id=doc.id,
        status="SUCCESS",
        details_json=f'{{"filename": "{original_filename}", "file_size": {file_size}}}'
    )
    db.add(audit)
    await db.commit()
    await db.refresh(doc)

    # 6. Synchronously process or trigger background task
    await process_document_pipeline(doc.id, db)
    await db.refresh(doc)
    return doc

@router.get("/{id}/content", response_model=List[DocumentContentResponse])
async def get_document_content(id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(DocumentContent).where(DocumentContent.document_id == id).order_by(DocumentContent.page_number.asc()))
    return res.scalars().all()

@router.get("/{id}/chunks", response_model=List[DocumentChunkResponse])
async def get_document_chunks(id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(DocumentChunk).where(DocumentChunk.document_id == id).order_by(DocumentChunk.chunk_index.asc()))
    return res.scalars().all()

@router.post("/{id}/process", response_model=DocumentResponse)
async def trigger_document_process(id: str, db: AsyncSession = Depends(get_db)):
    doc = await process_document_pipeline(id, db)
    return doc

@router.get("/{id}/processing-status", response_model=DocumentProcessingStatusResponse)
async def get_document_processing_status(id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Document).where(Document.id == id))
    doc = res.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.delete("/{id}")
async def delete_document(id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Document).where(Document.id == id))
    doc = res.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception:
            pass

    await db.delete(doc)
    await db.commit()
    return {"message": "Document deleted successfully"}
