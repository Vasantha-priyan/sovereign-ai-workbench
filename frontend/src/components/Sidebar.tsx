import React, { useState } from 'react';
import {
  Home,
  MessageSquareText,
  FileText,
  Database,
  GitFork,
  FileCheck2,
  ShieldCheck,
  Settings,
  Building2,
  ChevronLeft,
  ChevronRight,
  Lock,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
}) => {
  const [showStatusPopover, setShowStatusPopover] = useState(false);

  const groups = [
    {
      title: 'WORKSPACE',
      items: [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'workbench', label: 'AI Workbench', icon: MessageSquareText },
      ],
    },
    {
      title: 'KNOWLEDGE',
      items: [
        { id: 'documents', label: 'Documents', icon: FileText },
        { id: 'knowledge', label: 'Knowledge Base', icon: Database },
      ],
    },
    {
      title: 'AUTOMATION',
      items: [
        { id: 'workflows', label: 'Agents & Workflows', icon: GitFork },
      ],
    },
    {
      title: 'OUTPUT',
      items: [
        { id: 'deliverables', label: 'Deliverables', icon: FileCheck2 },
      ],
    },
    {
      title: 'GOVERNANCE',
      items: [
        { id: 'security', label: 'Security & Audit', icon: ShieldCheck },
      ],
    },
  ];

  return (
    <aside
      className={`bg-white border-r border-slate-200 flex flex-col h-screen shrink-0 select-none transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Top Brand Header */}
      <div className="h-14 border-b border-slate-200 px-3.5 flex items-center justify-between">
        {!collapsed ? (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded bg-blue-900 text-white flex items-center justify-center font-bold shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-xs text-slate-900 truncate leading-tight">Sovereign AI</h1>
              <p className="text-[10px] text-slate-500 font-mono tracking-wider">WORKBENCH</p>
            </div>
          </div>
        ) : (
          <div className="w-7 h-7 rounded bg-blue-900 text-white flex items-center justify-center font-bold mx-auto">
            <Building2 className="w-4 h-4" />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Private Environment Status Indicator */}
      <div className="px-3 pt-3 relative">
        <button
          onClick={() => setShowStatusPopover(!showStatusPopover)}
          className={`w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded flex items-center justify-between text-xs text-slate-700 font-medium hover:bg-slate-100 transition-colors ${
            collapsed ? 'justify-center px-0' : ''
          }`}
          title={collapsed ? '🟢 Local / Private Status' : undefined}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse shrink-0"></span>
            {!collapsed && <span className="text-[11px] font-semibold text-slate-800">🟢 Local / Private</span>}
          </div>
          {!collapsed && <Lock className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {/* Hover / Click Sovereignty Popover Modal */}
        {showStatusPopover && (
          <div className="absolute left-full top-0 ml-2 w-72 bg-white border border-slate-200 rounded shadow-xl p-4 text-xs space-y-3 z-50">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">SOVEREIGNTY STATUS</h4>
              <button onClick={() => setShowStatusPopover(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-1.5 text-[11px] text-slate-700 font-mono">
              <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                <span>Local inference: Active</span>
              </div>
              <div>• External AI calls: <strong className="text-slate-900 font-bold">0</strong></div>
              <div>• External routes: <strong className="text-slate-900 font-bold">0</strong></div>
              <div>• Local models: <strong className="text-slate-900 font-bold">3 Online</strong></div>
              <div>• Audit logging: <strong className="text-slate-900 font-bold">Active</strong></div>
            </div>
            <p className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-100">
              Confidential enterprise data remains entirely within host boundary.
            </p>
          </div>
        )}
      </div>

      {/* Streamlined Navigation Groups */}
      <nav className="flex-1 px-2.5 py-4 space-y-4 overflow-y-auto">
        {groups.map((group, idx) => (
          <div key={idx} className="space-y-0.5">
            {!collapsed && (
              <p className="px-2 mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {group.title}
              </p>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-900 text-white font-semibold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  } ${collapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom Profile & Settings Bar */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
        {!collapsed ? (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded bg-blue-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
              RV
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">Rajesh Verma</p>
              <p className="text-[10px] text-slate-500 truncate">Administrator</p>
            </div>
          </div>
        ) : (
          <div className="w-7 h-7 rounded bg-blue-900 text-white flex items-center justify-center font-bold text-xs mx-auto">
            RV
          </div>
        )}

        {!collapsed && (
          <button
            onClick={() => setActiveTab('settings')}
            className={`p-1.5 rounded transition-colors ${
              activeTab === 'settings' ? 'text-blue-900 bg-slate-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'
            }`}
            title="Settings & Technical Administration"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
