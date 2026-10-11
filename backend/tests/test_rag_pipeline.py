import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import init_db
from app.seed.demo_data import seed_demo_data
from app.services.rag.embeddings import generate_local_embedding, calculate_cosine_similarity
from app.services.rag.indexer import index_knowledge_collection

@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    await init_db()
    await seed_demo_data()

@pytest.mark.asyncio
async def test_embedding_generation_and_cosine_similarity():
    vec1 = generate_local_embedding("Discharge pressure exceedance above 45 BAR requires emergency shutdown.")
    vec2 = generate_local_embedding("Emergency shutdown triggered due to high pressure exceedance.")
    vec3 = generate_local_embedding("Cafeteria lunch menu for Monday consists of soup and sandwich.")

    assert len(vec1) == 384
    assert len(vec2) == 384

    sim_related = calculate_cosine_similarity(vec1, vec2)
    sim_unrelated = calculate_cosine_similarity(vec1, vec3)

    assert sim_related > sim_unrelated

@pytest.mark.asyncio
async def test_rag_query_api_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Get Knowledge Base Collection ID
        kb_res = await ac.get("/api/v1/knowledge/collections")
        assert kb_res.status_code == 200
        kbs = kb_res.json()
        assert len(kbs) >= 1
        kb_id = kbs[0]["id"]

        # Execute RAG Query
        query_payload = {
            "kb_id": kb_id,
            "query": "What conditions require immediate pump shutdown or load transfer?"
        }
        res = await ac.post("/api/v1/knowledge-base/query", json=query_payload)
        assert res.status_code == 200
        data = res.json()

        assert "answer" in data
        assert "citations" in data
        assert len(data["citations"]) >= 1

        citation = data["citations"][0]
        assert "document_name" in citation
        assert "page_number" in citation
        assert "relevance_score" in citation
        assert "excerpt" in citation

        # Verify audit event
        audit_res = await ac.get("/api/v1/audit/events")
        assert audit_res.status_code == 200
        actions = [a["action"] for a in audit_res.json()]
        assert "KNOWLEDGE_SEARCH_QUERY" in actions
