from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict

class HealthCheckResponse(BaseModel):
    status: str
    database: str
    environment: Optional[str] = "development"
    external_ai: bool
    project: str

class DashboardStats(BaseModel):
    documents_count: int
    knowledge_bases_count: int
    active_models_count: int
    deliverables_count: int
    audit_events_count: int
    system_status: str = "ONLINE"

class SecurityStatusRead(BaseModel):
    airgap_status: str = "ENFORCED"
    external_network_blocked: bool = True
    active_audit_logging: bool = True
    sovereign_mode: bool = True
    storage_encrypted: bool = True

# Organization & User Schemas
class OrganizationResponse(BaseModel):
    id: str
    name: str
    slug: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    department: str
    status: str
    is_active: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Document Schemas
class DocumentContentResponse(BaseModel):
    id: str
    document_id: str
    page_number: int
    section: Optional[str] = None
    content_type: str
    content: str
    metadata_json: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class DocumentChunkResponse(BaseModel):
    id: str
    document_id: str
    content_id: Optional[str] = None
    chunk_index: int
    text: str
    page_number: int
    token_count: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class DocumentProcessingStatusResponse(BaseModel):
    id: str
    filename: str
    status: str
    processing_status: Optional[str] = "UPLOADED"
    ocr_status: str
    ocr_applied: bool
    page_count: int
    character_count: int
    chunk_count: int
    processing_duration_ms: int
    extraction_method: Optional[str] = None
    processing_error: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class DocumentResponse(BaseModel):
    id: str
    filename: str
    original_filename: Optional[str] = None
    file_type: str
    file_size: int
    file_hash: Optional[str] = None
    status: str
    processing_status: Optional[str] = "UPLOADED"
    ocr_status: str
    ocr_applied: bool
    page_count: Optional[int] = 0
    character_count: Optional[int] = 0
    chunk_count: Optional[int] = 0
    processing_duration_ms: Optional[int] = 0
    extraction_method: Optional[str] = None
    extracted_text: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class KnowledgeBaseBase(BaseModel):
    name: str
    description: Optional[str] = None

class KnowledgeBaseCreate(KnowledgeBaseBase):
    pass

class KnowledgeBaseResponse(KnowledgeBaseBase):
    id: str
    status: str
    doc_count: int
    chunk_count: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class WorkflowTemplateResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    category: str
    status: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class WorkflowExecutionResponse(BaseModel):
    id: str
    workflow_id: Optional[str] = None
    user_id: str
    prompt: str
    status: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    total_steps: Optional[int] = 5
    output_summary: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

AgentRunResponse = WorkflowExecutionResponse

class DeliverableResponse(BaseModel):
    id: str
    title: str
    file_type: str
    file_size: int
    version: int
    approval_status: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class AuditLogResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    user_name: Optional[str] = None
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    status: str
    details_json: Optional[str] = None
    ip_address: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class AIModelResponse(BaseModel):
    id: str
    name: str
    model_type: str
    provider: str
    endpoint_url: str
    is_active: bool
    is_default: bool
    context_window: int
    latency_ms: Optional[int] = 45
    status: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
