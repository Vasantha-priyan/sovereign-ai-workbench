import os
import json
import time
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import Document, DocumentContent, DocumentChunk, AuditLog, KnowledgeBase
from app.services.ingestion.pdf_parser import parse_pdf_document
from app.services.ingestion.ocr_engine import perform_ocr_on_pdf_page
from app.services.ingestion.csv_parser import parse_csv_document
from app.services.ingestion.docx_parser import parse_docx_document
from app.services.ingestion.txt_parser import parse_txt_document
from app.services.ingestion.chunker import generate_document_chunks
from app.services.ingestion.validators import calculate_sha256
from app.services.rag.indexer import index_knowledge_collection

async def process_document_pipeline(document_id: str, db: AsyncSession) -> Document:
    start_time = time.time()

    # 1. Fetch document record
    res = await db.execute(select(Document).where(Document.id == document_id))
    doc = res.scalar_one_or_none()
    if not doc:
        raise ValueError(f"Document ID '{document_id}' not found")

    # Update status to PROCESSING
    doc.status = "PROCESSING"
    doc.processing_status = "PROCESSING"
    await db.commit()

    # Log audit event
    audit_start = AuditLog(
        organization_id=doc.organization_id,
        user_id=doc.uploaded_by,
        action="DOCUMENT_PROCESSING_STARTED",
        resource_type="DOCUMENT",
        resource_id=doc.id,
        status="SUCCESS",
        details_json=f'{{"filename": "{doc.filename}"}}'
    )
    db.add(audit_start)
    await db.commit()

    try:
        file_path = doc.file_path
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found at '{file_path}'")

        file_ext = os.path.splitext(doc.filename)[1].lower()
        doc.file_hash = calculate_sha256(file_path)

        all_contents: list[DocumentContent] = []
        all_chunks: list[DocumentChunk] = []
        extraction_method = "txt_raw"
        ocr_applied = False
        ocr_status = "NOT_REQUIRED"
        total_pages = 1
        total_chars = 0

        # Delete existing contents/chunks if re-processing
        await db.execute(delete(DocumentContent).where(DocumentContent.document_id == doc.id))
        await db.execute(delete(DocumentChunk).where(DocumentChunk.document_id == doc.id))
        await db.commit()

        # 2. Execute parser based on extension
        if file_ext == ".pdf":
            parsed_pdf = parse_pdf_document(file_path)
            total_pages = parsed_pdf["page_count"]
            extraction_method = "pdf_text"

            for page_info in parsed_pdf["pages"]:
                page_num = page_info["page_number"]
                page_text = page_info["text"]

                # OCR Execution for scanned pages
                if page_info["needs_ocr"]:
                    ocr_status = "PROCESSING"
                    audit_ocr = AuditLog(
                        organization_id=doc.organization_id,
                        user_id=doc.uploaded_by,
                        action="DOCUMENT_OCR_STARTED",
                        resource_type="DOCUMENT",
                        resource_id=doc.id,
                        status="SUCCESS",
                        details_json=f'{{"page_number": {page_num}}}'
                    )
                    db.add(audit_ocr)

                    ocr_result = perform_ocr_on_pdf_page(file_path, page_num)
                    if ocr_result["success"] and ocr_result["ocr_text"]:
                        page_text = f"[OCR EXTRACTED PAGE {page_num}]\n" + ocr_result["ocr_text"]
                        ocr_applied = True
                        ocr_status = "COMPLETED"
                        extraction_method = "ocr_tesseract"
                    else:
                        ocr_status = "FAILED"

                content_obj = DocumentContent(
                    document_id=doc.id,
                    page_number=page_num,
                    content_type="OCR_TEXT" if ocr_applied else "TEXT",
                    content=page_text,
                    metadata_json=json.dumps({"char_count": len(page_text), "page": page_num})
                )
                db.add(content_obj)
                await db.flush()
                all_contents.append(content_obj)
                total_chars += len(page_text)

                # Generate Chunks
                page_chunks = generate_document_chunks(page_text, page_number=page_num, content_id=content_obj.id)
                for chunk_data in page_chunks:
                    chunk_obj = DocumentChunk(
                        document_id=doc.id,
                        content_id=content_obj.id,
                        chunk_index=len(all_chunks),
                        text=chunk_data["text"],
                        page_number=page_num,
                        token_count=chunk_data["token_count"]
                    )
                    db.add(chunk_obj)
                    all_chunks.append(chunk_obj)

        elif file_ext == ".csv":
            extraction_method = "csv_parsed"
            parsed_csv = parse_csv_document(file_path)
            content_obj = DocumentContent(
                document_id=doc.id,
                page_number=1,
                content_type="TABLE",
                content=parsed_csv["content_formatted"],
                metadata_json=parsed_csv["table_json"]
            )
            db.add(content_obj)
            await db.flush()
            all_contents.append(content_obj)
            total_chars = len(parsed_csv["content_formatted"])

            page_chunks = generate_document_chunks(parsed_csv["content_formatted"], page_number=1, content_id=content_obj.id)
            for chunk_data in page_chunks:
                chunk_obj = DocumentChunk(
                    document_id=doc.id,
                    content_id=content_obj.id,
                    chunk_index=len(all_chunks),
                    text=chunk_data["text"],
                    page_number=1,
                    token_count=chunk_data["token_count"]
                )
                db.add(chunk_obj)
                all_chunks.append(chunk_obj)

        elif file_ext == ".docx":
            extraction_method = "docx_parsed"
            parsed_docx = parse_docx_document(file_path)
            content_obj = DocumentContent(
                document_id=doc.id,
                page_number=1,
                content_type="TEXT",
                content=parsed_docx["content_formatted"],
                metadata_json=json.dumps({"paragraphs": parsed_docx["paragraph_count"], "tables": parsed_docx["table_count"]})
            )
            db.add(content_obj)
            await db.flush()
            all_contents.append(content_obj)
            total_chars = parsed_docx["total_characters"]

            page_chunks = generate_document_chunks(parsed_docx["content_formatted"], page_number=1, content_id=content_obj.id)
            for chunk_data in page_chunks:
                chunk_obj = DocumentChunk(
                    document_id=doc.id,
                    content_id=content_obj.id,
                    chunk_index=len(all_chunks),
                    text=chunk_data["text"],
                    page_number=1,
                    token_count=chunk_data["token_count"]
                )
                db.add(chunk_obj)
                all_chunks.append(chunk_obj)

        else: # .txt
            extraction_method = "txt_raw"
            parsed_txt = parse_txt_document(file_path)
            content_obj = DocumentContent(
                document_id=doc.id,
                page_number=1,
                content_type="TEXT",
                content=parsed_txt["content_formatted"],
                metadata_json=json.dumps({"char_count": parsed_txt["total_characters"]})
            )
            db.add(content_obj)
            await db.flush()
            all_contents.append(content_obj)
            total_chars = parsed_txt["total_characters"]

            page_chunks = generate_document_chunks(parsed_txt["content_formatted"], page_number=1, content_id=content_obj.id)
            for chunk_data in page_chunks:
                chunk_obj = DocumentChunk(
                    document_id=doc.id,
                    content_id=content_obj.id,
                    chunk_index=len(all_chunks),
                    text=chunk_data["text"],
                    page_number=1,
                    token_count=chunk_data["token_count"]
                )
                db.add(chunk_obj)
                all_chunks.append(chunk_obj)

        # 3. Update document metadata
        duration_ms = int((time.time() - start_time) * 1000)
        doc.status = "PROCESSED"
        doc.processing_status = "PROCESSED"
        doc.ocr_applied = ocr_applied
        doc.ocr_status = ocr_status
        doc.page_count = total_pages
        doc.character_count = total_chars
        doc.chunk_count = len(all_chunks)
        doc.processing_duration_ms = duration_ms
        doc.extraction_method = extraction_method
        doc.extracted_text = all_contents[0].content if all_contents else ""
        doc.metadata_json = json.dumps({
            "extraction_method": extraction_method,
            "ocr_applied": ocr_applied,
            "page_count": total_pages,
            "chunk_count": len(all_chunks),
            "character_count": total_chars
        })

        # Log audit completion
        audit_done = AuditLog(
            organization_id=doc.organization_id,
            user_id=doc.uploaded_by,
            action="DOCUMENT_PROCESSING_COMPLETED",
            resource_type="DOCUMENT",
            resource_id=doc.id,
            status="SUCCESS",
            details_json=f'{{"pages": {total_pages}, "chunks": {len(all_chunks)}, "duration_ms": {duration_ms}}}'
        )
        db.add(audit_done)
        await db.commit()

        # 4. Auto-Index chunks into local vector store
        try:
            kb_res = await db.execute(select(KnowledgeBase))
            kb = kb_res.scalars().first()
            if kb:
                await index_knowledge_collection(kb.id, db)
        except Exception:
            pass

        await db.refresh(doc)
        return doc

    except Exception as e:
        duration_ms = int((time.time() - start_time) * 1000)
        doc.status = "FAILED"
        doc.processing_status = "FAILED"
        doc.processing_error = str(e)

        audit_err = AuditLog(
            organization_id=doc.organization_id,
            user_id=doc.uploaded_by,
            action="DOCUMENT_PROCESSING_FAILED",
            resource_type="DOCUMENT",
            resource_id=doc.id,
            status="FAILED",
            details_json=f'{{"error": "{str(e)}"}}'
        )
        db.add(audit_err)
        await db.commit()
        await db.refresh(doc)
        return doc
