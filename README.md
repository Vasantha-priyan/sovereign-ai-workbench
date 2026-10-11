# Sovereign On-Premise Agentic AI Workbench

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.13-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg)](https://vitejs.dev/)
[![Air--Gap](https://img.shields.io/badge/Sovereignty-100%25%20Air--Gapped-success.svg)](#sovereignty-guarantee)
[![SIH 2026](https://img.shields.io/badge/Smart%20India%20Hackathon-SIH26117-orange.svg)](#problem-statement)

> **Private, Air-Gapped Agentic AI for Confidential Industrial Work — Zero External AI API Calls.**  
> Built for Refineries, PSUs, Defense-Linked Manufacturing Units, and Confidential Enterprise Operations.

---

## 📌 Problem Statement & Context

- **Problem Statement ID**: `SIH26117`
- **Problem Statement Title**: *Sovereign On-Premise Agentic AI Workbench using Open-Weight Multimodal LLMs for Confidential Industrial Work*
- **Theme**: Smart Automation | **Category**: Software
- **Team**: `CIPHORA` (`RMKSIH26SW203`)

### The Industrial Dilemma
Critical sectors like Oil Refineries, Power PSUs, and Defense manufacturing units generate massive volumes of sensitive documentation: Piping & Instrumentation Diagrams (P&IDs), operational shift logs, equipment inspection reports, vendor negotiations, and emergency shutdown notes. 

Engineers **cannot** use public cloud AI tools (e.g., ChatGPT, Claude) because sending confidential drawings or plant metrics across public cloud infrastructure violates corporate compliance and national security policies. Consequently, engineers are forced to handle routine compliance and audit work manually, leading to delayed decisions, operational risks, and thousands of lost productivity hours.

### The Solution
The **Sovereign AI Workbench** is a 100% self-hosted, air-gapped platform running on-premise on standard workstation or server hardware. It combines multimodal document ingestion, local OCR, 384-dimensional vector retrieval (RAG), intent-based open-weight model routing, sandboxed Python code execution, human-in-the-loop review gates, and automated physical deliverable generation (`.docx` / `.xlsx`).

---

## 🛡️ Sovereignty Guarantee

```
┌────────────────────────────────────────────────────────────────────────┐
│                   SOVEREIGN AIR-GAP ENFORCEMENT                        │
├────────────────────────────────────────────────────────────────────────┤
│ • EXTERNAL_AI_ENABLED = false (Hardcoded core configuration)           │
│ • Localhost Loopback Network (127.0.0.1:8000 & 127.0.0.1:3000)        │
│ • Zero Outbound Sockets / No External Cloud Ingress or Egress          │
│ • All Vector Embeddings, Relational Tables, & Files Stored Locally    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Core Technical Capabilities

### 1. Dynamic Task-Based Model Router
Rather than locking the platform to a single massive model, an intent classifier inspects prompt requirements and dispatches tasks to specialized local open-weight models:
- **General SOP & Engineering Summaries** $\rightarrow$ `qwen2.5:7b-instruct`
- **Quantitative Math & Code Generation** $\rightarrow$ `qwen2.5-coder:7b`
- **Visual OCR & Scanned Engineering Drawings** $\rightarrow$ `llama3.2-vision:11b`

### 2. Local Multimodal Ingestion & Tesseract OCR Pipeline
- Ingests **PDF, CSV, TXT, and DOCX** files.
- Automatically calculates character density per page: pages containing $< 20$ characters are detected as scanned images and processed via local **Tesseract OCR** (`pytesseract` + `pdf2image`) without external cloud OCR APIs.
- Retains 1-indexed page boundaries for precise citation grounding.

### 3. 384-Dimensional Local Vector RAG Engine
- Embeds document chunks into 384-dimensional dense vectors using `sentence-transformers` (`all-MiniLM-L6-v2`).
- Stores embeddings in a local SQLite vector table (`DocumentEmbedding`) and executes cosine similarity searches in sub-50 ms.
- Returns grounded evidence cards citing exact page numbers (e.g. `Safety_SOP_Refinery_2026.pdf` — Page 4) and relevance match percentages.

### 4. Zero-Network Python Subprocess Sandbox
- Quantitative engineering calculations (e.g., pressure exceedance percentages, turbine heat rates, flow efficiencies) are offloaded to an isolated Python subprocess (`sys.executable -I`) with `NO_PROXY=*` and blocked socket layers.
- Prevents LLM arithmetic hallucinations and captures execution telemetry (`stdout`, `duration_ms`, `exit_code: 0`).

### 5. Physical Enterprise Deliverable Generation
- Instead of stopping at plain text chat replies, the agent programmatically compiles real, formatted **Microsoft Word (`.docx`)** Emergency Shutdown Approval Notes and **Excel (`.xlsx`)** Audit Workbooks using `python-docx` and `openpyxl`.
- Includes styled headers, parameter tables, red alert boxes, and official signature blocks.

### 6. Human-in-the-Loop Governance Gate
- Safety-critical operations pause at a mandatory review gate (`PENDING_HUMAN_REVIEW`).
- A Senior Engineer must click **Approve Action** (`APPROVED`) before physical `.docx` approval notes are released for downstream signing and printing.

### 7. Real-Time Forensic Audit & Network Monitoring
- Live **Security & Audit Center** dashboard verifies **Outbound Connections: 0** and **External AI Calls: 0**.
- Complete immutable audit trail (`AuditLog` model) logs every document upload, vector search query, model route, and senior engineer sign-off.

---

## 🏗️ 8-Step System Architecture Workflow

```
[1. FRONTEND UI (React 18 + Vite)]
      │ (User submits query / uploads inspection report)
      ▼
[2. API GATEWAY (FastAPI / Pydantic v2)]
      │ (Validates multipart payload, checks permissions)
      ▼
[3. REQUEST PROCESSOR]
      │ (Classifies intent & extracts technical entities)
      ▼
[4. DYNAMIC MODEL ROUTER]
      │ (Dispatches to Qwen 2.5 7B / Qwen 2.5 Coder / Llama 3.2 Vision)
      ▼
[5. AGENT / WORKFLOW ORCHESTRATOR]
      │ (Plans multi-step execution: Plan ➔ Execute ➔ Observe ➔ Validate)
      ├───────────────────────────────┬───────────────────────────────┐
      ▼                               ▼                               ▼
[6A. LOCAL AI MODELS]       [6B. LOCAL SECURE TOOLS]     [7. DATA & KNOWLEDGE]
 • Qwen 2.5 7B Instruct       • OCR / PDF Parser           • SQLite Relational DB
 • Qwen 2.5 Coder 7B          • Local RAG Retrieval        • Document Chunks
 • Llama 3.2 Vision 11B       • Python Math Sandbox        • 384d Vector Store
 • Local Embeddings (384d)    • Report Generator (.docx)   • Forensic Audit Logs
      │                               │                               │
      └───────────────────────────────┼───────────────────────────────┘
                                      ▼
                        [8. OUTPUT & HUMAN GOVERNANCE]
                         • Grounded Evidence Citations
                         • Senior Engineer Sign-Off Gate
                         • Physical Deliverables (.docx / .xlsx)
```

---

## 📂 Project Repository Structure

```
sovereign-ai-workbench/
├── backend/
│   ├── app/
│   │   ├── api/                  # Versioned REST APIs (/api/v1)
│   │   │   ├── chat.py           # Multi-turn conversation & model router
│   │   │   ├── documents.py      # Multipart file upload & chunk viewer
│   │   │   ├── knowledge_base.py # Vector indexing & RAG query
│   │   │   ├── workflows.py      # Flagship agentic workflow engine
│   │   │   ├── deliverables.py   # Deliverable approvals & downloads
│   │   │   ├── models.py         # AI model registry
│   │   │   ├── tools.py          # Sandbox code execution endpoints
│   │   │   └── security.py       # Air-gap telemetry & audit events
│   │   ├── core/                 # Config & async database session
│   │   ├── db/                   # SQLAlchemy 2.0 database models
│   │   ├── schemas.py            # Pydantic v2 validation schemas
│   │   ├── seed/                 # Enterprise demo data seeder
│   │   └── services/
│   │       ├── ingestion/        # PDF parser, Tesseract OCR, CSV/DOCX parsers, chunker
│   │       ├── rag/              # 384d embeddings, SQLite vector store, retriever
│   │       ├── llm/              # Intent router, Ollama client, fallback engine
│   │       └── agent/            # Python sandbox, docx/xlsx builder, workflow orchestrator
│   ├── storage/
│   │   ├── uploads/              # Local uploaded files (PDFs, CSVs, TXT)
│   │   └── deliverables/         # Generated .docx approval notes & .xlsx workbooks
│   ├── tests/                    # Automated Pytest test suites (23 tests passing)
│   ├── requirements.txt          # Python dependencies
│   └── sovereign_workbench.db    # SQLite application database
│
├── frontend/
│   ├── src/
│   │   ├── components/           # Sidebar, Header, Drawer, Telemetry widgets
│   │   ├── pages/                # Dashboard, Chat, Documents, KnowledgeBase, Workflows, Deliverables, Security
│   │   ├── api.ts                # Axios client configured for local backend
│   │   ├── App.tsx               # Main application container & router
│   │   └── main.tsx              # React 18 entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── .gitignore                    # Production git ignore configuration
├── LICENSE                       # MIT License
└── README.md                     # Master project documentation
```

---

## 🚀 Quickstart Installation Guide

### Prerequisites
- **Python**: 3.11, 3.12, or 3.13
- **Node.js**: v18+ or v20+ (with npm)
- *(Optional)* **Ollama**: For local open-weight GPU model weights (`qwen2.5:7b-instruct`)
- *(Optional)* **Tesseract OCR**: For local scanned document optical character recognition

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/sovereign-ai-workbench.git
cd sovereign-ai-workbench
```

### 2. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# On Windows (Command Prompt / PowerShell):
.\venv\Scripts\activate

# On Linux / macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI Server (Port 8000)
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
*Backend Swagger Docs will be available at: [`http://127.0.0.1:8000/docs`](http://127.0.0.1:8000/docs)*

### 3. Frontend Setup
Open a second terminal window:
```bash
cd frontend

# Install npm dependencies
npm install

# Start Vite Development Server (Port 3000)
npx vite --port 3000 --host 127.0.0.1
```
*Frontend Application UI will be live at: [`http://127.0.0.1:3000`](http://127.0.0.1:3000)*

---

## 🧪 Automated Pytest Verification Suite

The backend includes a comprehensive automated test suite covering all 5 architectural phases:

```bash
cd backend
python -m pytest -v
```

**Verification Results**:
```
collected 23 items

tests/test_backend_foundation.py::test_health_endpoint PASSED             [  4%]
tests/test_backend_foundation.py::test_users_endpoint PASSED              [  8%]
tests/test_backend_foundation.py::test_documents_endpoints PASSED         [ 13%]
tests/test_backend_foundation.py::test_knowledge_collections PASSED      [ 17%]
tests/test_backend_foundation.py::test_workflow_execution PASSED          [ 21%]
tests/test_backend_foundation.py::test_deliverable_approval_and_audit PASSED [ 26%]
tests/test_document_ingestion.py::test_upload_and_security_validation PASSED [ 30%]
tests/test_document_ingestion.py::test_pdf_extraction_pipeline PASSED    [ 34%]
tests/test_document_ingestion.py::test_csv_and_docx_parsers PASSED       [ 39%]
tests/test_document_ingestion.py::test_chunking_and_persistence PASSED   [ 43%]
tests/test_document_ingestion.py::test_scanned_pdf_and_ocr_fallback PASSED [ 47%]
tests/test_rag_pipeline.py::test_embedding_generation_and_cosine_similarity PASSED [ 52%]
tests/test_rag_pipeline.py::test_vector_store_search_and_grounded_rag PASSED [ 56%]
tests/test_llm_inference.py::test_model_router_selection PASSED           [ 60%]
tests/test_llm_inference.py::test_offline_grounded_inference_fallback PASSED [ 65%]
tests/test_llm_inference.py::test_ai_workbench_chat_completion_api PASSED [ 69%]
tests/test_llm_inference.py::test_models_registry_api PASSED              [ 73%]
tests/test_llm_inference.py::test_sovereignty_enforcement_config PASSED  [ 78%]
tests/test_agentic_workflows.py::test_python_sandbox_execution PASSED    [ 82%]
tests/test_agentic_workflows.py::test_docx_deliverable_generator PASSED  [ 86%]
tests/test_agentic_workflows.py::test_xlsx_deliverable_generator PASSED  [ 91%]
tests/test_agentic_workflows.py::test_workflow_engine_execution PASSED   [ 95%]
tests/test_agentic_workflows.py::test_deliverable_approval_and_download_api PASSED [100%]

============================= 23 passed in 15.17s =============================
```

---

## 📚 Academic & Research Foundations

The system architecture implements 5 foundational research methodologies:
1. **RAG (Retrieval-Augmented Generation)**: *Lewis et al., NeurIPS 2020* — Grounded vector retrieval over domain manuals.
2. **ReAct (Synergizing Reasoning and Acting)**: *Yao et al., ICLR 2023* — Interleaving thoughts, tool actions, and observations.
3. **Toolformer (Language Models Can Teach Themselves to Use Tools)**: *Schick et al., NeurIPS 2023* — Self-selecting appropriate local tool APIs.
4. **BLIP-2 (Bootstrapping Language-Image Pre-training)**: *Li et al., ICML 2023* — Multimodal document and visual diagram understanding.
5. **PagedAttention**: *Kwon et al., SOSP 2023* — Efficient memory and context management for serving local LLMs on workstation GPUs.

---

## 👥 Authors & Team Credits

- **Team Name**: `CIPHORA` (`RMKSIH26SW203`)
- **Event**: Smart India Hackathon 2026 (SIH 2026)
- **Problem Statement ID**: `SIH26117`

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
