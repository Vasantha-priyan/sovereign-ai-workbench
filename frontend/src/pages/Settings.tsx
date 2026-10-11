import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Settings as SettingsIcon, ShieldCheck, Cpu, Wrench, Users } from 'lucide-react';
import { ModelsView } from './Models';
import { ToolsView } from './Tools';
import { UsersView } from './Users';

export const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<any | null>(null);
  const [activeSubTab, setActiveSubTab] = useState('General');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      setSettings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const tabs = ['General', 'AI Infrastructure', 'Tools Registry', 'Administration & RBAC', 'Security Policy', 'Notifications'];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Settings & Technical Administration</h2>
          <p className="text-xs text-slate-500">Configure technical parameters, local AI models, tool permissions, and user roles.</p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 flex-wrap">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveSubTab(tab)}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
              activeSubTab === tab ? 'bg-blue-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* SUB TAB 1: GENERAL */}
      {activeSubTab === 'General' && settings && (
        <div className="p-5 bg-white border border-slate-200 rounded space-y-4 max-w-2xl shadow-sm">
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Platform Name</label>
              <input
                type="text"
                readOnly
                value={settings.project_name}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Local Ollama Base URL</label>
              <input
                type="text"
                readOnly
                value={settings.ollama_url}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Default General Model</label>
                <input
                  type="text"
                  readOnly
                  value={settings.default_general_model}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Default Coding Model</label>
                <input
                  type="text"
                  readOnly
                  value={settings.default_coding_model}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Deliverables Storage Directory</label>
              <input
                type="text"
                readOnly
                value={settings.deliverables_dir}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 font-mono text-[11px]"
              />
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 flex items-center justify-between font-semibold">
              <span>Private / On-Premise Environment Policy Enforced</span>
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 2: AI INFRASTRUCTURE (MODELS) */}
      {activeSubTab === 'AI Infrastructure' && (
        <ModelsView />
      )}

      {/* SUB TAB 3: TOOLS REGISTRY */}
      {activeSubTab === 'Tools Registry' && (
        <ToolsView />
      )}

      {/* SUB TAB 4: ADMINISTRATION & RBAC */}
      {activeSubTab === 'Administration & RBAC' && (
        <UsersView />
      )}

      {/* SUB TAB 5 & 6: SECURITY / NOTIFICATIONS */}
      {(activeSubTab === 'Security Policy' || activeSubTab === 'Notifications') && (
        <div className="p-5 bg-white border border-slate-200 rounded text-xs text-slate-700 space-y-2 max-w-xl">
          <p className="font-semibold text-slate-900">{activeSubTab} Configuration</p>
          <p className="text-slate-500">Settings and policy limits configured via environmental variables (`.env`).</p>
        </div>
      )}
    </div>
  );
};
