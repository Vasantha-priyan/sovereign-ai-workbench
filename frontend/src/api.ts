import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface DashboardStats {
  documents_count: number;
  knowledge_bases_count: number;
  active_models_count: number;
  deliverables_count: number;
  audit_events_count: number;
  system_status: string;
}

export interface DocumentItem {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  uploaded_by?: string;
  status: string;
  ocr_applied: boolean;
  extracted_text?: string;
  created_at: string;
}

export interface KnowledgeBaseItem {
  id: string;
  name: string;
  description?: string;
  doc_count: number;
  chunk_count: number;
  created_at: string;
}

export interface AIModelItem {
  id: string;
  name: string;
  model_type: string;
  provider: string;
  endpoint_url: string;
  is_active: boolean;
  is_default: boolean;
  context_window: number;
  latency_ms: number;
  status: string;
  created_at: string;
}

export interface AgentStep {
  step_number: number;
  thought?: string;
  action_tool?: string;
  tool_input?: string;
  tool_output?: string;
  status: string;
  duration_ms: number;
}

export interface AgentRunItem {
  id: string;
  prompt: string;
  status: string;
  model_used?: string;
  total_steps: number;
  output_summary?: string;
  steps: AgentStep[];
  created_at: string;
}

export interface DeliverableItem {
  id: string;
  title: string;
  file_type: string;
  file_path?: string;
  file_size: number;
  version: number;
  approval_status: string;
  created_at: string;
}

export interface AuditLogItem {
  id: string;
  user_name?: string;
  action: string;
  resource_type: string;
  status: string;
  details_json?: string;
  ip_address: string;
  created_at: string;
}

export interface SecurityStatus {
  airgap_status: string;
  external_network_blocked: boolean;
  active_audit_logging: boolean;
  sovereign_mode: boolean;
  storage_encrypted: boolean;
}
