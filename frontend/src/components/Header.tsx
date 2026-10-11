import React, { useState } from 'react';
import { ShieldCheck, Cpu, Bell, HelpCircle, User, ChevronDown, CheckCircle2, Lock } from 'lucide-react';

interface HeaderProps {
  title: string;
  activeWorkspace?: string;
  onWorkspaceSelect?: (ws: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  activeWorkspace = "Pump P-102A Inspection Review Workspace",
  onWorkspaceSelect
}) => {
  const [showSovereigntyPopover, setShowSovereigntyPopover] = useState(false);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);

  const workspaces = [
    "Pump P-102A Inspection Review Workspace",
    "Unit 4B Refinery Safety Workspace",
    "Equipment Metrics CSV Workspace"
  ];

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 select-none relative z-30">
      {/* Left: Breadcrumb */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-400">Workspace</span>
        <span className="text-slate-300">/</span>
        <h2 className="font-bold uppercase tracking-wider text-slate-800">{title}</h2>
      </div>

      {/* Center: Workspace Selector */}
      <div className="relative">
        <button
          onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-semibold text-slate-800 flex items-center gap-2 hover:bg-slate-100 transition-colors"
        >
          <span className="w-2 h-2 rounded-full bg-blue-900"></span>
          <span>{activeWorkspace}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
        </button>

        {showWorkspaceMenu && (
          <div className="absolute left-0 mt-1 w-72 bg-white border border-slate-200 rounded shadow-lg p-1.5 space-y-1 z-40 text-xs">
            <p className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Switch Workspace</p>
            {workspaces.map((ws, i) => (
              <button
                key={i}
                onClick={() => {
                  if (onWorkspaceSelect) onWorkspaceSelect(ws);
                  setShowWorkspaceMenu(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded transition-colors ${
                  activeWorkspace === ws ? 'bg-blue-50 font-semibold text-blue-900' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {ws}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Sovereignty Badge, Model, Notifications, User */}
      <div className="flex items-center gap-3 text-xs">
        {/* Sovereignty Badge with Popover */}
        <div className="relative">
          <button
            onClick={() => setShowSovereigntyPopover(!showSovereigntyPopover)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold rounded text-[11px] hover:bg-emerald-100 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>● LOCAL ONLY</span>
          </button>

          {showSovereigntyPopover && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded shadow-xl p-4 text-xs space-y-3 z-50">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-slate-900">SOVEREIGN ENVIRONMENT</h4>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                AI inference is executing strictly on your local environment. No external AI provider calls (OpenAI, Gemini, Claude) detected.
              </p>
              <div className="p-2 bg-slate-50 border border-slate-200 rounded text-[11px] space-y-1 font-mono text-slate-700">
                <div>• Outbound AI Provider Calls: <strong className="text-emerald-700">0</strong></div>
                <div>• External Inference Routes: <strong className="text-emerald-700">0</strong></div>
                <div>• Local Provider: <strong className="text-slate-900">Ollama Local API</strong></div>
              </div>
              <button
                onClick={() => setShowSovereigntyPopover(false)}
                className="w-full py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 border-t border-slate-100 pt-2 text-center"
              >
                Close Telemetry Overview
              </button>
            </div>
          )}
        </div>

        {/* Model Indicator */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-mono px-2 py-1 bg-slate-50 border border-slate-200 rounded">
          <Cpu className="w-3.5 h-3.5 text-blue-900" />
          <span>qwen2.5:7b-instruct</span>
        </div>

        {/* Icons */}
        <button className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors" title="Notifications">
          <Bell className="w-4 h-4" />
        </button>
        <button className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors" title="Help Documentation">
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Avatar */}
        <div className="w-7 h-7 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-xs">
          RV
        </div>
      </div>
    </header>
  );
};
