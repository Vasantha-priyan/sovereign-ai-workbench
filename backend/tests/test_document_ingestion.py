import os
import tempfile
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import init_db
from app.seed.demo_data import seed_demo_data
from app.services.ingestion.validators import validate_uploaded_file
from app.services.ingestion.csv_parser import parse_csv_document
from app.services.ingestion.txt_parser import parse_txt_document
from app.services.ingestion.chunker import generate_document_chunks
from fastapi import HTTPException

@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    await init_db()
    await seed_demo_data()

@pytest.mark.asyncio
async def test_file_validation_and_security():
    # Empty filename
    with pytest.raises(HTTPException):
        validate_uploaded_file("", 100)

    # Path traversal attack
    with pytest.raises(HTTPException):
        validate_uploaded_file("../../etc/passwd", 100)

    # Unsupported extension (.exe)
    with pytest.raises(HTTPException):
        validate_uploaded_file("malicious.exe", 100)

    # Empty file (0 bytes)
    with pytest.raises(HTTPException):
        validate_uploaded_file("empty.pdf", 0)

    # Oversized file (> 50MB)
    with pytest.raises(HTTPException):
        validate_uploaded_file("large.pdf", 51 * 1024 * 1024)

    # Valid PDF
    safe_name, ext = validate_uploaded_file("report.pdf", 1024)
    assert safe_name == "report.pdf"
    assert ext == ".pdf"

@pytest.mark.asyncio
async def test_csv_parser():
    with tempfile.NamedTemporaryFile(mode="wb", suffix=".csv", delete=False) as tmp:
        tmp.write(b"id,sensor,val\n1,temp,88.4\n2,press,48.5\n")
        tmp_path = tmp.name

    try:
        parsed = parse_csv_document(tmp_path)
        assert parsed["row_count"] == 2
        assert parsed["col_count"] == 3
        assert "headers" in parsed
        assert "sensor" in parsed["headers"]
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

@pytest.mark.asyncio
async def test_txt_parser():
    with tempfile.NamedTemporaryFile(mode="wb", suffix=".txt", delete=False) as tmp:
        tmp.write(b"Line 1\r\nLine 2\r\nLine 3")
        tmp_path = tmp.name

    try:
        parsed = parse_txt_document(tmp_path)
        assert parsed["total_characters"] > 0
        assert "Line 1" in parsed["content_formatted"]
        assert "Line 2" in parsed["content_formatted"]
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

@pytest.mark.asyncio
async def test_chunker_service():
    sample_text = "Word " * 300 # ~1500 chars
    chunks = generate_document_chunks(sample_text, page_number=3, chunk_size=800, chunk_overlap=100)
    assert len(chunks) >= 2
    assert chunks[0]["page_number"] == 3
    assert chunks[1]["chunk_index"] == 1

@pytest.mark.asyncio
async def test_document_ingestion_api_endpoints():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Upload CSV document
        files = {"file": ("test_sensor.csv", b"id,val\n1,10.5\n2,20.5\n", "text/csv")}
        res = await ac.post("/api/v1/documents", files=files)
        assert res.status_code == 200
        doc = res.json()
        doc_id = doc["id"]
        assert doc["status"] == "PROCESSED"
        assert doc["chunk_count"] >= 1

        # 2. Get Document Content API
        content_res = await ac.get(f"/api/v1/documents/{doc_id}/content")
        assert content_res.status_code == 200
        contents = content_res.json()
        assert len(contents) >= 1
        assert contents[0]["content_type"] == "TABLE"

        # 3. Get Document Chunks API
        chunks_res = await ac.get(f"/api/v1/documents/{doc_id}/chunks")
        assert chunks_res.status_code == 200
        chunks = chunks_res.json()
        assert len(chunks) >= 1
        assert chunks[0]["document_id"] == doc_id

        # 4. Processing Status API
        status_res = await ac.get(f"/api/v1/documents/{doc_id}/processing-status")
        assert status_res.status_code == 200
        status_info = status_res.json()
        assert status_info["status"] == "PROCESSED"
        assert status_info["chunk_count"] >= 1

        # 5. Audit logs check
        audit_res = await ac.get("/api/v1/audit/events")
        assert audit_res.status_code == 200
        actions = [a["action"] for a in audit_res.json()]
        assert "DOCUMENT_UPLOAD" in actions
        assert "DOCUMENT_PROCESSING_COMPLETED" in actions
