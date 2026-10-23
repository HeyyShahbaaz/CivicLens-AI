import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Layers, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { ReportStats } from '../types';

interface StatsOverviewProps {
  stats: ReportStats | null;
  onFilterCategory?: (category: string) => void;
  selectedCategory?: string;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  stats,
  onFilterCategory,
  selectedCategory = 'all'
}) => {
  if (!stats) return null;

  const total = stats.totalReports || 1;
  const highPriorityCount = stats.byPriority.high || 0;
  const resolvedCount = stats.byStatus.Resolved || 0;
  const inProgressCount = (stats.byStatus['Action In Progress'] || 0) + (stats.byStatus['Under Review'] || 0);

  const resolutionRate = Math.round((resolvedCount / total) * 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-6">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Grievances
          </p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {stats.totalReports}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Registered in SQLite DB
          </p>
        </div>

        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
          <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
            In Active Triage
          </p>
          <p className="text-2xl font-extrabold text-amber-900 mt-1">
            {inProgressCount}
          </p>
          <p className="text-[11px] text-amber-700 mt-0.5">
            Under Review or In Progress
          </p>
        </div>

        <div className="p-4 rounded-xl bg-red-50 border border-red-200">
          <p className="text-xs font-semibold text-red-800 uppercase tracking-wider">
            High Priority Hazards
          </p>
          <p className="text-2xl font-extrabold text-red-900 mt-1">
            {highPriorityCount}
          </p>
          <p className="text-[11px] text-red-700 mt-0.5">
            Acute Safety/Health Risks
          </p>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
          <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            Resolved Issues
          </p>
          <p className="text-2xl font-extrabold text-emerald-900 mt-1">
            {resolvedCount} <span className="text-sm font-normal text-emerald-700">({resolutionRate}%)</span>
          </p>
          <p className="text-[11px] text-emerald-700 mt-0.5">
            Verified Municipal Fixes
          </p>
        </div>

      </div>

      {/* Categories Distribution */}
      {stats.byCategory && Object.keys(stats.byCategory).length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Issue Distribution by Municipal Sector
            </h4>
            <span className="text-[11px] text-slate-400">Click to filter feed</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onFilterCategory && onFilterCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              All Categories ({stats.totalReports})
            </button>

            {Object.entries(stats.byCategory).map(([category, count]) => (
              <button
                key={category}
                onClick={() => onFilterCategory && onFilterCategory(category)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  selectedCategory === category
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border-slate-200'
                }`}
              >
                <span>{category}</span>
                <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                  selectedCategory === category ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
