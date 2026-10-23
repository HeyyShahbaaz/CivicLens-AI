import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Building, 
  ThumbsUp, 
  Copy, 
  Check, 
  Printer, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Share2
} from 'lucide-react';
import { CivicReport, PriorityLevel, ReportStatus } from '../types';

interface ReportDetailsModalProps {
  report: CivicReport | null;
  onClose: () => void;
  onUpvote: (id: string, e: React.MouseEvent) => void;
  onOpenAdmin: (reportId: string) => void;
}

export const ReportDetailsModal: React.FC<ReportDetailsModalProps> = ({
  report,
  onClose,
  onUpvote,
  onOpenAdmin
}) => {
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!report) return null;

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(report.complaintDraft);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}?report=${report.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-3xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
              {report.id}
            </span>
            <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
              report.priority === 'high' ? 'bg-red-50 text-red-700 border-red-200' :
              report.priority === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
              'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {report.priority} Priority
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Share report link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
          
          {/* Title & Metadata */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
              {report.title}
            </h2>
            
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <strong className="text-slate-700">{report.location}</strong>
              </span>

              <span className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>{report.department}</span>
              </span>

              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{new Date(report.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
              </span>
            </div>
          </div>

          {/* Photo Evidence if present */}
          {report.imageData && (
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900">
              <img 
                src={report.imageData} 
                alt={report.title} 
                className="w-full max-h-72 object-cover"
              />
              <div className="p-2.5 bg-slate-900 text-slate-300 text-xs flex items-center justify-between">
                <span>Verified Resident Photographic Evidence</span>
                <span className="text-[11px] text-emerald-400 font-semibold">Analyzed by {report.modelUsed}</span>
              </div>
            </div>
          )}

          {/* Full Description */}
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Problem Description
            </h4>
            <p className="text-sm text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
              {report.description}
            </p>
          </div>

          {/* Timeline / Status History */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <span>Resolution Audit Trail</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Current: {report.status}
                </span>
              </h4>

              <button
                type="button"
                onClick={() => onOpenAdmin(report.id)}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Review</span>
              </button>
            </div>

            <div className="space-y-3 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {report.statusHistory && report.statusHistory.map((step, idx) => (
                <div key={idx} className="relative">
                  <div className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 border-white ${
                    idx === report.statusHistory.length - 1 ? 'bg-emerald-600 ring-2 ring-emerald-200' : 'bg-slate-400'
                  }`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">{step.status}</span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(step.timestamp).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {step.note && (
                      <p className="text-xs text-slate-600 mt-0.5">{step.note}</p>
                    )}
                    <span className="text-[10px] text-slate-400">By {step.updatedBy}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Analysis Breakdown Box */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50/50 via-teal-50/30 to-white border border-emerald-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                AI Triage & Classification Breakdown
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Confidence: {Math.round(report.aiConfidence * 100)}%
              </span>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-600 uppercase">Executive Summary</p>
              <p className="text-sm text-slate-800 mt-0.5">{report.summary}</p>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-600 uppercase">Priority Rationale</p>
              <p className="text-sm text-slate-700 mt-0.5 bg-white p-3 rounded-xl border border-emerald-100">
                {report.priorityReason}
              </p>
            </div>

            {/* Missing Info Checklist */}
            {report.missingInformation && report.missingInformation.length > 0 && (
              <div className="p-4 rounded-xl bg-white border border-sky-200">
                <p className="text-xs font-bold text-sky-900 uppercase flex items-center gap-1.5 mb-1.5">
                  <Info className="w-3.5 h-3.5 text-sky-600" />
                  <span>Missing Information for Authorities</span>
                </p>
                <ul className="space-y-1 text-xs text-sky-800">
                  {report.missingInformation.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-sky-600 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommended Steps */}
            {report.recommendedSteps && report.recommendedSteps.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-600 uppercase mb-1.5">
                  Actionable Steps
                </p>
                <div className="space-y-1.5">
                  {report.recommendedSteps.map((step, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Formal Complaint Letter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Municipal Complaint Letter Draft
              </h4>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 px-2 py-1 rounded bg-slate-100 border border-slate-200 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyDraft}
                  className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 font-semibold cursor-pointer"
                >
                  {copiedDraft ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDraft ? 'Copied' : 'Copy Letter'}</span>
                </button>
              </div>
            </div>

            <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono leading-relaxed whitespace-pre-wrap overflow-x-auto border border-slate-800">
              {report.complaintDraft}
            </pre>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={(e) => onUpvote(report.id, e)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-800 hover:text-emerald-700 text-sm font-semibold border border-slate-200 transition-colors cursor-pointer"
          >
            <ThumbsUp className="w-4 h-4" />
            <span>Support Report ({report.upvotes || 0})</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
