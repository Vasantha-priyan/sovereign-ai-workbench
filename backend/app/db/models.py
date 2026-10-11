import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Text, Integer, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    users: Mapped[list["User"]] = relationship("User", back_populates="organization")

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    organization_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id"), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False, default="HASHED_PASSWORD_SALT")
    role: Mapped[str] = mapped_column(String(50), default="ADMINISTRATOR")
    department: Mapped[str] = mapped_column(String(255), default="Plant Operations & Governance")
    status: Mapped[str] = mapped_column(String(50), default="Active")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    organization: Mapped["Organization"] = relationship("Organization", back_populates="users")

class Document(Base):
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    organization_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id"), nullable=False)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    original_filename: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    file_path: Mapped[str] = mapped_column(String(512), nullable=False)
    file_type: Mapped[str] = mapped_column(String(50), nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, nullable=False)
    file_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    uploaded_by: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="UPLOADED")
    processing_status: Mapped[Optional[str]] = mapped_column(String(50), default="UPLOADED")
    ocr_status: Mapped[str] = mapped_column(String(50), default="NOT_REQUIRED")
    ocr_applied: Mapped[bool] = mapped_column(Boolean, default=False)
    extracted_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    page_count: Mapped[int] = mapped_column(Integer, default=0)
    character_count: Mapped[int] = mapped_column(Integer, default=0)
    chunk_count: Mapped[int] = mapped_column(Integer, default=0)
    processing_duration_ms: Mapped[int] = mapped_column(Integer, default=0)
    extraction_method: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    processing_error: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    metadata_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    contents: Mapped[list["DocumentContent"]] = relationship("DocumentContent", back_populates="document", cascade="all, delete-orphan")
    chunks: Mapped[list["DocumentChunk"]] = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")

class DocumentContent(Base):
    __tablename__ = "document_contents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    document_id: Mapped[str] = mapped_column(String(36), ForeignKey("documents.id"), nullable=False)
    page_number: Mapped[int] = mapped_column(Integer, default=1)
    section: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    content_type: Mapped[str] = mapped_column(String(50), default="TEXT")
    content: Mapped[str] = mapped_column(Text, nullable=False)
    metadata_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    document: Mapped["Document"] = relationship("Document", back_populates="contents")
    chunks: Mapped[list["DocumentChunk"]] = relationship("DocumentChunk", back_populates="content_obj")

class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    document_id: Mapped[str] = mapped_column(String(36), ForeignKey("documents.id"), nullable=False)
    content_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("document_contents.id"), nullable=True)
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    page_number: Mapped[int] = mapped_column(Integer, default=1)
    token_count: Mapped[int] = mapped_column(Integer, default=0)
    metadata_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    document: Mapped["Document"] = relationship("Document", back_populates="chunks")
    content_obj: Mapped[Optional["DocumentContent"]] = relationship("DocumentContent", back_populates="chunks")
    embedding: Mapped[Optional["DocumentEmbedding"]] = relationship("DocumentEmbedding", back_populates="chunk", uselist=False, cascade="all, delete-orphan")

class DocumentEmbedding(Base):
    __tablename__ = "document_embeddings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    chunk_id: Mapped[str] = mapped_column(String(36), ForeignKey("document_chunks.id"), nullable=False)
    document_id: Mapped[str] = mapped_column(String(36), ForeignKey("documents.id"), nullable=False)
    kb_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("knowledge_bases.id"), nullable=True)
    embedding_json: Mapped[str] = mapped_column(Text, nullable=False) # JSON array of floats
    embedding_model: Mapped[str] = mapped_column(String(100), default="all-MiniLM-L6-v2")
    dimension: Mapped[int] = mapped_column(Integer, default=384)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    chunk: Mapped["DocumentChunk"] = relationship("DocumentChunk", back_populates="embedding")

class KnowledgeBase(Base):
    __tablename__ = "knowledge_bases"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    organization_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="ACTIVE")
    vector_index_status: Mapped[str] = mapped_column(String(50), default="INDEXED") # INDEXED, INDEXING, NOT_INDEXED
    doc_count: Mapped[int] = mapped_column(Integer, default=0)
    chunk_count: Mapped[int] = mapped_column(Integer, default=0)
    last_indexed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    kb_id: Mapped[str] = mapped_column(String(36), ForeignKey("knowledge_bases.id"), nullable=False)
    document_id: Mapped[str] = mapped_column(String(36), ForeignKey("documents.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="INDEXED")
    chunk_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

class Conversation(Base):
    __tablename__ = "conversations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), default="New Conversation")
    selected_model: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="ACTIVE")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

class Message(Base):
    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    conversation_id: Mapped[str] = mapped_column(String(36), ForeignKey("conversations.id"), nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    model_used: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    citations_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    tool_calls_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

class WorkflowTemplate(Base):
    __tablename__ = "workflow_templates"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(100), default="Flagship Workflow")
    status: Mapped[str] = mapped_column(String(50), default="READY")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

class AgentRun(Base):
    __tablename__ = "agent_runs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    workflow_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("workflow_templates.id"), nullable=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="QUEUED")
    model_used: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    total_steps: Mapped[int] = mapped_column(Integer, default=0)
    output_summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

class Deliverable(Base):
    __tablename__ = "deliverables"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    organization_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id"), nullable=False)
    agent_run_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("agent_runs.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    file_type: Mapped[str] = mapped_column(String(50), nullable=False)
    file_path: Mapped[str] = mapped_column(String(512), nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, default=1024)
    version: Mapped[int] = mapped_column(Integer, default=1)
    approval_status: Mapped[str] = mapped_column(String(50), default="PENDING")
    source_doc_ids: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    organization_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id"), nullable=False)
    user_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    user_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    resource_type: Mapped[str] = mapped_column(String(100), nullable=False)
    resource_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="SUCCESS")
    details_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ip_address: Mapped[str] = mapped_column(String(45), default="127.0.0.1")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

class AIModel(Base):
    __tablename__ = "ai_models"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    model_type: Mapped[str] = mapped_column(String(50), nullable=False)
    provider: Mapped[str] = mapped_column(String(100), default="OLLAMA")
    endpoint_url: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)
    context_window: Mapped[int] = mapped_column(Integer, default=8192)
    latency_ms: Mapped[Optional[int]] = mapped_column(Integer, default=45)
    status: Mapped[str] = mapped_column(String(50), default="ONLINE")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
