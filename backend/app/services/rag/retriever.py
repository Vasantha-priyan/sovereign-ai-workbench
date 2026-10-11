from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import AuditLog
from app.services.rag.vector_store import search_vector_store

async def perform_rag_query(kb_id: str, query: str, db: AsyncSession) -> Dict[str, Any]:
    # Search local vector store
    search_results = await search_vector_store(query_text=query, kb_id=kb_id, top_k=3, db=db)

    # Format citations / evidence cards
    citations = []
    for match in search_results:
        citations.append({
            "document_name": match["document_name"],
            "page_number": match["page_number"],
            "relevance_score": f"{match['relevance_score']}%",
            "excerpt": match["excerpt"]
        })

    # Log Audit Event
    audit = AuditLog(
        organization_id="org-1",
        user_name="Rajesh Verma",
        action="KNOWLEDGE_SEARCH_QUERY",
        resource_type="KNOWLEDGE_BASE",
        resource_id=kb_id,
        status="SUCCESS",
        details_json=f'{{"query": "{query}", "matches_returned": {len(citations)}}}'
    )
    db.add(audit)
    await db.commit()

    # Grounded answer synthesis
    if citations:
        best = citations[0]
        answer = f"According to grounded organizational knowledge ({best['document_name']}, Page {best['page_number']}):\n\n\"{best['excerpt']}\""
    else:
        answer = "No grounded evidence found in the selected knowledge base."

    return {
        "query": query,
        "answer": answer,
        "citations": citations
    }
