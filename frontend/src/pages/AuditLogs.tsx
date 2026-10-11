import React, { useEffect, useState } from 'react';
import { api, AuditLogItem } from '../api';
import { Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/audit');
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      (l.user_name && l.user_name.toLowerCase().includes(search.toLowerCase())) ||
      l.resource_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Audit Trail</h2>
          <p className="text-xs text-slate-500">Trace every AI interaction, document access, model route and workflow execution.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded p-4 space-y-4 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by user, action, or resource..."
              className="w-full bg-slate-50 border border-slate-200 rounded pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400"
            />
          </div>
          <span className="text-xs font-mono text-slate-500">{filteredLogs.length} Forensic Events</span>
        </div>

        <div className="border border-slate-200 rounded overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Time</th>
                <th className="p-3">User</th>
                <th className="p-3">Action</th>
                <th className="p-3">Resource Type</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700 font-mono text-[11px]">
              {filteredLogs.map((log) => (
                <React.Fragment key={log.id}>
                  <tr
                    onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                    className="hover:bg-slate-50 cursor-pointer"
                  >
                    <td className="p-3 text-slate-500">{new Date(log.created_at).toLocaleTimeString()}</td>
                    <td className="p-3 font-sans font-semibold text-slate-900">{log.user_name || 'System Admin'}</td>
                    <td className="p-3 font-semibold text-blue-900">{log.action}</td>
                    <td className="p-3 text-slate-600">{log.resource_type}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-sans font-semibold">
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {expandedId === log.id ? <ChevronUp className="w-3.5 h-3.5 ml-auto text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 ml-auto text-slate-400" />}
                    </td>
                  </tr>
                  {expandedId === log.id && (
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <td colSpan={6} className="p-3 font-mono text-[11px] text-slate-800 space-y-1">
                        <div>Event Details JSON:</div>
                        <pre className="p-2 bg-white border border-slate-200 rounded overflow-x-auto">{log.details_json || '{}'}</pre>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
