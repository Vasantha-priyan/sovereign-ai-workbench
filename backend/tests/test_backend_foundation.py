import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import init_db
from app.seed.demo_data import seed_demo_data

@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    await init_db()
    await seed_demo_data()

@pytest.mark.asyncio
async def test_health_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["database"] == "connected"
        assert data["external_ai"] is False

@pytest.mark.asyncio
async def test_users_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/users")
        assert response.status_code == 200
        users = response.json()
        assert len(users) >= 4
        names = [u["full_name"] for u in users]
        assert "Rajesh Verma" in names

@pytest.mark.asyncio
async def test_documents_endpoints():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # List Documents
        res = await ac.get("/api/v1/documents")
        assert res.status_code == 200
        docs = res.json()
        assert len(docs) >= 3

        # Upload Document
        files = {"file": ("test_doc.txt", b"Test Document Plaintext Content", "text/plain")}
        upload_res = await ac.post("/api/v1/documents", files=files)
        assert upload_res.status_code == 200
        uploaded_doc = upload_res.json()
        assert uploaded_doc["filename"] == "test_doc.txt"
        assert uploaded_doc["status"] == "PROCESSED"

@pytest.mark.asyncio
async def test_knowledge_collections():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/v1/knowledge/collections")
        assert res.status_code == 200
        kbs = res.json()
        assert len(kbs) >= 1
        assert "Safety" in kbs[0]["name"]

@pytest.mark.asyncio
async def test_workflow_execution():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.post("/api/v1/workflows/wf-1/execute", json={"prompt": "Test inspection workflow"})
        assert res.status_code == 200
        execution = res.json()
        assert execution["status"] in ["COMPLETED", "RUNNING", "QUEUED"]
        assert execution["id"] is not None

@pytest.mark.asyncio
async def test_deliverable_approval_and_audit():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Get deliverables
        res = await ac.get("/api/v1/deliverables")
        assert res.status_code == 200
        delivs = res.json()
        assert len(delivs) >= 1
        deliv_id = delivs[0]["id"]

        # Approve Deliverable
        appr_res = await ac.post(f"/api/v1/deliverables/{deliv_id}/approve")
        assert appr_res.status_code == 200
        assert appr_res.json()["approval_status"] == "APPROVED"

        # Check Audit Trail
        audit_res = await ac.get("/api/v1/audit/events")
        assert audit_res.status_code == 200
        events = audit_res.json()
        actions = [e["action"] for e in events]
        assert "DELIVERABLE_APPROVAL" in actions
