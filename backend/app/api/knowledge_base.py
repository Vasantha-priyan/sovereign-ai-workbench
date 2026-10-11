from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.db.models import KnowledgeBase, KnowledgeDocument, Organization
from app.schemas import KnowledgeBaseResponse, KnowledgeBaseCreate
from app.services.rag.retriever import perform_rag_query
from app.services.rag.indexer import index_knowledge_collection

router = APIRouter(prefix="", tags=["Knowledge Base"])

class QueryRequest(BaseModel):
    kb_id: str
    query: str

@router.get("/knowledge/collections", response_model=List[KnowledgeBaseResponse])
@router.get("/knowledge-base", response_model=List[KnowledgeBaseResponse])
async def list_collections(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(KnowledgeBase).order_by(KnowledgeBase.created_at.desc()))
    return res.scalars().all()

@router.get("/knowledge/collections/{id}", response_model=KnowledgeBaseResponse)
async def get_collection(id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(KnowledgeBase).where(KnowledgeBase.id == id))
    kb = res.scalar_one_or_none()
    if not kb:
        raise HTTPException(status_code=404, detail="Knowledge collection not found")
    return kb

@router.post("/knowledge/collections", response_model=KnowledgeBaseResponse)
async def create_collection(payload: KnowledgeBaseCreate, db: AsyncSession = Depends(get_db)):
    org_res = await db.execute(select(Organization))
    org = org_res.scalars().first()

    kb = KnowledgeBase(
        organization_id=org.id if org else "org-1",
        name=payload.name,
        description=payload.description,
        status="ACTIVE",
        vector_index_status="NOT_INDEXED",
        doc_count=0,
        chunk_count=0
    )
    db.add(kb)
    await db.commit()
    await db.refresh(kb)
    return kb

@router.post("/knowledge/collections/{id}/index", response_model=KnowledgeBaseResponse)
async def index_collection(id: str, db: AsyncSession = Depends(get_db)):
    kb = await index_knowledge_collection(id, db)
    return kb

@router.get("/knowledge/collections/{id}/sources")
async def get_collection_sources(id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(KnowledgeDocument).where(KnowledgeDocument.kb_id == id))
    return res.scalars().all()

@router.post("/knowledge-base/query")
@router.post("/knowledge/query")
async def query_knowledge(req: QueryRequest, db: AsyncSession = Depends(get_db)):
    result = await perform_rag_query(kb_id=req.kb_id, query=req.query, db=db)
    return result
