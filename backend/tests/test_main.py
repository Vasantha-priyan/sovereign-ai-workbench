import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import init_db
from app.seed.demo_data import seed_demo_data

@pytest_asyncio.fixture(autouse=True)
async def setup_test_db():
    await init_db()
    await seed_demo_data()

@pytest.mark.asyncio
async def test_health_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"
    assert data["mode"] == "LOCAL_SOVEREIGN_OFFLINE"

@pytest.mark.asyncio
async def test_dashboard_stats():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["security_status"] == "LOCAL / PRIVATE"
    assert data["external_connections"] == 0
    assert data["documents_processed"] >= 1

@pytest.mark.asyncio
async def test_agent_run_scenario():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/agents/run", json={"prompt": "Analyze this inspection report and prepare an approval note according to our safety SOP."})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "COMPLETED"
    assert data["total_steps"] >= 4
