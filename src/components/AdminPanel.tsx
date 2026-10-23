import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  RefreshCw, 
  Eye, 
  Edit3, 
  Save, 
  X,
  Building,
  KeyRound
} from 'lucide-react';
import { CivicReport, ReportStatus } from '../types';
import { updateReportStatus } from '../services/api';

interface AdminPanelProps {
  reports: CivicReport[];
  onRefresh: () => void;
  onSelectReport: (report: CivicReport) => void;
  initialSelectedId?: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  reports,
  onRefresh,
  onSelectReport,
  initialSelectedId
}) => {
  const [adminPin, setAdminPin] = useState('1234');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Status editing state
  const [editingReport, setEditingReport] = useState<CivicReport | null>(
    reports.find(r => r.id === initialSelectedId) || null
  );
  const [newStatus, setNewStatus] = useState<ReportStatus>('Under Review');
  const [adminNote, setAdminNote] = useState('');
  const [officerName, setOfficerName] = useState('Municipal Control Room Officer');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Filter
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin.trim() === '1234') {
      setIsAuthenticated(true);
      setAuthError(null);
    } else {
      setAuthError('Invalid demonstration PIN. Please enter "1234" to access the demo panel.');
    }
  };

  const handleQuickUnlock = () => {
    setAdminPin('1234');
    setIsAuthenticated(true);
    setAuthError(null);
  };

  const handleOpenStatusModal = (report: CivicReport) => {
    setEditingReport(report);
    setNewStatus(report.status);
    setAdminNote('');
    setUpdateError(null);
    setUpdateSuccess(null);
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReport) return;

    setIsUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(null);

    try {
      await updateReportStatus(
        editingReport.id,
        newStatus,
        adminNote || `Status updated to ${newStatus} by ${officerName}`,
        adminPin
      );

      setUpdateSuccess(`Report ${editingReport.id} status successfully updated to "${newStatus}".`);
      onRefresh();
      setTimeout(() => {
        setEditingReport(null);
        setUpdateSuccess(null);
      }, 1500);
    } catch (err: any) {
      setUpdateError(err.message || 'Failed to update report status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return (
        r.title.toLowerCase().includes(term) ||
        r.id.toLowerCase().includes(term) ||
        r.location.toLowerCase().includes(term) ||
        r.category.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      
      {/* Demo Warning Notice */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 mb-6 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm">
          <p className="font-bold">Demonstration Admin Review Interface</p>
          <p className="text-amber-800 mt-0.5">
            This module demonstrates the administrative triage and work order lifecycle for municipal officials. 
            For evaluation purposes, demonstration authentication is used (Demo PIN: <strong>1234</strong>). 
            Production deployments would integrate with government SSO, OAuth2/OIDC, and role-based access control.
          </p>
        </div>
      </div>

      {!isAuthenticated ? (
        /* Demonstration Login Card */
        <div className="max-w-md mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 mx-auto flex items-center justify-center shadow-inner">
            <Lock className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900">Municipal Admin Access</h3>
            <p className="text-xs text-slate-500 mt-1">
              Enter demonstration passcode to review citizen grievances and issue status updates.
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs text-left">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-pin-input" className="block text-xs font-semibold text-slate-700 text-left mb-1">
                Demo Admin PIN
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="admin-pin-input"
                  type="password"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  placeholder="Enter 1234"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm transition-colors cursor-pointer shadow-sm"
            >
              Verify & Enter Dashboard
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleQuickUnlock}
              className="text-xs text-amber-700 hover:text-amber-800 font-semibold underline underline-offset-2 cursor-pointer"
            >
              One-Click Unlock with Default PIN (1234)
            </button>
          </div>
        </div>
      ) : (
        /* Authenticated Admin Dashboard */
        <div className="space-y-6">
          
          {/* Header Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">Municipal Grievance Register</h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  SQLite Live
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Review citizen complaints, verify AI recommendations, and dispatch field work orders.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onRefresh}
                className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>

              <button
                onClick={() => setIsAuthenticated(false)}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Lock Panel
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by ID, title, locality, or keyword..."
                className="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
              />
            </div>

            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="all">All Statuses ({reports.length})</option>
                <option value="Reported">Reported</option>
                <option value="Under Review">Under Review</option>
                <option value="Action In Progress">Action In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Dismissed">Dismissed</option>
              </select>
            </div>
          </div>

          {/* Reports Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Report ID</th>
                    <th className="py-3 px-4">Title & Locality</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">AI Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No reports matching your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">
                          {r.id}
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <p className="font-semibold text-slate-900 truncate">{r.title}</p>
                          <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {r.location}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                          {r.category}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            r.priority === 'high' ? 'bg-red-100 text-red-800' :
                            r.priority === 'medium' ? 'bg-amber-100 text-amber-800' :
                            'bg-emerald-100 text-emerald-800'
                          }`}>
                            {r.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            r.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' :
                            r.status === 'Action In Progress' ? 'bg-purple-100 text-purple-800' :
                            r.status === 'Under Review' ? 'bg-amber-100 text-amber-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                          {new Date(r.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                          <button
                            onClick={() => onSelectReport(r)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                            title="View Full Report"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenStatusModal(r)}
                            className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-50 font-medium inline-flex items-center gap-1"
                            title="Update Status"
                          >
                            <Edit3 className="w-4 h-4" />
                            <span>Change Status</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {editingReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Update Report Status</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  ID: {editingReport.id}
                </p>
              </div>
              <button
                onClick={() => setEditingReport(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {updateError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-800 text-xs">
                {updateError}
              </div>
            )}

            {updateSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{updateSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ReportStatus)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold bg-white"
                >
                  <option value="Reported">Reported</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Action In Progress">Action In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Dismissed">Dismissed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Audit Note / Work Order Description
                </label>
                <textarea
                  rows={3}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="e.g. Field inspection completed by Ward Junior Engineer; repair crew dispatched for overnight pothole filling."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reviewing Officer Designation
                </label>
                <input
                  type="text"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingReport(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isUpdating ? 'Saving...' : 'Apply Status Update'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
