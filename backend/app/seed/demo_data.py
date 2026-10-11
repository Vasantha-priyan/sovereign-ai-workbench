import os
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.core.config import settings
from app.db.models import (
    Organization, User, Document, KnowledgeBase,
    Deliverable, AuditLog, WorkflowTemplate, AIModel
)
from app.services.ingestion.pipeline import process_document_pipeline
from app.services.rag.indexer import index_knowledge_collection
from app.services.agent.deliverable_generator import generate_approval_docx, generate_audit_xlsx

async def seed_demo_data():
    async with AsyncSessionLocal() as session:
        # Check if already seeded
        res = await session.execute(select(Organization))
        if res.scalars().first():
            return

        # 1. Organization
        org = Organization(
            name="ABC Industrial Systems Ltd.",
            slug="abc-industrial"
        )
        session.add(org)
        await session.flush()

        # 2. Users
        users = [
            User(
                organization_id=org.id,
                email="admin@abc-industrial.in",
                full_name="Rajesh Verma",
                role="ADMINISTRATOR",
                department="Plant Operations & Governance",
                status="Active"
            ),
            User(
                organization_id=org.id,
                email="engineer@abc-industrial.in",
                full_name="Ananya Sharma",
                role="ENGINEER",
                department="Refinery Unit 4B Safety",
                status="Active"
            ),
            User(
                organization_id=org.id,
                email="auditor@abc-industrial.in",
                full_name="Vikramaditya Rao",
                role="AUDITOR",
                department="PSU Compliance Audit",
                status="Active"
            ),
            User(
                organization_id=org.id,
                email="reviewer@abc-industrial.in",
                full_name="Suresh Kumar",
                role="REVIEWER",
                department="Engineering Review",
                status="Active"
            )
        ]
        session.add_all(users)
        await session.flush()
        admin_user = users[0]

        # 3. AI Models
        ai_models = [
            AIModel(
                name="qwen2.5:7b-instruct",
                model_type="GENERAL",
                provider="OLLAMA",
                endpoint_url="http://localhost:11434",
                is_active=True,
                is_default=True,
                context_window=8192,
                latency_ms=45,
                status="ONLINE"
            ),
            AIModel(
                name="qwen2.5-coder:7b",
                model_type="CODING",
                provider="OLLAMA",
                endpoint_url="http://localhost:11434",
                is_active=True,
                is_default=False,
                context_window=8192,
                latency_ms=38,
                status="ONLINE"
            ),
            AIModel(
                name="llama3.2-vision:11b",
                model_type="VISION",
                provider="OLLAMA",
                endpoint_url="http://localhost:11434",
                is_active=True,
                is_default=False,
                context_window=8192,
                latency_ms=62,
                status="ONLINE"
            )
        ]
        session.add_all(ai_models)
        await session.flush()

        # Write physical demo files to disk for real extraction
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        pdf_path = os.path.join(settings.UPLOAD_DIR, "Equipment_Inspection_Report_Scanned.pdf")
        sop_path = os.path.join(settings.UPLOAD_DIR, "Safety_SOP_Refinery_2026.pdf")
        csv_path = os.path.join(settings.UPLOAD_DIR, "Equipment_Metrics.csv")

        if not os.path.exists(csv_path):
            with open(csv_path, "w", encoding="utf-8") as f:
                f.write("timestamp,equipment_id,pressure_bar,temperature_c,status\n2026-08-27T08:00:00,P-102A,48.5,82.4,ALERT\n2026-08-27T09:00:00,P-102A,48.8,83.1,ALERT\n")

        if not os.path.exists(sop_path):
            with open(sop_path, "w", encoding="utf-8") as f:
                f.write("REFINERY SAFETY STANDARD OPERATING PROCEDURE 2026\nSection 4.2: Discharge Pressure Exceedance Protocols.\nWhen discharge pressure exceeds 45.0 BAR, immediate load transfer to backup pump is required.")

        if not os.path.exists(pdf_path):
            with open(pdf_path, "w", encoding="utf-8") as f:
                f.write("EQUIPMENT INSPECTION REPORT\nUnit: Refinery 4B\nTarget: Pump P-102A\nFindings: Discharge pressure registered at 48.5 BAR (7.78% over limit).")

        # 4. Insert Documents
        docs = [
            Document(
                organization_id=org.id,
                filename="Equipment_Inspection_Report_Scanned.pdf",
                original_filename="Equipment_Inspection_Report_Scanned.pdf",
                file_path=pdf_path,
                file_type="PDF",
                file_size=os.path.getsize(pdf_path) if os.path.exists(pdf_path) else 1024,
                uploaded_by=admin_user.id,
                status="UPLOADED",
                ocr_status="PENDING",
                ocr_applied=False
            ),
            Document(
                organization_id=org.id,
                filename="Safety_SOP_Refinery_2026.pdf",
                original_filename="Safety_SOP_Refinery_2026.pdf",
                file_path=sop_path,
                file_type="PDF",
                file_size=os.path.getsize(sop_path) if os.path.exists(sop_path) else 1024,
                uploaded_by=admin_user.id,
                status="UPLOADED",
                ocr_status="NOT_REQUIRED",
                ocr_applied=False
            ),
            Document(
                organization_id=org.id,
                filename="Equipment_Metrics.csv",
                original_filename="Equipment_Metrics.csv",
                file_path=csv_path,
                file_type="CSV",
                file_size=os.path.getsize(csv_path) if os.path.exists(csv_path) else 1024,
                uploaded_by=admin_user.id,
                status="UPLOADED",
                ocr_status="NOT_REQUIRED",
                ocr_applied=False
            )
        ]
        session.add_all(docs)
        await session.flush()

        # 5. Run real ingestion pipeline for seeded documents
        for doc in docs:
            await process_document_pipeline(doc.id, session)

        # 6. Knowledge Collection & Indexing
        kb = KnowledgeBase(
            organization_id=org.id,
            name="ABC Refinery Safety Knowledge Base",
            description="Safety SOPs, inspection standards, equipment operational thresholds, and emergency procedures.",
            status="ACTIVE",
            vector_index_status="NOT_INDEXED",
            doc_count=len(docs),
            chunk_count=sum(d.chunk_count for d in docs)
        )
        session.add(kb)
        await session.flush()

        # Run collection indexing
        await index_knowledge_collection(kb.id, session)

        # 7. Workflows
        workflows = [
            WorkflowTemplate(
                name="Inspection Review & Approval",
                description="OCR Inspection Report → SOP Grounding → Math Sandbox → Human Review → DOCX",
                category="Flagship Workflow",
                status="READY"
            ),
            WorkflowTemplate(
                name="CSV Equipment Analytics",
                description="Read Metrics CSV → Sandboxed Python Analysis → XLSX Summary",
                category="Data Analytics",
                status="READY"
            ),
            WorkflowTemplate(
                name="SOP Compliance Audit",
                description="Compare operational document logs against Safety SOP guidelines",
                category="Compliance",
                status="READY"
            ),
            WorkflowTemplate(
                name="Incident Report Analysis",
                description="Analyze root causes and extract mandatory corrective actions",
                category="Safety",
                status="READY"
            )
        ]
        session.add_all(workflows)

        # 8. Deliverables (Physical DOCX & XLSX Generation)
        os.makedirs(settings.DELIVERABLES_DIR, exist_ok=True)
        docx_path = os.path.join(settings.DELIVERABLES_DIR, "Emergency_Shutdown_Approval_Note.docx")
        xlsx_path = os.path.join(settings.DELIVERABLES_DIR, "Equipment_Inspection_Audit.xlsx")

        generate_approval_docx(file_path=docx_path)
        generate_audit_xlsx(file_path=xlsx_path)

        deliverables = [
            Deliverable(
                organization_id=org.id,
                title="Emergency Shutdown Approval Note",
                file_type="DOCX",
                file_path=docx_path,
                file_size=os.path.getsize(docx_path) if os.path.exists(docx_path) else 24576,
                version=1,
                approval_status="PENDING"
            ),
            Deliverable(
                organization_id=org.id,
                title="Equipment Inspection Audit Summary",
                file_type="XLSX",
                file_path=xlsx_path,
                file_size=os.path.getsize(xlsx_path) if os.path.exists(xlsx_path) else 18432,
                version=1,
                approval_status="APPROVED"
            )
        ]
        session.add_all(deliverables)

        # 9. Audit Events
        audit_events = [
            AuditLog(
                organization_id=org.id,
                user_id=admin_user.id,
                user_name=admin_user.full_name,
                action="SYSTEM_INITIALIZATION",
                resource_type="SYSTEM",
                status="SUCCESS",
                details_json='{"message": "Sovereign AI Workbench initialized in private offline environment."}'
            )
        ]
        session.add_all(audit_events)
        await session.commit()
