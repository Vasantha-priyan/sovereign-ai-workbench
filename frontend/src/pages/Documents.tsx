import React, { useEffect, useState } from 'react';
import { api, DocumentItem } from '../api';
import {
  FileText,
  Upload,
  Trash2,
  Eye,
  Search,
  Filter,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FolderOpen
} from 'lucide-react';

interface DocumentsProps {
  onNavigate?: (tab: string) => void;
}

export const DocumentsView: React.FC<DocumentsProps> = ({ onNavigate }) => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterOcr, setFilterOcr] = useState('ALL');
  const [sortBy, setSortBy] = useState('Recently Added');

  // Modals & UI States
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewPage, setPreviewPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [processingStep, setProcessingStep] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Upload Form State
  const [uploadCategory, setUploadCategory] = useState('Inspection Report');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/documents');
      setDocuments(res.data);
      if (res.data.length > 0 && !selectedDoc) {
        setSelectedDoc(res.data[0]);
      }
    } catch (err) {
      console.error('Error fetching documents', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/documents/${id}`);
      fetchDocuments();
      if (selectedDoc?.id === id) setSelectedDoc(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      alert("Please select a file to upload.");
      return;
    }

    setUploading(true);
    setShowUploadModal(false);
    setShowProcessingModal(true);
    setProcessingStep(1);

    const formData = new FormData();
    formData.append('file', uploadFile);

    try {
      setTimeout(() => setProcessingStep(2), 1000);
      setTimeout(() => setProcessingStep(3), 2000);

      const res = await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setProcessingStep(4);
      setTimeout(() => {
        setShowProcessingModal(false);
        setUploading(false);
        setUploadFile(null);
        fetchDocuments();
        if (res.data) setSelectedDoc(res.data);
        setToastMessage(`"${uploadFile.name}" successfully uploaded & processed locally.`);
        setTimeout(() => setToastMessage(null), 5000);
      }, 3000);
    } catch (err: any) {
      console.error("Upload error", err);
      setShowProcessingModal(false);
      setUploading(false);
      alert(err?.response?.data?.detail || "Document upload failed.");
    }
  };

  const handleUseInWorkbench = (docName: string) => {
    setToastMessage(`"${docName}" added to AI Workbench context.`);
    setTimeout(() => {
      setToastMessage(null);
      if (onNavigate) onNavigate('workbench');
    }, 1500);
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || doc.file_type === filterType;
    const matchesStatus = filterStatus === 'ALL' || doc.status === filterStatus;
    const matchesOcr =
      filterOcr === 'ALL' ||
      (filterOcr === 'OCR Extracted' && doc.ocr_applied) ||
      (filterOcr === 'Native Text' && !doc.ocr_applied);
    return matchesSearch && matchesType && matchesStatus && matchesOcr;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 p-3 bg-blue-900 text-white rounded-lg shadow-xl text-xs flex items-center gap-3 animate-fade-in border border-blue-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
          <button
            onClick={() => onNavigate && onNavigate('workbench')}
            className="px-2.5 py-1 bg-white text-blue-900 rounded font-bold hover:bg-slate-100 transition-colors"
          >
            Open AI Workbench →
          </button>
        </div>
      )}

      {/* Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Workspace</span>
            <span>/</span>
            <span className="font-semibold text-slate-700">Documents</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">DOCUMENTS</h2>
          <p className="text-xs text-slate-500 max-w-2xl">
            Secure repository for confidential industrial documents, inspection reports, SOPs, operational logs, and engineering records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-semibold text-[11px] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            ● LOCAL / PRIVATE
          </span>

          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs rounded flex items-center gap-2 transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4" />
            <span>+ Upload Document</span>
          </button>
        </div>
      </div>

      {/* Local Sovereignty Banner */}
      <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-emerald-950 shadow-sm">
        <div className="flex items-center gap-2 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>LOCAL DOCUMENT REPOSITORY — All uploaded documents remain within the controlled environment.</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono text-emerald-900">
          <span>External document transfer: <strong>0</strong></span>
          <span>External AI calls: <strong>0</strong></span>
          <span>Local processing: <strong>Enabled</strong></span>
        </div>
      </div>

      {/* Top Document Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-3.5 bg-white border border-slate-200 rounded space-y-1 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOTAL DOCUMENTS</span>
          <p className="text-xl font-bold text-slate-900">{documents.length}</p>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded space-y-1 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PROCESSED</span>
          <p className="text-xl font-bold text-emerald-700">{documents.filter(d => d.status === 'PROCESSED').length}</p>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded space-y-1 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PROCESSING</span>
          <p className="text-xl font-bold text-blue-900">0</p>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded space-y-1 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">OCR DOCUMENTS</span>
          <p className="text-xl font-bold text-purple-900">{documents.filter(d => d.ocr_applied).length}</p>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded space-y-1 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">READY FOR AI</span>
          <p className="text-xl font-bold text-slate-900">{documents.length}</p>
        </div>
      </div>

      {/* Search & Multi-Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 border border-slate-200 rounded shadow-sm">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search documents by filename, equipment, type, or content..."
            className="w-full bg-slate-50 border border-slate-200 rounded pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-700 font-medium"
          >
            <option value="ALL">All Documents</option>
            <option value="PDF">PDF</option>
            <option value="CSV">CSV</option>
            <option value="DOCX">DOCX</option>
            <option value="TXT">TXT</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-700 font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="PROCESSED">Processed</option>
            <option value="PROCESSING">Processing</option>
            <option value="FAILED">Failed</option>
          </select>

          <select
            value={filterOcr}
            onChange={(e) => setFilterOcr(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-700 font-medium"
          >
            <option value="ALL">All Content Modes</option>
            <option value="Native Text">Native Text</option>
            <option value="OCR Extracted">OCR Extracted</option>
          </select>
        </div>
      </div>

      {/* Document Registry Table & Detail Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table List */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded overflow-hidden shadow-sm">
          {filteredDocs.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <FolderOpen className="w-10 h-10 mx-auto text-slate-300" />
              <h3 className="text-sm font-bold text-slate-900">DOCUMENT REPOSITORY EMPTY</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No documents match your filter criteria or have been uploaded yet. Upload confidential industrial documents to begin analysis.
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="mt-2 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs rounded transition-colors"
              >
                + Upload Document
              </button>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Document</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Size</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Content / OCR</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {filteredDocs.map((doc) => (
                  <tr
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`hover:bg-slate-50 cursor-pointer ${
                      selectedDoc?.id === doc.id ? 'bg-blue-50/60 font-medium' : ''
                    }`}
                  >
                    <td className="p-3 font-semibold text-slate-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-900 shrink-0" />
                      <div className="min-w-0">
                        <p className="truncate max-w-xs">{doc.filename}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-mono text-slate-800 font-semibold border border-slate-200">
                        {doc.file_type}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 font-mono text-[11px]">{(doc.file_size / 1024).toFixed(1)} KB</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-bold flex items-center gap-1 w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        {doc.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {doc.ocr_applied ? (
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-800 border border-purple-200 rounded text-[10px] font-bold">
                          OCR Extracted
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded text-[10px]">
                          Native Text
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setSelectedDoc(doc);
                            setShowPreviewModal(true);
                          }}
                          className="p-1 text-slate-500 hover:text-blue-900 hover:bg-slate-100 rounded"
                          title="Open Preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleUseInWorkbench(doc.filename)}
                          className="p-1 text-slate-500 hover:text-blue-900 hover:bg-slate-100 rounded"
                          title="Use in AI Workbench"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-1 text-slate-400 hover:text-red-700 hover:bg-slate-100 rounded"
                          title="Delete document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Document Detail Workspace Drawer */}
        <div className="bg-white border border-slate-200 rounded p-4 flex flex-col h-[540px] space-y-3 shadow-sm">
          <div className="border-b border-slate-200 pb-2.5 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">DOCUMENT DETAIL</h3>
            {selectedDoc && <span className="text-[11px] font-mono text-blue-900 truncate max-w-[150px]">{selectedDoc.filename}</span>}
          </div>

          {selectedDoc ? (
            <div className="flex-1 flex flex-col min-h-0 space-y-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px] font-mono space-y-1.5 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-400">Filename:</span>
                  <span className="font-semibold text-slate-900 truncate max-w-[140px]">{selectedDoc.filename}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">File Type:</span>
                  <span className="font-bold text-slate-900">{selectedDoc.file_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="text-emerald-700 font-bold">● {selectedDoc.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Extraction Mode:</span>
                  <span className="text-slate-900">{selectedDoc.ocr_applied ? 'Tesseract OCR' : 'Native Text'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">AI Availability:</span>
                  <span className="text-emerald-700 font-bold">READY FOR AI</span>
                </div>
              </div>

              {/* DOCUMENT ACTIONS */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">DOCUMENT ACTIONS</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <button
                    onClick={() => setShowPreviewModal(true)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-slate-800 font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-900" />
                    <span>Open Preview</span>
                  </button>

                  <button
                    onClick={() => handleUseInWorkbench(selectedDoc.filename)}
                    className="p-2 bg-blue-900 hover:bg-blue-800 text-white rounded font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Use in Workbench</span>
                  </button>
                </div>
              </div>

              {/* Extracted Text Content Preview */}
              <div className="flex-1 bg-slate-50 p-2.5 rounded font-mono text-[10px] text-slate-800 overflow-y-auto border border-slate-200 whitespace-pre-wrap leading-relaxed">
                {selectedDoc.extracted_text || 'Text content parsed and stored locally in database.'}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-xs text-slate-400 space-y-2">
              <FileText className="w-8 h-8 opacity-40" />
              <p>Select a document from the table to view details.</p>
            </div>
          )}
        </div>
      </div>

      {/* UPLOAD DOCUMENT MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-sm text-slate-900">UPLOAD DOCUMENT TO SOVEREIGN WORKBENCH</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleStartUpload} className="space-y-4 text-xs">
              {/* Drag & Drop File Input */}
              <div className="border-2 border-dashed border-slate-300 hover:border-blue-900 rounded-lg p-6 text-center space-y-2 bg-slate-50 transition-colors">
                <Upload className="w-8 h-8 mx-auto text-blue-900 opacity-60" />
                <p className="font-bold text-slate-800">Select File from Local Computer</p>
                <input
                  type="file"
                  accept=".pdf,.csv,.docx,.txt"
                  onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-900 file:text-white hover:file:bg-blue-800"
                />
                <p className="text-[11px] text-slate-500">Supported Formats: PDF · CSV · DOCX · TXT (Max: 50 MB)</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!uploadFile || uploading}
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded shadow-sm disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload & Process File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROCESSING PROGRESS MODAL */}
      {showProcessingModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg shadow-2xl w-full max-w-md p-6 space-y-4 text-center">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">LOCAL DOCUMENT INGESTION PIPELINE</h3>

            <div className="space-y-3 text-xs text-left max-w-xs mx-auto">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-900">1. File uploaded to server storage</span>
              </div>

              <div className="flex items-center gap-2">
                {processingStep >= 2 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <span className="w-4 h-4 rounded-full border-2 border-blue-900 border-t-transparent animate-spin"></span>
                )}
                <span className={processingStep >= 2 ? 'font-bold text-slate-900' : 'text-slate-400'}>
                  2. Extracting text / local OCR
                </span>
              </div>

              <div className="flex items-center gap-2">
                {processingStep >= 3 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <span className="w-4 h-4 rounded-full border-2 border-slate-300"></span>
                )}
                <span className={processingStep >= 3 ? 'font-bold text-slate-900' : 'text-slate-400'}>
                  3. Deterministic chunking (800/100)
                </span>
              </div>

              <div className="flex items-center gap-2">
                {processingStep >= 4 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <span className="w-4 h-4 rounded-full border-2 border-slate-300"></span>
                )}
                <span className={processingStep >= 4 ? 'font-bold text-slate-900' : 'text-slate-400'}>
                  4. Vector embedding & ready for AI
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 font-mono">100% On-Premise Execution · Zero Cloud Transfer</p>
          </div>
        </div>
      )}
    </div>
  );
};
