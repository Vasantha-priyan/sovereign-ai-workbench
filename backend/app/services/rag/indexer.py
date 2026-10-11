import json
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import KnowledgeBase, DocumentChunk, DocumentEmbedding, AuditLog
from app.services.rag.embeddings import generate_local_embedding

async def index_knowledge_collection(kb_id: str, db: AsyncSession) -> KnowledgeBase:
    # 1. Fetch Knowledge Base
    res = await db.execute(select(KnowledgeBase).where(KnowledgeBase.id == kb_id))
    kb = res.scalar_one_or_none()
    if not kb:
        raise ValueError(f"KnowledgeBase ID '{kb_id}' not found")

    kb.vector_index_status = "INDEXING"
    await db.commit()

    # Log audit event
    audit_start = AuditLog(
        organization_id=kb.organization_id,
        action="KNOWLEDGE_INDEXING_STARTED",
        resource_type="KNOWLEDGE_BASE",
        resource_id=kb.id,
        status="SUCCESS",
        details_json=f'{{"kb_name": "{kb.name}"}}'
    )
    db.add(audit_start)
    await db.commit()

    # Clear old embeddings for re-indexing
    await db.execute(delete(DocumentEmbedding).where(DocumentEmbedding.kb_id == kb.id))
    await db.commit()

    # Fetch all chunks
    chunks_res = await db.execute(select(DocumentChunk))
    chunks = chunks_res.scalars().all()

    indexed_count = 0
    for chunk in chunks:
        vec = generate_local_embedding(chunk.text)
        emb_record = DocumentEmbedding(
            chunk_id=chunk.id,
            document_id=chunk.document_id,
            kb_id=kb.id,
            embedding_json=json.dumps(vec),
            embedding_model="all-MiniLM-L6-v2",
            dimension=len(vec)
        )
        db.add(emb_record)
        indexed_count += 1

    kb.vector_index_status = "INDEXED"
    kb.chunk_count = indexed_count

    audit_done = AuditLog(
        organization_id=kb.organization_id,
        action="KNOWLEDGE_INDEXING_COMPLETED",
        resource_type="KNOWLEDGE_BASE",
        resource_id=kb.id,
        status="SUCCESS",
        details_json=f'{{"indexed_chunks": {indexed_count}}}'
    )
    db.add(audit_done)
    await db.commit()
    await db.refresh(kb)
    return kb
