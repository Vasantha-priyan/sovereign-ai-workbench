import React, { useEffect, useState } from 'react';
import { api, AIModelItem } from '../api';
import { Cpu, RefreshCw, Route, ShieldCheck, ArrowRight } from 'lucide-react';

export const ModelsView: React.FC = () => {
  const [models, setModels] = useState<AIModelItem[]>([]);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const res = await api.get('/models');
      setModels(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleHealthCheck = async (id: string) => {
    try {
      await api.post(`/models/${id}/health`);
      fetchModels();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Local Models</h2>
          <p className="text-xs text-slate-500">Open-weight models available inside your private environment.</p>
        </div>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {models.map((model) => (
          <div key={model.id} className="p-5 bg-white border border-slate-200 rounded space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 border border-blue-200 rounded text-blue-900">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">{model.name}</h3>
                </div>
                <span className="px-2 py-0.5 bg-blue-900 text-white text-[10px] rounded font-bold uppercase tracking-wider">
                  {model.model_type}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 font-mono bg-slate-50 p-3 rounded border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Context Window:</span>
                  <span className="font-bold text-slate-900">{model.context_window} tokens</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Runtime Provider:</span>
                  <span className="text-slate-800">{model.provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Status:</span>
                  <span className="text-emerald-700 font-bold">● {model.status}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleHealthCheck(model.id)}
              className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Test Local Endpoint</span>
            </button>
          </div>
        ))}
      </div>

      {/* VISUAL ARCHITECTURE DIAGRAM */}
      <div className="p-5 bg-white border border-slate-200 rounded space-y-3 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <Route className="w-4 h-4 text-blue-900" />
          Model Router & Infrastructure Architecture
        </h3>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-800">
          <div className="p-3 bg-white border border-slate-200 rounded text-center min-w-[140px] shadow-sm">
            <span>User Request</span>
            <p className="text-[10px] text-slate-400 font-normal">Task Prompt</p>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 hidden md:block" />

          <div className="p-3 bg-blue-900 text-white rounded text-center min-w-[160px] shadow-sm">
            <span>Task Model Router</span>
            <p className="text-[10px] text-blue-200 font-normal">Capability Classifier</p>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 hidden md:block" />

          <div className="p-3 bg-white border border-slate-200 rounded text-center min-w-[160px] shadow-sm">
            <span>Best Local Model</span>
            <p className="text-[10px] text-slate-400 font-normal">General / Code / Vision</p>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 hidden md:block" />

          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded text-center min-w-[140px] shadow-sm font-bold">
            <span>Local Inference</span>
            <p className="text-[10px] text-emerald-700 font-normal">0 External Calls</p>
          </div>
        </div>
      </div>
    </div>
  );
};
