/**
 * CivicLens AI — Open-Source AI Civic Triage Platform
 * Hacktoberfest Hack Day Lucknow — Option 1: Best Open-Source AI Project
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Building2, 
  PlusCircle, 
  Search, 
  Filter, 
  Layers, 
  ShieldCheck, 
  Sparkles, 
  RotateCcw, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Github, 
  Heart,
  BookOpen
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ReportForm } from './components/ReportForm';
import { ReportCard } from './components/ReportCard';
import { ReportDetailsModal } from './components/ReportDetailsModal';
import { AdminPanel } from './components/AdminPanel';
import { StatsOverview } from './components/StatsOverview';
import { DocsModal } from './components/DocsModal';
import { 
  fetchReports, 
  fetchReportStats, 
  fetchSystemHealth, 
  upvoteReport 
} from './services/api';
import { CivicReport, ReportStats, SystemHealth } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'home' | 'report' | 'explore' | 'admin'>('home');
  const [reports, setReports] = useState<CivicReport[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [selectedReport, setSelectedReport] = useState<CivicReport | null>(null);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters for Explorer Feed
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set());
  const [adminTargetId, setAdminTargetId] = useState<string | undefined>(undefined);

  // Load initial data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [fetchedReports, fetchedStats, health] = await Promise.all([
        fetchReports(),
        fetchReportStats().catch(() => null),
        fetchSystemHealth().catch(() => null)
      ]);

      setReports(fetchedReports);
      setStats(fetchedStats);
      setSystemHealth(health);
    } catch (err: any) {
      console.error('Failed to load initial CivicLens data:', err);
      setError(err.message || 'Unable to connect to CivicLens API.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle URL deep-linking e.g. ?report=LKO-2026-1042
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reportParam = params.get('report');
    if (reportParam && reports.length > 0) {
      const found = reports.find(r => r.id === reportParam);
      if (found) {
        setSelectedReport(found);
      }
    }
  }, [reports]);

  // Upvote handler
  const handleUpvote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (upvotedIds.has(id)) return;

    try {
      const newUpvotes = await upvoteReport(id);
      setUpvotedIds(prev => new Set(prev).add(id));
      setReports(prev => prev.map(r => r.id === id ? { ...r, upvotes: newUpvotes } : r));
      if (selectedReport && selectedReport.id === id) {
        setSelectedReport(prev => prev ? { ...prev, upvotes: newUpvotes } : null);
      }
    } catch (err) {
      console.error('Failed to register upvote:', err);
    }
  };

  const handleOpenAdminForReport = (reportId: string) => {
    setSelectedReport(null);
    setAdminTargetId(reportId);
    setCurrentTab('admin');
  };

  // Filtered reports for the Explorer
  const filteredReports = reports.filter(r => {
    if (filterCategory !== 'all' && r.category !== filterCategory) return false;
    if (filterPriority !== 'all' && r.priority !== filterPriority) return false;
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        systemHealth={systemHealth}
        onOpenDocs={() => setIsDocsOpen(true)}
        totalReportsCount={reports.length}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* VIEW 1: HOME PAGE */}
        {currentTab === 'home' && (
          <div>
            <Hero
              onStartReport={() => setCurrentTab('report')}
              onExplore={() => setCurrentTab('explore')}
              stats={stats}
              onOpenDocs={() => setIsDocsOpen(true)}
            />

            {/* Recent Reports Highlights */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Recently Triaged Grievances in Lucknow
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Live civic issues prioritized by AI models and awaiting municipal action.
                  </p>
                </div>

                <button
                  onClick={() => setCurrentTab('explore')}
                  className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>View All {reports.length} Reports</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {isLoading ? (
                <div className="py-16 text-center">
                  <div className="w-10 h-10 rounded-full border-3 border-emerald-200 border-t-emerald-600 animate-spin mx-auto mb-3" />
                  <p className="text-sm text-slate-500 font-medium">Loading municipal reports from SQLite...</p>
                </div>
              ) : reports.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                  <p className="text-slate-500 text-sm">No reports logged yet.</p>
                  <button
                    onClick={() => setCurrentTab('report')}
                    className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
                  >
                    Be the First to Report
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {reports.slice(0, 6).map((report) => (
                    <ReportCard
                      key={report.id}
                      report={report}
                      onSelect={(r) => setSelectedReport(r)}
                      onUpvote={handleUpvote}
                      hasUpvoted={upvotedIds.has(report.id)}
                    />
                  ))}
                </div>
              )}

              {/* How It Works Guide */}
              <div className="mt-16 p-8 rounded-3xl bg-slate-900 text-white shadow-xl">
                <div className="text-center max-w-xl mx-auto mb-10">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800">
                    Transparent Civic Workflow
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
                    From Photo to Municipal Resolution
                  </h3>
                  <p className="text-slate-400 text-sm mt-2">
                    How CivicLens AI transforms citizen reports into actionable work orders.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  
                  <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-2">
                    <span className="text-emerald-400 font-mono font-bold text-sm">01 / Submit</span>
                    <h4 className="font-bold text-base text-white">Capture & Describe</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Citizen inputs road, sanitation, lighting, or drainage issues with location and optional photo evidence.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-2">
                    <span className="text-emerald-400 font-mono font-bold text-sm">02 / AI Triage</span>
                    <h4 className="font-bold text-base text-white">Multimodal Analysis</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Inference model assesses danger level, maps jurisdiction, identifies missing info, and calculates confidence.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-2">
                    <span className="text-emerald-400 font-mono font-bold text-sm">03 / Complaint</span>
                    <h4 className="font-bold text-base text-white">Formal Drafting</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Generates official, respectful letter addressed to Nagar Nigam or Jal Sansthan, editable by the citizen.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-2">
                    <span className="text-emerald-400 font-mono font-bold text-sm">04 / Lifecycle</span>
                    <h4 className="font-bold text-base text-white">Public Audit Trail</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Persisted in SQLite database; tracks progress transparently from inspection to verified fix.
                    </p>
                  </div>

                </div>
              </div>

            </div>
          </div>
        )}

        {/* VIEW 2: NEW REPORT WIZARD */}
        {currentTab === 'report' && (
          <ReportForm
            onReportCreated={(newRep) => {
              setReports(prev => [newRep, ...prev]);
              fetchReportStats().then(setStats).catch(() => {});
            }}
            onCancel={() => setCurrentTab('home')}
          />
        )}

        {/* VIEW 3: PUBLIC FEED EXPLORER */}
        {currentTab === 'explore' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Public Grievance Explorer
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Community-reported issues across Lucknow wards, verified by AI triage.
                </p>
              </div>

              <button
                onClick={() => setCurrentTab('report')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>File New Grievance</span>
              </button>
            </div>

            {/* Statistics Banner */}
            <StatsOverview
              stats={stats}
              onFilterCategory={(cat) => setFilterCategory(cat)}
              selectedCategory={filterCategory}
            />

            {/* Search and Filters Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by keyword, street, landmark, or report ID (e.g. LKO-2026-1042)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Reported">Reported</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Action In Progress">Action In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-medium mb-1">Priority</label>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="all">All Priorities</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-medium mb-1">Category</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="all">All Categories</option>
                    <option value="Roads & Potholes">Roads & Potholes</option>
                    <option value="Sanitation & Waste">Sanitation & Waste</option>
                    <option value="Street Lighting">Street Lighting</option>
                    <option value="Water & Drainage">Water & Drainage</option>
                    <option value="Encroachment & Traffic">Encroachment & Traffic</option>
                    <option value="Public Health & Safety">Public Health & Safety</option>
                    <option value="Parks & Greenery">Parks & Greenery</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilterCategory('all');
                      setFilterPriority('all');
                      setFilterStatus('all');
                    }}
                    className="w-full p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center gap-1 font-semibold cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Filters</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Reports Grid */}
            {isLoading ? (
              <div className="py-20 text-center">
                <div className="w-10 h-10 rounded-full border-3 border-emerald-200 border-t-emerald-600 animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-500">Querying SQLite database...</p>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
                <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No matching reports found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try adjusting your search terms or clearing your filters to see more community reports.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterCategory('all');
                    setFilterPriority('all');
                    setFilterStatus('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-3 px-1">
                  <span>Showing {filteredReports.length} of {reports.length} reports</span>
                  <span className="font-mono text-emerald-700 font-semibold">Sorted by: Most Recent</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredReports.map((report) => (
                    <ReportCard
                      key={report.id}
                      report={report}
                      onSelect={(r) => setSelectedReport(r)}
                      onUpvote={handleUpvote}
                      hasUpvoted={upvotedIds.has(report.id)}
                    />
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* VIEW 4: ADMIN DASHBOARD */}
        {currentTab === 'admin' && (
          <AdminPanel
            reports={reports}
            onRefresh={loadData}
            onSelectReport={(r) => setSelectedReport(r)}
            initialSelectedId={adminTargetId}
          />
        )}

      </main>

      {/* Report Details Modal */}
      <ReportDetailsModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        onUpvote={handleUpvote}
        onOpenAdmin={handleOpenAdminForReport}
      />

      {/* Docs & Architecture Modal */}
      <DocsModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="font-bold text-lg text-white">CivicLens AI</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-md">
                Open-source civic intelligence and complaint triage engine for Hacktoberfest Hack Day Lucknow. 
                Built to streamline public service delivery through transparent, explainable AI assistance.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-mono">
                  Apache 2.0 Open Source
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-800 text-emerald-400 border border-slate-700 text-[11px] font-mono">
                  SQLite WebAssembly DB
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Navigation</h4>
              <ul className="space-y-1.5 text-xs">
                <li><button onClick={() => setCurrentTab('home')} className="hover:text-white">Home Page</button></li>
                <li><button onClick={() => setCurrentTab('report')} className="hover:text-white">Report Civic Issue</button></li>
                <li><button onClick={() => setCurrentTab('explore')} className="hover:text-white">Public Feed Explorer</button></li>
                <li><button onClick={() => setCurrentTab('admin')} className="hover:text-white">Admin Demo Review</button></li>
                <li><button onClick={() => setIsDocsOpen(true)} className="hover:text-white">System Architecture</button></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Civic Transparency</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                AI priorities and complaint drafts are generated as advisory aids to empower residents. 
                This platform does not falsely represent itself as a government entity.
              </p>
              <p className="text-[11px] text-slate-500 pt-2">
                Hacktoberfest Lucknow — Option 1: Best Open-Source AI Project
              </p>
            </div>

          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-[11px]">
            <p>© 2026 CivicLens AI Open Source Project. Released under Apache-2.0 License.</p>
            <div className="flex items-center gap-4">
              <button onClick={() => setIsDocsOpen(true)} className="hover:text-white underline">Documentation</button>
              <span>•</span>
              <span className="text-emerald-400 font-mono">Status: All Systems Operational</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
