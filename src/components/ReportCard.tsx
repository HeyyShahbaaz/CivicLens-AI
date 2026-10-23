import React from 'react';
import { 
  MapPin, 
  ThumbsUp, 
  Clock, 
  ArrowUpRight, 
  AlertCircle, 
  CheckCircle2, 
  Camera, 
  Building,
  Sparkles
} from 'lucide-react';
import { CivicReport, PriorityLevel, ReportStatus } from '../types';

interface ReportCardProps {
  report: CivicReport;
  onSelect: (report: CivicReport) => void;
  onUpvote: (id: string, e: React.MouseEvent) => void;
  hasUpvoted?: boolean;
}

const PRIORITY_COLORS: Record<PriorityLevel, { bg: string; text: string; border: string; dot: string }> = {
  high: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  low: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' }
};

const STATUS_COLORS: Record<ReportStatus, { bg: string; text: string; border: string }> = {
  'Reported': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Under Review': { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  'Action In Progress': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'Resolved': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Dismissed': { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300' }
};

export const ReportCard: React.FC<ReportCardProps> = ({
  report,
  onSelect,
  onUpvote,
  hasUpvoted = false
}) => {
  const priorityStyle = PRIORITY_COLORS[report.priority] || PRIORITY_COLORS.medium;
  const statusStyle = STATUS_COLORS[report.status] || STATUS_COLORS.Reported;

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div 
      onClick={() => onSelect(report)}
      className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-400/80 shadow-xs hover:shadow-md transition-all duration-200 p-5 cursor-pointer flex flex-col justify-between group"
    >
      <div>
        
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${priorityStyle.dot}`} />
              {report.priority}
            </span>

            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
              {report.status}
            </span>
          </div>

          <span className="text-[11px] font-mono text-slate-400 font-medium">
            {report.id}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">
          {report.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{report.location}</span>
        </div>

        {/* AI Summary */}
        <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <span className="font-semibold text-slate-700">AI Summary: </span>
          {report.summary}
        </p>

        {/* Department */}
        <div className="flex items-center gap-1.5 mt-3 text-[11px] text-slate-500 font-medium">
          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{report.department}</span>
        </div>

        {/* Photo thumbnail indicator */}
        {report.imageData && (
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold bg-emerald-50/70 px-2 py-1 rounded-lg border border-emerald-100 w-fit">
            <Camera className="w-3.5 h-3.5" />
            <span>Multimodal Photo Evidence</span>
          </div>
        )}
      </div>

      {/* Bottom Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => onUpvote(report.id, e)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              hasUpvoted
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border-slate-200'
            }`}
            title="Upvote to increase community urgency"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{report.upvotes || 0}</span>
          </button>

          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatDate(report.createdAt)}</span>
          </span>
        </div>

        <span className="text-xs font-semibold text-emerald-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
          <span>Details</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </span>
      </div>

    </div>
  );
};
