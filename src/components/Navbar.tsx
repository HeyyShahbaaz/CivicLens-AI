import React from 'react';
import { 
  Building2, 
  PlusCircle, 
  Layers, 
  ShieldCheck, 
  BookOpen, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { SystemHealth } from '../types';

interface NavbarProps {
  currentTab: 'home' | 'report' | 'explore' | 'admin';
  setCurrentTab: (tab: 'home' | 'report' | 'explore' | 'admin') => void;
  systemHealth: SystemHealth | null;
  onOpenDocs: () => void;
  totalReportsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  systemHealth,
  onOpenDocs,
  totalReportsCount = 0
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900">
                  CivicLens<span className="text-emerald-600">.ai</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  Live GPS Edition
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                Open-Source Civic AI Triage & Resolution Engine
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setCurrentTab('home')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'home'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => setCurrentTab('explore')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'explore'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Public Feed</span>
              {totalReportsCount > 0 && (
                <span className="ml-1 text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {totalReportsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('admin')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'admin'
                  ? 'bg-amber-50 text-amber-900 font-semibold border border-amber-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              title="Demonstration Admin Review Panel"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">Admin Demo</span>
            </button>

            <button
              onClick={onOpenDocs}
              className="px-2.5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-1"
              title="Architecture & Model Docs"
            >
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span className="hidden md:inline">Docs</span>
            </button>

            {/* Primary Action Button */}
            <button
              onClick={() => setCurrentTab('report')}
              className="ml-2 inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-medium text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Issue</span>
            </button>
          </nav>
        </div>
      </div>

      {/* System Status Sub-banner */}
      {systemHealth && (
        <div className="bg-slate-900 text-slate-300 text-[11px] px-4 py-1 flex items-center justify-between border-t border-slate-800">
          <div className="flex items-center gap-3 overflow-x-auto whitespace-nowrap">
            <span className="flex items-center gap-1.5 font-medium text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              SQLite Persistent Storage: Active
            </span>
            <span className="text-slate-500">•</span>
            <span>
              Inference: <strong className="text-slate-100">{systemHealth.llmModel}</strong> ({systemHealth.llmProvider})
            </span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="hidden sm:inline text-slate-400">
              Hacktoberfest Hack Day Lucknow 2026
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden md:inline text-emerald-400/90 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
              Zero-Mock Real SQLite & GenAI
            </span>
          </div>
        </div>
      )}
    </header>
  );
};
