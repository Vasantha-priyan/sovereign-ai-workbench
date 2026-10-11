import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './pages/Dashboard';
import { ChatView } from './pages/Chat';
import { DocumentsView } from './pages/Documents';
import { KnowledgeBaseView } from './pages/KnowledgeBase';
import { AgentsView } from './pages/Agents';
import { WorkflowsView } from './pages/Workflows';
import { ModelsView } from './pages/Models';
import { ToolsView } from './pages/Tools';
import { DeliverablesView } from './pages/Deliverables';
import { SecurityCenterView } from './pages/SecurityCenter';
import { AuditLogsView } from './pages/AuditLogs';
import { UsersView } from './pages/Users';
import { SettingsView } from './pages/Settings';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [collapsed, setCollapsed] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState("Pump P-102A Inspection Review Workspace");

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <DashboardView onNavigate={(tab) => setActiveTab(tab)} />;
      case 'workbench':
      case 'sessions':
        return <ChatView />;
      case 'documents':
      case 'sources':
        return <DocumentsView onNavigate={(tab) => setActiveTab(tab)} />;
      case 'knowledge':
        return <KnowledgeBaseView />;
      case 'agents':
        return <AgentsView onNavigate={(tab) => setActiveTab(tab)} />;
      case 'workflows':
        return <WorkflowsView />;
      case 'deliverables':
        return <DeliverablesView />;
      case 'security':
        return <SecurityCenterView defaultSubTab="security" />;
      case 'audit':
        return <SecurityCenterView defaultSubTab="audit" />;
      case 'models':
      case 'router':
        return <ModelsView />;
      case 'tools':
        return <ToolsView />;
      case 'administration':
        return <UsersView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  const getBreadcrumbTitle = () => {
    switch (activeTab) {
      case 'home':
        return 'Home';
      case 'workbench':
        return 'AI Workbench';
      case 'sessions':
        return 'Sessions';
      case 'documents':
        return 'Documents';
      case 'knowledge':
        return 'Knowledge Base';
      case 'workflows':
      case 'agents':
        return 'Agents & Workflows';
      case 'deliverables':
        return 'Deliverables';
      case 'security':
      case 'audit':
        return 'Security & Audit';
      case 'models':
        return 'Models';
      case 'tools':
        return 'Tools';
      case 'administration':
        return 'Administration';
      case 'settings':
        return 'Settings';
      default:
        return 'Home';
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-800">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={getBreadcrumbTitle()}
          activeWorkspace={activeWorkspace}
          onWorkspaceSelect={(ws) => setActiveWorkspace(ws)}
        />
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
