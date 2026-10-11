import React, { useEffect, useState } from 'react';
import { api, AgentRunItem } from '../api';
import { GitFork, Play, CheckCircle2, FileText, Eye, Database, Cpu, AlertCircle, Lock, Bot, Sparkles, ShieldCheck } from 'lucide-react';

export const WorkflowsView: React.FC = () => {
  const [runs, setRuns] = useState<AgentRunItem[]>([]);
  const [executing, setExecuting] = useState(false);
  const [approvalState, setApprovalState] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [workflowStatusMessage, setWorkflowStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchAgentRuns();
  }, []);

  const fetchAgentRuns = async () => {
    try {
      const res = await api.get('/agents/runs');
      setRuns(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunWorkflow = async () => {
    setExecuting(true);
    setWorkflowStatusMessage("WORKFLOW READY — Execution Preview Initialized.");
    setApprovalState('PENDING');
    try {
      await api.post('/agents/run', { prompt: 'Analyze this inspection report and prepare an approval note according to our safety SOP.' });
      fetchAgentRuns();
    } catch (err) {
      console.error(err);
    } finally {
      setExecuting(false);
    }
  };

  const pipelineSteps = [
    { step: '01', name: 'INPUT', status: 'COMPLETED', detail: 'Equipment_Inspection_Report.pdf', icon: FileText },
    { step: '02', name: 'DOCUMENT ANALYSIS', status: 'COMPLETED', detail: 'llama3.2-vision:11b OCR', icon: Eye },
    { step: '03', name: 'KNOWLEDGE RETRIEVAL', status: 'COMPLETED', detail: 'Safety_SOP_2026.pdf Section 4.2', icon: Database },
    { step: '04', name: 'AI ANALYSIS', status: 'COMPLETED', detail: 'qwen2.5-coder:7b (7.78% calc)', icon: Cpu },
    { step: '05', name: 'HUMAN REVIEW', status: approvalState === 'APPROVED' ? 'COMPLETED' : 'WAITING', detail: 'Chief Engineer Sign-off Required', icon: AlertCircle },
    { step: '06', name: 'DELIVERABLE', status: approvalState === 'APPROVED' ? 'COMPLETED' : 'LOCKED', detail: 'Approval_Note_P102A.docx', icon: Lock },
  ];

  const workflowCards = [
    {
      name: 'INSPECTION REVIEW & APPROVAL',
      stages: 'Document Analysis → SOP Grounding → AI Analysis → Human Review → Deliverable',
      status: '● READY'
    },
    {
      name: 'CSV EQUIPMENT ANALYTICS',
      stages: 'CSV → Data Analysis → Metrics → XLSX Report',
      status: '● READY'
    },
    {
      name: 'SOP COMPLIANCE AUDIT',
      stages: 'Documents → SOP Comparison → Findings → Review',
      status: '● READY'
    },
    {
      name: 'INCIDENT REPORT ANALYSIS',
      stages: 'Incident Report → Root Cause Analysis → Corrective Actions → Review',
      status: '● READY'
    }
  ];

  const simpleAgents = [
    { name: 'Document Analysis Agent', purpose: 'Extracts structured data and scanned OCR text from industrial files.', status: '● READY' },
    { name: 'Knowledge Retrieval Agent', purpose: 'Fetches grounded citations from Refinery Safety Knowledge Base.', status: '● READY' },
    { name: 'Safety Compliance Agent', purpose: 'Evaluates pressure exceedance against SOP Section 4.2 rules.', status: '● READY' },
    { name: 'Report Generation Agent', purpose: 'Builds formal Word (.docx) approval notes and Excel summaries.', status: '● READY' }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Workspace</span>
            <span>/</span>
            <span className="font-semibold text-slate-700">Agents & Workflows</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">AGENTS & WORKFLOWS</h2>
          <p className="text-xs text-slate-500">Automate repeatable industrial analysis with controlled human-in-the-loop execution.</p>
        </div>

        <button
          onClick={handleRunWorkflow}
          disabled={executing}
          className="px-4 py-2 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white font-semibold text-xs rounded flex items-center gap-2 transition-colors shadow-sm"
        >
          <Play className="w-3.5 h-3.5" />
          <span>{executing ? 'Executing...' : 'Run Workflow'}</span>
        </button>
      </div>

      {workflowStatusMessage && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900 font-semibold flex items-center justify-between">
          <span>{workflowStatusMessage}</span>
          <button onClick={() => setWorkflowStatusMessage(null)} className="text-blue-700 font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {/* VISUAL PIPELINE FLOW DIAGRAM */}
      <div className="bg-white border border-slate-200 rounded p-5 space-y-4 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <GitFork className="w-4 h-4 text-blue-900" />
          Inspection Review Visual Pipeline Architecture
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 pt-2">
          {pipelineSteps.map((s, idx) => {
            const isDone = s.status === 'COMPLETED';
            const isWaiting = s.status === 'WAITING';
            return (
              <div
                key={idx}
                className={`p-3.5 rounded border flex flex-col justify-between space-y-2 text-xs relative ${
                  isDone
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                    : isWaiting
                    ? 'bg-amber-50 border-amber-300 text-amber-950 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold opacity-60">STEP {s.step}</span>
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : isWaiting ? (
                      <span className="px-1.5 py-0.5 bg-amber-200 text-amber-900 rounded font-bold text-[9px]">WAITING</span>
                    ) : (
                      <Lock className="w-3.5 h-3.5 opacity-40" />
                    )}
                  </div>
                  <p className="font-bold leading-tight text-xs">{s.name}</p>
                  <p className="text-[10px] opacity-80 leading-normal">{s.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Workflow Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Industrial Workflow Pipeline Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workflowCards.map((card, idx) => (
            <div key={idx} className="p-4 bg-white border border-slate-200 rounded space-y-3 shadow-sm flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">{card.name}</h4>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-bold">
                    {card.status}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-blue-900 bg-slate-50 p-2 rounded border border-slate-200">{card.stages}</p>
              </div>

              <button
                onClick={handleRunWorkflow}
                className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded flex items-center justify-center gap-1.5 transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Open Workflow</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SIMPLE AGENT SECTION */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Autonomous Agent Registry</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {simpleAgents.map((ag, idx) => (
            <div key={idx} className="p-3.5 bg-white border border-slate-200 rounded space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-blue-900" />
                  {ag.name}
                </span>
                <span className="text-[10px] font-bold text-emerald-700">{ag.status}</span>
              </div>
              <p className="text-[11px] text-slate-600">{ag.purpose}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
