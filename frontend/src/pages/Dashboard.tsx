import React, { useEffect, useState } from 'react';
import { api, DashboardStats, AuditLogItem } from '../api';
import { MessageSquareText, FileText, Database, GitFork, FileCheck2, ShieldCheck, Clock, Plus, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface HomeProps {
  onNavigate?: (tab: string) => void;
}

export const DashboardView: React.FC<HomeProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const statsRes = await api.get('/dashboard/stats');
      setStats(statsRes.data);
      const logsRes = await api.get('/dashboard/recent-activity');
      setRecentLogs(logsRes.data);
    } catch (err) {
      console.error('Failed to load dashboard statistics', err);
    } finally {
      setLoading(false);
    }
  };

  const recentSessions = [
    { title: 'Pump P-102A Inspection Review', date: 'Today, 09:42', meta: '3 documents · Vision model · Completed', icon: FileText },
    { title: 'Equipment Metrics CSV Analytics', date: 'Yesterday', meta: 'CSV dataset · Python Tool · Completed', icon: GitFork },
    { title: 'Refinery Safety SOP Compliance Review', date: '2 days ago', meta: 'Knowledge Base RAG · Completed', icon: Database },
  ];

  if (loading) {
    return <div className="p-6 text-slate-500 text-xs">Loading private workspace...</div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900">Good morning, Rajesh</h2>
        <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
          Private AI workspace for confidential industrial operations. Analyze documents, query organizational knowledge, run local agents and generate enterprise deliverables without sending data outside your environment.
        </p>
      </div>

      {/* QUICK ACTIONS BAR */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Actions</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <button
            onClick={() => onNavigate && onNavigate('workbench')}
            className="p-3.5 bg-blue-900 hover:bg-blue-800 text-white rounded text-left space-y-2 transition-colors shadow-sm"
          >
            <MessageSquareText className="w-5 h-5" />
            <div>
              <p className="text-xs font-bold">New AI Session</p>
              <p className="text-[10px] text-blue-200">Start private chat</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate && onNavigate('documents')}
            className="p-3.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-900 rounded text-left space-y-2 transition-colors shadow-sm"
          >
            <FileText className="w-5 h-5 text-blue-900" />
            <div>
              <p className="text-xs font-bold">Analyze Document</p>
              <p className="text-[10px] text-slate-500">Upload PDF / OCR</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate && onNavigate('knowledge')}
            className="p-3.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-900 rounded text-left space-y-2 transition-colors shadow-sm"
          >
            <Database className="w-5 h-5 text-blue-900" />
            <div>
              <p className="text-xs font-bold">Search Knowledge</p>
              <p className="text-[10px] text-slate-500">Query RAG index</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate && onNavigate('workflows')}
            className="p-3.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-900 rounded text-left space-y-2 transition-colors shadow-sm"
          >
            <GitFork className="w-5 h-5 text-blue-900" />
            <div>
              <p className="text-xs font-bold">Run Workflow</p>
              <p className="text-[10px] text-slate-500">Agent pipeline</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate && onNavigate('deliverables')}
            className="p-3.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-900 rounded text-left space-y-2 transition-colors shadow-sm"
          >
            <FileCheck2 className="w-5 h-5 text-blue-900" />
            <div>
              <p className="text-xs font-bold">Create Deliverable</p>
              <p className="text-[10px] text-slate-500">DOCX / XLSX</p>
            </div>
          </button>
        </div>
      </div>

      {/* SIGNATURE LOCAL AI ENVIRONMENT ACTIVE BANNER */}
      <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
            <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">LOCAL AI ENVIRONMENT ACTIVE</h3>
          </div>
          <p className="text-xs text-emerald-900">
            Your confidential enterprise data remains inside your controlled environment. No external AI endpoints configured.
          </p>
        </div>

        <div className="flex items-center gap-6 text-xs font-mono text-emerald-900 border-t md:border-t-0 md:border-l border-emerald-200 pt-2 md:pt-0 md:pl-6">
          <div>
            <div>AI Processing: <strong className="text-emerald-950 font-bold">Local</strong></div>
            <div>External AI Calls: <strong className="text-emerald-950 font-bold">0</strong></div>
          </div>
          <div>
            <div>External Routes: <strong className="text-emerald-950 font-bold">0</strong></div>
            <div>Local Models: <strong className="text-emerald-950 font-bold">3 Online</strong></div>
          </div>
        </div>
      </div>

      {/* WORKSPACE STATUS METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-3 bg-white border border-slate-200 rounded text-slate-800 space-y-0.5 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Local Models</span>
          <p className="text-lg font-bold text-slate-900">{stats?.active_models ?? 3} Online</p>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded text-slate-800 space-y-0.5 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Knowledge Sources</span>
          <p className="text-lg font-bold text-slate-900">{stats?.kb_documents ?? 2} Active</p>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded text-slate-800 space-y-0.5 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Documents</span>
          <p className="text-lg font-bold text-slate-900">{stats?.documents_processed ?? 3} Processed</p>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded text-slate-800 space-y-0.5 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Workflows</span>
          <p className="text-lg font-bold text-slate-900">{stats?.agent_executions ?? 5}</p>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded text-slate-800 space-y-0.5 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Reviews</span>
          <p className="text-lg font-bold text-amber-700">1 Review</p>
        </div>
      </div>

      {/* RECENT AI SESSIONS & ACTIVITY TIMELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sessions */}
        <div className="bg-white border border-slate-200 rounded p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Recent AI Work Sessions</h3>
            <button onClick={() => onNavigate && onNavigate('workbench')} className="text-xs font-medium text-blue-900 hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {recentSessions.map((session, idx) => {
              const Icon = session.icon;
              return (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded flex items-center justify-between transition-colors cursor-pointer"
                  onClick={() => onNavigate && onNavigate('workbench')}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white border border-slate-200 rounded text-blue-900">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{session.title}</p>
                      <p className="text-[11px] text-slate-500">{session.meta}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400">{session.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-white border border-slate-200 rounded p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Recent Activity Timeline</h3>
            <button onClick={() => onNavigate && onNavigate('security')} className="text-xs font-medium text-blue-900 hover:underline">
              Audit Stream
            </button>
          </div>

          <div className="space-y-2.5">
            {recentLogs.slice(0, 4).map((log) => (
              <div key={log.id} className="flex items-start gap-2.5 text-xs">
                <span className="w-2 h-2 rounded-full bg-blue-900 mt-1.5 shrink-0"></span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{log.action}</p>
                  <p className="text-[11px] text-slate-500">{log.user_name || 'System Admin'} • {log.resource_type}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{new Date(log.created_at).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
