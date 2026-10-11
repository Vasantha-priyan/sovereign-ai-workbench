import React, { useEffect, useState } from 'react';
import { api, KnowledgeBaseItem } from '../api';
import { Database, Search, BookOpen, Layers, CheckCircle2, ShieldCheck, FileText, Plus, X, ArrowRight, Sparkles } from 'lucide-react';

interface KnowledgeProps {
  onNavigate?: (tab: string) => void;
}

export const KnowledgeBaseView: React.FC<KnowledgeProps> = ({ onNavigate }) => {
  const [kbs, setKbs] = useState<KnowledgeBaseItem[]>([]);
  const [query, setQuery] = useState('');
  const [queryResult, setQueryResult] = useState<any | null>(null);
  const [searching, setSearching] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedKb, setSelectedKb] = useState<KnowledgeBaseItem | null>(null);

  // Form State
  const [newKbName, setNewKbName] = useState('');
  const [newKbDesc, setNewKbDesc] = useState('');

  useEffect(() => {
    fetchKBs();
  }, []);

  const fetchKBs = async () => {
    try {
      const res = await api.get('/knowledge-base');
      setKbs(res.data);
      if (res.data.length > 0 && !selectedKb) {
        setSelectedKb(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    try {
      const res = await api.post('/knowledge-base/query', {
        kb_id: kbs.length > 0 ? kbs[0].id : 'kb-1',
        query: query
      });
      setQueryResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleCreateKb = (e: React.FormEvent) => {
    e.preventDefault();
    setShowCreateModal(false);
    const newKb: KnowledgeBaseItem = {
      id: `kb-${Date.now()}`,
      name: newKbName || 'New Knowledge Collection',
      description: newKbDesc || 'Custom operational knowledge collection',
      created_at: new Date().toISOString(),
      doc_count: 2,
      chunk_count: 18
    };
    setKbs([newKb, ...kbs]);
    setSelectedKb(newKb);
    setNewKbName('');
    setNewKbDesc('');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Workspace</span>
            <span>/</span>
            <span className="font-semibold text-slate-700">Knowledge Base</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">KNOWLEDGE BASE</h2>
          <p className="text-xs text-slate-500">Organizational knowledge used to ground private AI responses.</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs rounded flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Knowledge Collection</span>
        </button>
      </div>

      {/* Collections Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Knowledge Collections</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {kbs.map((kb) => (
            <div
              key={kb.id}
              onClick={() => setSelectedKb(kb)}
              className={`p-4 bg-white border rounded space-y-3 shadow-sm cursor-pointer transition-colors ${
                selectedKb?.id === kb.id ? 'border-blue-900 bg-blue-50/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-50 border border-blue-200 rounded text-blue-900">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{kb.name}</h4>
                    <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> ● ACTIVE
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{kb.description}</p>

              <div className="p-2 bg-slate-50 border border-slate-200 rounded text-[11px] font-mono text-slate-700 flex justify-between">
                <span>Sources: <strong>{kb.doc_count || 2} Docs</strong></span>
                <span>Chunks: <strong className="text-blue-900">{kb.chunk_count || 18}</strong></span>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-xs">
                <button className="flex-1 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded text-[11px]">
                  Open Collection
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setQuery("What conditions require immediate pump shutdown?");
                  }}
                  className="px-2.5 py-1 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded text-[11px]"
                >
                  Search
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RAG Knowledge Search Console */}
      <div className="p-5 bg-white border border-slate-200 rounded space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-900" />
            Search Organizational Knowledge Base
          </h3>
          <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Grounding Verified
          </span>
        </div>

        <form onSubmit={handleQuery} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search organizational knowledge... (e.g. 'What conditions require immediate pump shutdown?')"
            className="flex-1 bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-900"
          />
          <button
            type="submit"
            disabled={searching}
            className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs rounded flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
        </form>

        {queryResult ? (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">RESULT CONTENT</span>
              <p className="text-xs text-slate-900 whitespace-pre-wrap leading-relaxed font-medium">{queryResult.answer}</p>
            </div>

            {/* Evidence Cards */}
            <div className="space-y-2 pt-3 border-t border-slate-200">
              <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" /> Compact Evidence Cards
              </span>

              <div className="p-3 bg-white rounded border border-slate-200 text-xs space-y-2 shadow-sm">
                <div className="flex items-center justify-between font-bold text-blue-900">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Safety_SOP_Refinery_2026.pdf — Section 4.2
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-mono">
                    RELEVANCE 94%
                  </span>
                </div>
                <p className="text-slate-700 text-[11px]">
                  "Pressure exceedance conditions above 45.0 BAR require immediate engineering review and load transfer to backup pump."
                </p>
                <div className="pt-1 flex items-center justify-end">
                  <button
                    onClick={() => onNavigate && onNavigate('workbench')}
                    className="px-3 py-1 bg-blue-900 hover:bg-blue-800 text-white text-[11px] font-semibold rounded flex items-center gap-1 transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Use in AI Workbench</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded text-xs text-slate-500 italic">
            Enter a query above to retrieve grounded evidence cards from your knowledge collections.
          </div>
        )}
      </div>

      {/* COLLECTION DETAIL DRAWER */}
      {selectedKb && (
        <div className="p-5 bg-white border border-slate-200 rounded space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-900" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{selectedKb.name}</h3>
            </div>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] rounded font-bold">
              ● Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Source Documents */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SOURCE DOCUMENTS</span>
              <div className="space-y-1">
                <div className="p-2 bg-slate-50 border border-slate-200 rounded flex items-center gap-2 text-slate-800 font-medium">
                  <FileText className="w-3.5 h-3.5 text-blue-900" />
                  <span>Safety_SOP_Refinery_2026.pdf</span>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded flex items-center gap-2 text-slate-800 font-medium">
                  <FileText className="w-3.5 h-3.5 text-blue-900" />
                  <span>Equipment_Inspection_Report.pdf</span>
                </div>
              </div>
            </div>

            {/* Index Status */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">INDEX STATUS</span>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded font-mono text-[11px] space-y-1 text-slate-700">
                <div>Documents: <strong className="text-slate-900">2 Documents</strong></div>
                <div>Indexed Chunks: <strong className="text-blue-900">18 Chunks</strong></div>
                <div>Last Indexed: <span className="text-slate-600">27 Aug 2026</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE KNOWLEDGE COLLECTION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-sm text-slate-900">CREATE KNOWLEDGE COLLECTION</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateKb} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Collection Name</label>
                <input
                  type="text"
                  required
                  value={newKbName}
                  onChange={(e) => setNewKbName(e.target.value)}
                  placeholder="e.g. Unit 4B Operational Knowledge"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newKbDesc}
                  onChange={(e) => setNewKbDesc(e.target.value)}
                  placeholder="Describe the scope of this knowledge collection..."
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Source Documents</label>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded space-y-1 text-[11px] text-slate-700">
                  <div>✓ Safety_SOP_Refinery_2026.pdf</div>
                  <div>✓ Equipment_Inspection_Report.pdf</div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded shadow-sm"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
