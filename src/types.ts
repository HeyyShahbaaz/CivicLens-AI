export type PriorityLevel = 'low' | 'medium' | 'high';

export type ReportStatus = 
  | 'Reported' 
  | 'Under Review' 
  | 'Action In Progress' 
  | 'Resolved' 
  | 'Dismissed';

export type IssueCategory =
  | 'Roads & Potholes'
  | 'Sanitation & Waste'
  | 'Street Lighting'
  | 'Water & Drainage'
  | 'Encroachment & Traffic'
  | 'Public Health & Safety'
  | 'Parks & Greenery'
  | 'Other';

export interface StatusHistoryEntry {
  status: ReportStatus;
  timestamp: string;
  note?: string;
  updatedBy: string;
}

export interface AIAnalysisResult {
  category: IssueCategory;
  department: string;
  summary: string;
  priority: PriorityLevel;
  priorityReason: string;
  missingInformation: string[];
  recommendedSteps: string[];
  complaintDraft: string;
  confidenceScore: number;
  safetyWarning?: string;
  modelUsed: string;
}

export interface CivicReport {
  id: string;
  title: string;
  description: string;
  location: string;
  category: IssueCategory;
  department: string;
  priority: PriorityLevel;
  priorityReason: string;
  summary: string;
  missingInformation: string[];
  recommendedSteps: string[];
  complaintDraft: string;
  imageData?: string;
  status: ReportStatus;
  statusHistory: StatusHistoryEntry[];
  upvotes: number;
  citizenContact?: string;
  aiConfidence: number;
  modelUsed: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportStats {
  totalReports: number;
  byStatus: Record<ReportStatus, number>;
  byPriority: Record<PriorityLevel, number>;
  byCategory: Record<string, number>;
  recentResolvedCount: number;
}

export interface SystemHealth {
  status: string;
  appName: string;
  edition: string;
  llmProvider: string;
  llmModel: string;
  database: string;
  timestamp: string;
}
