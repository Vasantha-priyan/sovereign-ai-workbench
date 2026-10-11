import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import init_db
from app.seed.demo_data import seed_demo_data
from app.services.llm.router import select_model_for_prompt
from app.services.llm.inference import execute_local_inference

@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    await init_db()
    await seed_demo_data()

@pytest.mark.asyncio
async def test_dynamic_model_router():
    # General SOP prompt
    res_gen = select_model_for_prompt("What does the refinery Safety SOP specify for pressure exceedance?")
    assert res_gen["model_name"] == "qwen2.5:7b-instruct"
    assert res_gen["category"] == "GENERAL"

    # Coding / Math prompt
    res_code = select_model_for_prompt("Write a python pandas script to calculate the percentage exceedance of pressure_bar.")
    assert res_code["model_name"] == "qwen2.5-coder:7b"
    assert res_code["category"] == "CODING"

    # Vision / Image prompt
    res_vision = select_model_for_prompt("Inspect this scanned image gauge photo for OCR reading.")
    assert res_vision["model_name"] == "llama3.2-vision:11b"
    assert res_vision["category"] == "VISION"

@pytest.mark.asyncio
async def test_local_inference_engine_offline_fallback():
    context_chunks = [
        {
            "document_name": "Equipment_Inspection_Report_Scanned.pdf",
            "page_number": 3,
            "excerpt": "Discharge pressure registered at 48.5 BAR (7.78% over limit)."
        }
    ]
    res = await execute_local_inference(
        prompt="What is the pressure reading for Pump P-102A?",
        model_name="qwen2.5:7b-instruct",
        context_chunks=context_chunks
    )
    assert res["model_used"] == "qwen2.5:7b-instruct"
    assert "48.5 BAR" in res["text"]
    assert res["latency_ms"] > 0

@pytest.mark.asyncio
async def test_chat_message_api_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Get actual seeded Knowledge Base ID
        kb_res = await ac.get("/api/v1/knowledge/collections")
        assert kb_res.status_code == 200
        kbs = kb_res.json()
        assert len(kbs) >= 1
        real_kb_id = kbs[0]["id"]

        payload = {
            "prompt": "Analyze Pump P-102A inspection findings and report pressure exceedance.",
            "kb_id": real_kb_id
        }
        res = await ac.post("/api/v1/chat/message", json=payload)
        assert res.status_code == 200
        data = res.json()

        assert "content" in data
        assert "model_used" in data
        assert data["model_used"] in ["qwen2.5:7b-instruct", "qwen2.5-coder:7b"]
        assert "citations" in data
        assert len(data["citations"]) >= 1

        # Check action shortcuts
        assert "action_shortcuts" in data
        assert len(data["action_shortcuts"]) >= 1

        # Verify audit event
        audit_res = await ac.get("/api/v1/audit/events")
        assert audit_res.status_code == 200
        actions = [a["action"] for a in audit_res.json()]
        assert "AI_WORKBENCH_QUERY" in actions

@pytest.mark.asyncio
async def test_models_registry_api():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/v1/models")
        assert res.status_code == 200
        models = res.json()
        assert len(models) >= 3
        names = [m["name"] for m in models]
        assert "qwen2.5:7b-instruct" in names
        assert "qwen2.5-coder:7b" in names
        assert "llama3.2-vision:11b" in names

@pytest.mark.asyncio
async def test_model_route_api():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.post("/api/v1/models/route", json={"prompt": "Calculate pandas average temperature in CSV."})
        assert res.status_code == 200
        data = res.json()
        assert data["model_name"] == "qwen2.5-coder:7b"
