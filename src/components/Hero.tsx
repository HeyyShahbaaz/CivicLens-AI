import React from 'react';
import { 
  Building, 
  Sparkles, 
  ShieldAlert, 
  FileText, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  Code2, 
  Cpu, 
  Users,
  Search
} from 'lucide-react';
import { ReportStats } from '../types';

interface HeroProps {
  onStartReport: () => void;
  onExplore: () => void;
  stats: ReportStats | null;
  onOpenDocs: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onStartReport,
  onExplore,
  stats,
  onOpenDocs
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-8 pb-16 border-b border-slate-800 text-slate-100">
      {/* Soft Green Glow (Left Side) */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />

      {/* Soft Blue Glow (Right Side) */}
      <div className="absolute top-10 right-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />

      {/* Background Decorative Mesh Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Hackathon Badge */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 text-white text-xs font-medium border border-slate-800 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            <span>Hacktoberfest Hack Day Lucknow</span>
            <span className="text-slate-500">|</span>
            <span className="text-orange-300 font-semibold">Option 1: Best Open-Source AI Project</span>
          </div>

          <button
            onClick={onOpenDocs}
            className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-900/70 hover:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-800 shadow-2xs transition-colors cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Apache 2.0 Open-Weight Architecture</span>
          </button>
        </div>

        {/* Main Headline */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs font-semibold mb-4">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>Global Edition • Real-Time GPS Active</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
            Empowering Communities with{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              AI-Powered Civic Triage
            </span>
          </h1>

          <p className="mt-5 text-lg sm:text-xl text-slate-300 leading-relaxed">
            Turn vague community grievances into structured, actionable municipal work orders. 
            CivicLens AI analyzes local hazards, predicts priority, pinpoints missing information, 
            and crafts formal complaint drafts ready for civic authorities.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={onStartReport}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 hover:shadow-emerald-600/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer group"
            >
              <Sparkles className="w-5 h-5 text-emerald-200 group-hover:rotate-12 transition-transform" />
              <span>Report a Civic Problem</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onExplore}
              className="px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-medium text-base shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span>Explore Live Reports</span>
            </button>
          </div>
        </div>

        {/* Core Pillars Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800 shadow-md hover:border-emerald-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 flex items-center justify-center mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-lg">Intelligent Multimodal Triage</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Upload photos or describe issues in everyday language. The AI identifies municipal department, assesses hazard priority, and spots missing details like pole markers or pipe dimensions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800 shadow-md hover:border-teal-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-teal-950/80 text-teal-400 border border-teal-800/60 flex items-center justify-center mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-lg">Instant Formal Complaints</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Automatically generates polite, professionally structured complaint letters addressed to Nagar Nigam, Jal Sansthan, or LESA, ready to print or email.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800 shadow-md hover:border-cyan-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 flex items-center justify-center mb-4">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-lg">Transparent & Explainable</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              AI-suggested priority is clearly labeled as an advisory recommendation with transparent confidence scores, safety warnings, and full human-in-the-loop editing agency.
            </p>
          </div>

        </div>

        {/* Quick Stats Bar */}
        {stats && (
          <div className="mt-10 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-white shadow-xl flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">City Activity</p>
                <p className="text-xl font-bold text-white">Live Civic Database</p>
              </div>
            </div>

            <div className="flex items-center gap-8 sm:gap-12 flex-wrap">
              <div>
                <p className="text-2xl font-extrabold text-white">{stats.totalReports}</p>
                <p className="text-xs text-slate-400">Total Grievances</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-amber-400">
                  {(stats.byStatus['Reported'] || 0) + (stats.byStatus['Under Review'] || 0)}
                </p>
                <p className="text-xs text-slate-400">In Active Triage</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-emerald-400">
                  {stats.byStatus['Resolved'] || 0}
                </p>
                <p className="text-xs text-slate-400">Verified Resolved</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-cyan-400">
                  {Object.keys(stats.byCategory).length}
                </p>
                <p className="text-xs text-slate-400">Civic Categories</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
