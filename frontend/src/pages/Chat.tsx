import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { Send, Bot, User, Cpu, BookOpen, Plus, Search, Paperclip, FileText, Wrench, ShieldCheck, AlertCircle, Database } from 'lucide-react';

interface CitationItem {
  document_name: string;
  page_number: number;
  relevance_score?: string;
  excerpt: string;
}

interface ChatMessage {
  id: string;
  role: string;
  content: string;
  model_used?: string;
  citations?: CitationItem[];
}

export const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<Array<{ id: string; title: string }>>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [sessionSearch, setSessionSearch] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/chat/conversations');
      setConversations(res.data);
      if (res.data.length > 0 && !activeConvId) {
        setActiveConvId(res.data[0].id);
        fetchMessages(res.data[0].id);
      }
    } catch (err) {
      console.error('Error fetching conversations', err);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const res = await api.get(`/chat/conversations/${convId}/messages`);
      setMessages(res.data);
    } catch (err) {
      console.error('Error fetching messages', err);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    const userText = prompt;
    setPrompt('');

    const tempUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userText
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const targetConvId = activeConvId || 'conv-1';
      const res = await api.post('/chat/message', {
        conversation_id: targetConvId,
        prompt: userText
      });

      const aiMsg: ChatMessage = {
        id: res.data.id || (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.data.content || res.data.answer || "Grounding analysis completed.",
        model_used: res.data.model_used || "qwen2.5:7b-instruct",
        citations: res.data.citations || []
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Chat error', err);
      const fallbackMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Error communicating with AI service. Please verify backend server on port 8000 is active.",
        model_used: "qwen2.5:7b-instruct"
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const handleNewChat = async () => {
    try {
      const res = await api.post('/chat/conversations', null, { params: { title: 'Pump P-102A Inspection Review' } });
      setConversations([res.data, ...conversations]);
      setActiveConvId(res.data.id);
      setMessages([]);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredSessions = conversations.filter(c => c.title.toLowerCase().includes(sessionSearch.toLowerCase()));

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-slate-50 overflow-hidden">
      {/* 1. LEFT PANEL: Sessions List */}
      <div className="w-64 border-r border-slate-200 bg-white p-3 flex flex-col shrink-0 select-none">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-blue-900 hover:bg-blue-800 rounded text-xs font-semibold text-white transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ New AI Session</span>
        </button>

        <div className="mt-3 relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
          <input
            type="text"
            value={sessionSearch}
            onChange={(e) => setSessionSearch(e.target.value)}
            placeholder="Search sessions..."
            className="w-full bg-slate-50 border border-slate-200 rounded pl-8 pr-2.5 py-1 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-900"
          />
        </div>

        <div className="mt-4 flex-1 overflow-y-auto space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-1.5">Recent Work Sessions</p>
          {filteredSessions.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setActiveConvId(c.id);
                fetchMessages(c.id);
              }}
              className={`w-full text-left p-2.5 rounded transition-colors border ${
                activeConvId === c.id
                  ? 'bg-blue-50 border-blue-200 text-blue-900 font-semibold'
                  : 'bg-white border-transparent text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs truncate">{c.title}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">qwen2.5:7b-instruct</p>
            </button>
          ))}
        </div>
      </div>

      {/* 2. CENTER WORKSPACE: Conversation Stream */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        <div className="px-6 py-3 bg-white border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900">
              {conversations.find(c => c.id === activeConvId)?.title || "Pump P-102A Inspection Review"}
            </h3>
            <p className="text-[11px] text-slate-500 font-mono">Local Router: Dynamic · Processing: 100% LOCAL</p>
          </div>
          <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-semibold">
            ● Grounded & Private
          </span>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-2 text-slate-500">
              <Bot className="w-8 h-8 text-blue-900 opacity-60" />
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">AI WORKBENCH ACTIVE</h4>
              <p className="text-xs max-w-md text-slate-600">
                Ask questions about uploaded inspection PDFs, query Safety SOP limits, or execute quantitative calculations locally.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-7 h-7 rounded flex items-center justify-center shrink-0 text-xs font-bold ${
                    msg.role === 'user' ? 'bg-blue-900 text-white' : 'bg-slate-200 text-slate-800'
                  }`}
                >
                  {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                <div className="space-y-2 max-w-2xl">
                  {msg.role === 'user' ? (
                    <div className="p-3 bg-blue-900 text-white rounded text-xs leading-relaxed shadow-sm">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="p-4 bg-white border border-slate-200 rounded text-xs leading-relaxed text-slate-800 space-y-3 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2 text-[10px] text-slate-500 font-mono">
                        <span className="font-bold text-blue-900 font-sans uppercase tracking-wider">AI ANALYSIS RESULT</span>
                        <span>Model: {msg.model_used || 'qwen2.5:7b-instruct'} · Processing: LOCAL</span>
                      </div>

                      <div className="space-y-1">
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      </div>

                      {msg.citations && msg.citations.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 space-y-1.5">
                          <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5" /> Grounded Evidence & Citations
                          </span>
                          <div className="space-y-1">
                            {msg.citations.map((c, i) => (
                              <div key={i} className="p-2 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-700">
                                <strong className="text-blue-900">{c.document_name} — Page {c.page_number}</strong>: "{c.excerpt.substring(0, 180)}..."
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <span className="w-2 h-2 rounded-full bg-blue-900 animate-pulse"></span>
              <span>Local model executing grounded reasoning...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* 4. PROMPT COMPOSER */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-200 bg-white space-y-2">
          <div className="bg-slate-50 border border-slate-200 rounded p-2 focus-within:border-blue-900 focus-within:bg-white transition-all space-y-2">
            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask about your documents, safety SOPs, or pressure readings..."
              className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none resize-none"
            />
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <span>Model: <strong>qwen2.5:7b-instruct</strong></span>
              </div>

              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="px-4 py-1.5 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white font-medium text-xs rounded flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Execute</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono px-1">
            <span>Local model · Air-gapped environment</span>
            <span>0 outbound API calls</span>
          </div>
        </form>
      </div>
    </div>
  );
};
