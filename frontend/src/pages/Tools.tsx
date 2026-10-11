import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Wrench, Play, Shield, Terminal, FileText, Database, Code2 } from 'lucide-react';

export const ToolsView: React.FC = () => {
  const [tools, setTools] = useState<any[]>([]);
  const [testOutput, setTestOutput] = useState<any | null>(null);

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      const res = await api.get('/tools');
      setTools(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTest = async (toolName: string) => {
    try {
      const res = await api.post('/tools/execute-test', { script: 'print("Sandbox execution verified.")' }, { params: { tool_name: toolName } });
      setTestOutput(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Tools</h2>
          <p className="text-xs text-slate-500">Local tools available for agentic workflow execution and sandboxed calculations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map((tool) => (
          <div key={tool.id} className="p-4 bg-white border border-slate-200 rounded space-y-3 shadow-sm flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-blue-900" />
                  <h3 className="text-xs font-bold text-slate-900">{tool.name}</h3>
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] rounded font-bold">
                  LOCAL TOOL
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{tool.description}</p>

              <div className="p-2 bg-slate-50 border border-slate-200 rounded font-mono text-[10px] text-slate-700 space-y-0.5">
                <div>Permission Level: <strong className="text-slate-900">{tool.permission_level}</strong></div>
                <div>Execution Environment: <strong className="text-slate-900">Zero-Network Subprocess / Container</strong></div>
              </div>
            </div>

            <button
              onClick={() => handleTest(tool.name)}
              className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded flex items-center justify-center gap-1.5 transition-colors mt-2"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Verify Tool Execution</span>
            </button>
          </div>
        ))}
      </div>

      {testOutput && (
        <div className="p-4 bg-white border border-slate-200 rounded space-y-2 font-mono text-xs shadow-sm">
          <h3 className="text-slate-900 font-bold">Tool Verification Telemetry:</h3>
          <pre className="text-slate-800 bg-slate-50 p-3 rounded border border-slate-200 overflow-x-auto">{JSON.stringify(testOutput, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};
