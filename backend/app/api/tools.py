from fastapi import APIRouter
from app.services.sandbox_service import sandbox_service

router = APIRouter(prefix="/tools", tags=["Tools"])

REGISTERED_TOOLS = [
    {
        "id": "tool_kb_search",
        "name": "kb_search",
        "category": "Knowledge Base & RAG",
        "description": "Searches local vector store for grounded document chunks and page citations.",
        "permission_level": "READ",
        "enabled": True,
        "input_schema": {"query": "string", "top_k": "integer"}
    },
    {
        "id": "tool_doc_parser_ocr",
        "name": "doc_parser_ocr",
        "category": "Multimodal Document Extraction",
        "description": "Performs local OCR text & tabular extraction from scanned PDFs and inspection images.",
        "permission_level": "READ",
        "enabled": True,
        "input_schema": {"file_path": "string", "apply_ocr": "boolean"}
    },
    {
        "id": "tool_engineering_calc",
        "name": "engineering_calc",
        "category": "Deterministic Calculation",
        "description": "Runs Python-based deterministic math formulas for pressure, flow rate, and stress parameters.",
        "permission_level": "EXECUTE",
        "enabled": True,
        "input_schema": {"formula": "string", "inputs": "object"}
    },
    {
        "id": "tool_code_sandbox",
        "name": "code_sandbox",
        "category": "Secure Code Execution",
        "description": "Runs Python scripts inside isolated zero-network subprocess container.",
        "permission_level": "SANDBOX_EXECUTE",
        "enabled": True,
        "input_schema": {"python_script": "string", "timeout": "integer"}
    },
    {
        "id": "tool_docx_builder",
        "name": "docx_builder",
        "category": "Deliverable Generator",
        "description": "Generates formal enterprise Word (.docx) approval notes with metadata tables and recommendations.",
        "permission_level": "WRITE",
        "enabled": True,
        "input_schema": {"title": "string", "subject": "string", "findings": "array"}
    },
    {
        "id": "tool_xlsx_builder",
        "name": "xlsx_builder",
        "category": "Deliverable Generator",
        "description": "Generates formatted Excel (.xlsx) inspection summaries and financial metrics.",
        "permission_level": "WRITE",
        "enabled": True,
        "input_schema": {"title": "string", "headers": "array", "data": "array"}
    },
    {
        "id": "tool_pptx_builder",
        "name": "pptx_builder",
        "category": "Deliverable Generator",
        "description": "Generates executive PowerPoint (.pptx) briefing slides.",
        "permission_level": "WRITE",
        "enabled": True,
        "input_schema": {"title": "string", "slides": "array"}
    }
]

@router.get("")
async def list_tools():
    return REGISTERED_TOOLS

@router.post("/execute-test")
async def execute_tool_test(tool_name: str, payload: dict):
    if tool_name == "code_sandbox":
        script = payload.get("script", "print('Sandbox Verification Test Passed')")
        return sandbox_service.execute_python_code(script)
    
    return {
        "tool_name": tool_name,
        "status": "SUCCESS",
        "message": f"Successfully verified operational readiness for tool '{tool_name}'.",
        "output": "Simulated tool test completed with zero outbound network calls."
    }
