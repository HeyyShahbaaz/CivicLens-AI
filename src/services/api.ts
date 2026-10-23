import { CivicReport, AIAnalysisResult, ReportStats, SystemHealth, ReportStatus, IssueCategory, PriorityLevel } from '../types';

export interface ReportFilters {
  search?: string;
  category?: string;
  priority?: string;
  status?: string;
}

export async function fetchReports(filters?: ReportFilters): Promise<CivicReport[]> {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.category && filters.category !== 'all') params.append('category', filters.category);
  if (filters?.priority && filters.priority !== 'all') params.append('priority', filters.priority);
  if (filters?.status && filters.status !== 'all') params.append('status', filters.status);

  const res = await fetch(`/api/reports?${params.toString()}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch reports');
  }
  const data = await res.json();
  return data.reports || [];
}

export async function fetchReportById(id: string): Promise<CivicReport> {
  const res = await fetch(`/api/reports/${id}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Report not found');
  }
  const data = await res.json();
  return data.report;
}

export async function fetchReportStats(): Promise<ReportStats> {
  const res = await fetch('/api/reports/stats');
  if (!res.ok) {
    throw new Error('Failed to load statistics');
  }
  const data = await res.json();
  return data.stats;
}

export async function analyzeCivicIssue(payload: {
  title: string;
  description: string;
  location: string;
  imageData?: string;
}): Promise<AIAnalysisResult> {
  const res = await fetch('/api/reports/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to complete AI analysis');
  }
  return data.analysis;
}

export async function submitReport(payload: {
  title: string;
  description: string;
  location: string;
  imageData?: string;
  citizenContact?: string;
  editedDraft?: string;
  customCategory?: IssueCategory;
  customPriority?: PriorityLevel;
  precomputedAnalysis?: AIAnalysisResult;
}): Promise<CivicReport> {
  const res = await fetch('/api/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to create report');
  }
  return data.report;
}

export async function updateReportStatus(
  id: string,
  status: ReportStatus,
  note: string,
  adminPin: string
): Promise<CivicReport> {
  const res = await fetch(`/api/reports/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-pin': adminPin
    },
    body: JSON.stringify({ status, note, adminPin })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to update report status');
  }
  return data.report;
}

export async function upvoteReport(id: string): Promise<number> {
  const res = await fetch(`/api/reports/${id}/upvote`, {
    method: 'POST'
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to register upvote');
  }
  return data.upvotes;
}

export async function fetchSystemHealth(): Promise<SystemHealth> {
  const res = await fetch('/api/system/health');
  if (!res.ok) {
    throw new Error('System health check unavailable');
  }
  return res.json();
}
