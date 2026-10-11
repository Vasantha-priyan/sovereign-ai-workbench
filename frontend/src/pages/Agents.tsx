import React from 'react';
import { Bot, Cpu, Wrench, Database, Play, Settings, CheckCircle2 } from 'lucide-react';

interface AgentsProps {
  onNavigate?: (tab: string) => void;
}

export const AgentsView: React.FC<AgentsProps> = ({ onNavigate }) => {
  const agentsList = [
    {
      name: 'Document Analyst',
      purpose: 'Analyzes confidential industrial documents and scanned PDFs using local multimodal AI.',
      model: 'llama3.2-vision:11b',
      tools: ['OCR', 'Document Search', 'Knowledge Retrieval'],
      knowledge: 'ABC Refinery Safety KB',
      status: 'Ready'
    },
    {
      name: 'Compliance Analyst',
      purpose: 'Compares operational inspection findings against Refinery Safety SOP Section 4.2 guidelines.',
      model: 'qwen2.5:7b-instruct',
      tools: ['KB Search', 'SOP Evaluator', 'Citation Engine'],
      knowledge: 'Refinery SOP 2026',
      status: 'Ready'
    },
    {
      name: 'Data Analyst',
      purpose: 'Generates Python analytics scripts and executes them inside an isolated zero-network sandbox.',
      model: 'qwen2.5-coder:7b',
      tools: ['Python Sandbox', 'CSV Reader', 'Stats Evaluator'],
      knowledge: 'Equipment Metrics CSV',
      status: 'Ready'
    },
    {
      name: 'Report Generator',
      purpose: 'Generates structured Word (.docx) approval notes and Excel (.xlsx) audit metrics.',
      model: 'qwen2.5:7b-instruct',
      tools: ['DOCX Builder', 'XLSX Builder', 'PPTX Slides'],
      knowledge: 'Deliverables Template',
      status: 'Ready'
    },
    {
      name: 'Engineering Review Agent',
      purpose: 'Performs deterministic engineering math calculations (pressure exceedance, flow rate, stress).',
      model: 'qwen2.5-coder:7b',
      tools: ['Engineering Calc', 'Python Sandbox'],
      knowledge: 'Engineering Guidelines',
      status: 'Ready'
    }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Agents</h2>
          <p className="text-xs text-slate-500">Autonomous AI agents configured for confidential industrial tasks.</p>
        </div>
      </div>

      {/* Agents Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agentsList.map((agent, idx) => (
          <div key={idx} className="p-5 bg-white border border-slate-200 rounded flex flex-col justify-between space-y-4 shadow-sm hover:border-slate-300 transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-50 border border-blue-200 rounded text-blue-900">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{agent.name}</h3>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-800 font-semibold mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      <span>● {agent.status}</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{agent.purpose}</p>

              <div className="space-y-1.5 text-[11px] text-slate-700 font-mono bg-slate-50 p-2.5 rounded border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-400">Model:</span>
                  <span className="font-semibold text-slate-900">{agent.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Knowledge:</span>
                  <span className="text-slate-800">{agent.knowledge}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Tools:</span>
                  <div className="flex flex-wrap gap-1">
                    {agent.tools.map((t, ti) => (
                      <span key={ti} className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-800 font-sans">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => onNavigate && onNavigate('workflows')}
                className="flex-1 py-1.5 bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs rounded flex items-center justify-center gap-1.5 transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Open Agent</span>
              </button>
              <button
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded flex items-center gap-1 transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Configure</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
