import React, { useEffect, useState } from 'react';
import { api, DeliverableItem } from '../api';
import { FileCheck2, Download, FileText, CheckCircle2, Clock, AlertCircle, Eye, ShieldCheck, X } from 'lucide-react';

export const DeliverablesView: React.FC = () => {
  const [items, setItems] = useState<DeliverableItem[]>([]);
  const [approvalState, setApprovalState] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [selectedItem, setSelectedItem] = useState<DeliverableItem | null>(null);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);

  useEffect(() => {
    fetchDeliverables();
  }, []);

  const fetchDeliverables = async () => {
    try {
      const res = await api.get('/deliverables');
      setItems(res.data);
      if (res.data.length > 0 && !selectedItem) {
        setSelectedItem(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownload = (id: string) => {
    window.open(`/api/v1/deliverables/${id}/download`, '_blank');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Workspace</span>
            <span>/</span>
            <span className="font-semibold text-slate-700">Deliverables</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">DELIVERABLES</h2>
          <p className="text-xs text-slate-500">Generated enterprise outputs awaiting download or review.</p>
        </div>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded space-y-1 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOTAL DELIVERABLES</span>
          <p className="text-2xl font-bold text-slate-900">5</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded space-y-1 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PENDING REVIEW</span>
          <p className="text-2xl font-bold text-amber-700">{approvalState === 'APPROVED' ? 0 : 1}</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded space-y-1 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">APPROVED</span>
          <p className="text-2xl font-bold text-emerald-700">{approvalState === 'APPROVED' ? 5 : 4}</p>
        </div>
      </div>

      {/* PROMINENT HUMAN REVIEW REQUIRED BANNER */}
      {approvalState !== 'APPROVED' && (
        <div className="p-5 bg-amber-50 border-2 border-amber-300 rounded-lg space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-amber-200 pb-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
              <AlertCircle className="w-5 h-5 text-amber-700" />
              <span>HUMAN REVIEW REQUIRED</span>
            </div>
            <span className="px-2.5 py-0.5 bg-amber-200 text-amber-950 font-bold text-[10px] rounded font-mono">
              ● PENDING HUMAN APPROVAL
            </span>
          </div>

          <div className="space-y-2 text-xs text-slate-800">
            <h4 className="font-bold text-slate-900 text-sm">Emergency Shutdown Approval Note (.docx)</h4>
            <p className="p-3 bg-white border border-amber-200 rounded font-medium text-slate-900 leading-relaxed">
              AI Recommendation: <strong>"Immediately isolate Pump P-102A due to 48.5 BAR discharge pressure exceedance (+7.78% over Safety SOP threshold)."</strong>
            </p>

            <div className="flex items-center gap-4 text-[11px] text-slate-600 font-mono">
              <span>Evidence: <strong>Inspection Report — Page 3</strong></span>
              <span>Safety SOP: <strong>Section 4.2</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-amber-200">
            <button
              onClick={() => setShowEvidenceModal(true)}
              className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-xs rounded"
            >
              Review Evidence
            </button>
            <button
              onClick={() => setApprovalState('APPROVED')}
              className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve Action</span>
            </button>
            <button
              onClick={() => setApprovalState('REJECTED')}
              className="px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white font-semibold text-xs rounded"
            >
              Reject Action
            </button>
          </div>
        </div>
      )}

      {/* Deliverables Registry Table & Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deliverables Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Deliverable</th>
                <th className="p-3">Type</th>
                <th className="p-3">Source Workflow</th>
                <th className="p-3">Status</th>
                <th className="p-3">Created</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {items.map((item, idx) => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`hover:bg-slate-50 cursor-pointer ${
                    selectedItem?.id === item.id ? 'bg-blue-50/60 font-medium' : ''
                  }`}
                >
                  <td className="p-3 font-semibold text-slate-900 flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-blue-900 shrink-0" />
                    <span>{item.title}</span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono text-[10px] font-bold text-slate-800">
                      {item.file_type}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600">Pump P-102A Review</td>
                  <td className="p-3">
                    {idx === 0 && approvalState !== 'APPROVED' ? (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-300 rounded text-[10px] font-bold">
                        Pending Review
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-bold flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3" /> Approved
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-slate-400 font-mono text-[11px]">Today</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(item);
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded text-[11px]"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* DELIVERABLE DETAIL DRAWER */}
        <div className="bg-white border border-slate-200 rounded p-4 flex flex-col h-[460px] space-y-3 shadow-sm">
          <div className="border-b border-slate-200 pb-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">DELIVERABLE DETAIL</h3>
          </div>

          {selectedItem ? (
            <div className="flex-1 flex flex-col justify-between space-y-3 text-xs">
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">DOCUMENT TITLE</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedItem.title}</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px] font-mono space-y-1 text-slate-700">
                  <div>Generated from: <strong className="text-slate-900">Pump P-102A Inspection Review</strong></div>
                  <div>AI Model: <strong className="text-blue-900">qwen2.5:7b-instruct</strong></div>
                  <div>Approval Status: <strong className="text-emerald-700">Approved by Chief Engineer</strong></div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SOURCES</span>
                  <div className="mt-1 space-y-1 font-medium text-slate-800">
                    <div className="p-1.5 bg-slate-50 border border-slate-200 rounded text-[11px]">Equipment_Inspection_Report.pdf</div>
                    <div className="p-1.5 bg-slate-50 border border-slate-200 rounded text-[11px]">Safety_SOP_Refinery_2026.pdf</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                <button
                  onClick={() => setShowEvidenceModal(true)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded text-xs"
                >
                  Preview
                </button>
                <button
                  onClick={() => handleDownload(selectedItem.id)}
                  className="flex-1 py-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
              Select a deliverable to view detail metadata.
            </div>
          )}
        </div>
      </div>

      {/* EVIDENCE REVIEW MODAL */}
      {showEvidenceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg shadow-2xl w-full max-w-lg p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-sm text-slate-900">GROUNDED EVIDENCE REVIEW</h3>
              <button onClick={() => setShowEvidenceModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
                <strong className="text-blue-900 font-bold">Inspection Report — Page 3</strong>
                <p className="text-slate-700 font-mono text-[11px]">"Discharge pressure registered at 48.5 BAR (7.78% over limit)."</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
                <strong className="text-blue-900 font-bold">Safety SOP — Section 4.2</strong>
                <p className="text-slate-700 font-mono text-[11px]">"Pressure exceedance above 45.0 BAR requires immediate emergency isolation."</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowEvidenceModal(false)}
                className="px-4 py-2 bg-blue-900 text-white font-semibold rounded"
              >
                Close Evidence
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
