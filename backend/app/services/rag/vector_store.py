import json
from typing import List, Dict, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import DocumentEmbedding, DocumentChunk, Document
from app.services.rag.embeddings import generate_local_embedding, calculate_cosine_similarity

async def search_vector_store(
    query_text: str,
    kb_id: str = None,
    top_k: int = 3,
    db: AsyncSession = None
) -> List[Dict[str, Any]]:
    # Generate vector embedding for user query
    query_vector = generate_local_embedding(query_text)

    # 1. Query indexed DocumentEmbedding table
    stmt = (
        select(DocumentEmbedding, DocumentChunk, Document)
        .join(DocumentChunk, DocumentEmbedding.chunk_id == DocumentChunk.id)
        .join(Document, DocumentEmbedding.document_id == Document.id)
    )

    res = await db.execute(stmt)
    rows = res.all()

    # 2. Dynamic fallback: If no DocumentEmbedding entries, query DocumentChunk directly
    if not rows:
        chunks_stmt = select(DocumentChunk, Document).join(Document, DocumentChunk.document_id == Document.id)
        chunks_res = await db.execute(chunks_stmt)
        chunk_rows = chunks_res.all()
        results = []
        for chunk, doc in chunk_rows:
            emb_vector = generate_local_embedding(chunk.text)
            sim_score = calculate_cosine_similarity(query_vector, emb_vector)
            scaled_relevance = int(min(98, max(75, sim_score * 100)))
            results.append({
                "chunk_id": chunk.id,
                "document_id": doc.id,
                "document_name": doc.filename,
                "page_number": chunk.page_number,
                "section": f"Page {chunk.page_number}",
                "excerpt": chunk.text,
                "relevance_score": scaled_relevance,
                "similarity_raw": sim_score
            })
        results.sort(key=lambda x: x["similarity_raw"], reverse=True)
        return results[:top_k]

    results = []
    for emb_record, chunk, doc in rows:
        emb_vector = json.loads(emb_record.embedding_json)
        sim_score = calculate_cosine_similarity(query_vector, emb_vector)
        scaled_relevance = int(min(98, max(75, sim_score * 100)))

        results.append({
            "chunk_id": chunk.id,
            "document_id": doc.id,
            "document_name": doc.filename,
            "page_number": chunk.page_number,
            "section": f"Page {chunk.page_number}",
            "excerpt": chunk.text,
            "relevance_score": scaled_relevance,
            "similarity_raw": sim_score
        })

    results.sort(key=lambda x: x["similarity_raw"], reverse=True)
    return results[:top_k]
