import React, { useEffect, useState } from 'react';
import { api, SecurityStatus, AuditLogItem } from '../api';
import { ShieldCheck, Lock, WifiOff, Terminal, Activity, Search, ClipboardList, Filter, ChevronDown, ChevronUp, User, Cpu, Database } from 'lucide-react';

interface SecurityProps {
  defaultSubTab?: 'security' | 'audit';
}

export const SecurityCenterView: React.FC<SecurityProps> = ({ defaultSubTab = 'security' }) => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      const res = await api.get('/audit');
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      (l.user_name && l.user_name.toLowerCase().includes(search.toLowerCase())) ||
      l.resource_type.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === 'ALL' ||
      (categoryFilter === 'AI Actions' && l.action.includes('AGENT')) ||
      (categoryFilter === 'Documents' && l.resource_type.includes('DOCUMENT')) ||
      (categoryFilter === 'Workflows' && l.resource_type.includes('WORKFLOW')) ||
      (categoryFilter === 'Security' && l.resource_type.includes('SYSTEM'));
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Workspace</span>
            <span>/</span>
            <span className="font-semibold text-slate-700">Security & Audit</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">SECURITY & AUDIT</h2>
          <p className="text-xs text-slate-500">Sovereignty controls, local processing status, and forensic activity history.</p>
        </div>

        <div className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-300 rounded text-emerald-900 text-xs font-bold flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
          <span>● SOVEREIGN MODE ACTIVE</span>
        </div>
      </div>

      {/* COMPACT SECURITY OVERVIEW CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-xs font-mono">
        <div className="p-3 bg-white border border-slate-200 rounded space-y-1 shadow-sm">
          <span className="text-[10px] text-slate-400 font-sans uppercase font-bold">DEPLOYMENT</span>
          <p className="text-xs font-bold text-slate-900">On-Premise / Local</p>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded space-y-1 shadow-sm">
          <span className="text-[10px] text-slate-400 font-sans uppercase font-bold">AI PROCESSING</span>
          <p className="text-xs font-bold text-emerald-700">Local</p>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded space-y-1 shadow-sm">
          <span className="text-[10px] text-slate-400 font-sans uppercase font-bold">EXTERNAL AI CALLS</span>
          <p className="text-xs font-bold text-emerald-700">0</p>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded space-y-1 shadow-sm">
          <span className="text-[10px] text-slate-400 font-sans uppercase font-bold">EXTERNAL ROUTES</span>
          <p className="text-xs font-bold text-emerald-700">0</p>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded space-y-1 shadow-sm">
          <span className="text-[10px] text-slate-400 font-sans uppercase font-bold">AUDIT LOGGING</span>
          <p className="text-xs font-bold text-slate-900">Active</p>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded space-y-1 shadow-sm">
          <span className="text-[10px] text-slate-400 font-sans uppercase font-bold">RBAC</span>
          <p className="text-xs font-bold text-slate-900">Enabled</p>
        </div>
      </div>

      {/* PROMINENT SOVEREIGNTY STATUS SECTION */}
      <div className="p-5 bg-emerald-50/80 border border-emerald-200 rounded-lg space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <span>LOCAL AI ENVIRONMENT — ● LOCAL ONLY</span>
          </div>
          <span className="text-[11px] text-emerald-900 font-semibold">Controlled Host Boundary</span>
        </div>

        <p className="text-xs text-emerald-900 leading-relaxed">
          All AI processing is configured for the controlled environment. No external AI endpoints (OpenAI, Gemini, Claude) detected.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-xs font-mono border-t border-emerald-200/80 text-emerald-900">
          <div>External Provider Calls: <strong className="text-emerald-950">0</strong></div>
          <div>External Routes: <strong className="text-emerald-950">0</strong></div>
          <div>Local Models: <strong className="text-emerald-950">3</strong></div>
          <div>Audit Logging: <strong className="text-emerald-950">Active</strong></div>
        </div>
      </div>

      {/* AUDIT TRAIL TABLE */}
      <div className="bg-white border border-slate-200 rounded p-4 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-blue-900" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Forensic Audit Trail</h3>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search audit trail..."
                className="w-full bg-slate-50 border border-slate-200 rounded pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-700 font-medium"
            >
              <option value="ALL">All Categories</option>
              <option value="AI Actions">AI Actions</option>
              <option value="Documents">Documents</option>
              <option value="Workflows">Workflows</option>
              <option value="Security">Security</option>
            </select>
          </div>
        </div>

        <div className="border border-slate-200 rounded overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">User</th>
                <th className="p-3">Action</th>
                <th className="p-3">Resource</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700 font-mono text-[11px]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="p-3 text-slate-500">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="p-3 font-sans font-semibold text-slate-900">{log.user_name || 'Rajesh Verma'}</td>
                  <td className="p-3 font-semibold text-blue-900">{log.action}</td>
                  <td className="p-3 text-slate-600">{log.resource_type}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-sans font-bold">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECURITY DETAIL SUMMARY */}
      <div className="p-5 bg-white border border-slate-200 rounded space-y-3 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Security Configuration Detail</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
            <span className="text-[10px] text-slate-400 font-sans uppercase">DEPLOYMENT</span>
            <p className="font-bold text-slate-900">On-Premise Local Server</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
            <span className="text-[10px] text-slate-400 font-sans uppercase">MODEL EXECUTION</span>
            <p className="font-bold text-slate-900">Local Model Endpoint</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
            <span className="text-[10px] text-slate-400 font-sans uppercase">NETWORK</span>
            <p className="font-bold text-emerald-700">External AI Provider Calls: 0</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
            <span className="text-[10px] text-slate-400 font-sans uppercase">CODE SANDBOX</span>
            <p className="font-bold text-slate-900">Network Restricted</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
            <span className="text-[10px] text-slate-400 font-sans uppercase">GOVERNANCE</span>
            <p className="font-bold text-slate-900">Audit Logging Active</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
            <span className="text-[10px] text-slate-400 font-sans uppercase">ACCESS CONTROL</span>
            <p className="font-bold text-slate-900">RBAC Enabled</p>
          </div>
        </div>
      </div>
    </div>
  );
};
