import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { CivicReport, IssueCategory, PriorityLevel, ReportStats, ReportStatus } from '../types.js';

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = process.env.DATABASE_FILE || path.join(DB_DIR, 'civiclens.sqlite');

let dbInstance: SqlJsDatabase | null = null;
let initPromise: Promise<SqlJsDatabase> | null = null;

function saveDatabaseToFile(db: SqlJsDatabase) {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error('[DB] Error persisting SQLite file:', err);
  }
}

export async function getDatabase(): Promise<SqlJsDatabase> {
  if (dbInstance) return dbInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const SQL = await initSqlJs();

    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    let db: SqlJsDatabase;
    if (fs.existsSync(DB_FILE)) {
      try {
        const filebuffer = fs.readFileSync(DB_FILE);
        db = new SQL.Database(filebuffer);
        console.log(`[DB] Loaded SQLite database from ${DB_FILE}`);
      } catch (e) {
        console.warn('[DB] Existing SQLite file corrupt or invalid, initializing fresh DB', e);
        db = new SQL.Database();
      }
    } else {
      db = new SQL.Database();
      console.log(`[DB] Created new in-memory SQLite database, will persist to ${DB_FILE}`);
    }

    // Create table schema
    db.run(`
      CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        location TEXT NOT NULL,
        category TEXT NOT NULL,
        department TEXT NOT NULL,
        priority TEXT NOT NULL,
        priority_reason TEXT NOT NULL,
        summary TEXT NOT NULL,
        missing_information TEXT NOT NULL,
        recommended_steps TEXT NOT NULL,
        complaint_draft TEXT NOT NULL,
        image_data TEXT,
        status TEXT NOT NULL DEFAULT 'Reported',
        status_history TEXT NOT NULL,
        upvotes INTEGER NOT NULL DEFAULT 0,
        citizen_contact TEXT,
        ai_confidence REAL NOT NULL DEFAULT 0.85,
        model_used TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    // Check if table is empty, seed demo reports if so
    const checkStmt = db.prepare('SELECT COUNT(*) as count FROM reports');
    checkStmt.step();
    const row = checkStmt.getAsObject() as { count: number };
    checkStmt.free();

    if (row.count === 0) {
      seedDemoReports(db);
    }

    saveDatabaseToFile(db);
    dbInstance = db;
    return db;
  })();

  return initPromise;
}

function seedDemoReports(db: SqlJsDatabase) {
  console.log('[DB] Seeding demonstration reports for Lucknow...');
  const now = new Date();
  const pastHours = (h: number) => new Date(now.getTime() - h * 3600 * 1000).toISOString();

  const demoReports: CivicReport[] = [
    {
      id: 'LKO-2026-1042',
      title: 'Deep pothole cluster near Hazratganj Metro Gate 2',
      description: 'Multiple deep potholes right after the recent rainfall near Hazratganj Metro Station Exit 2 on MG Road. Two two-wheelers skidded yesterday evening during peak commute hours. Rainwater collects inside, concealing the 6-inch depth from approaching traffic.',
      location: 'MG Road, near Metro Gate 2, Hazratganj, Lucknow',
      category: 'Roads & Potholes',
      department: 'Lucknow Nagar Nigam (Zone 1 - Public Works)',
      priority: 'high',
      priorityReason: 'High collision and injury hazard on a heavily trafficked arterial corridor directly impacting metro commuters and two-wheeler riders.',
      summary: 'Hazardous cluster of potholes measuring up to 6 inches depth near Hazratganj Metro Exit 2, posing acute skidding risks.',
      missingInformation: [
        'Photographic proof with dimension scale (e.g. foot or object beside pothole)',
        'Nearest municipal road milestone or pole ID'
      ],
      recommendedSteps: [
        'Place temporary hazard reflector cones or barricade caution tape',
        'Forward expedited work order to LNN Zone 1 Rapid Pavement Repair crew',
        'Monitor asphalt compaction after hot-mix patch application'
      ],
      complaintDraft: `To,
The Municipal Commissioner / Executive Engineer (PWD),
Lucknow Nagar Nigam (Zone 1),
Lucknow, Uttar Pradesh.

Subject: Urgent Request for Immediate Repair of Dangerous Pothole Cluster near Hazratganj Metro Gate 2

Respected Sir/Madam,

I am writing to formally draw your urgent attention to severe road surface damage comprising deep potholes on MG Road, directly opposite Metro Station Gate No. 2, Hazratganj.

These potholes have reached an estimated depth of 6 inches and have caused multiple near-fatal skidding accidents for two-wheelers during evening commute hours. Since stagnant water obscures the hazard, immediate cold/hot mix bituminous patching and warning barricades are urgently requested to prevent grievous injury.

Yours sincerely,
Concerned Citizen & Commuter,
Hazratganj Ward, Lucknow`,
      imageData: '',
      status: 'Action In Progress',
      statusHistory: [
        {
          status: 'Reported',
          timestamp: pastHours(48),
          note: 'Issue submitted via CivicLens AI community portal',
          updatedBy: 'Citizen Portal'
        },
        {
          status: 'Under Review',
          timestamp: pastHours(36),
          note: 'Assigned to Ward Junior Engineer for physical site inspection',
          updatedBy: 'LNN Control Room (Admin)'
        },
        {
          status: 'Action In Progress',
          timestamp: pastHours(12),
          note: 'Cold asphalt mixture requisitioned; repair crew scheduled for night shift',
          updatedBy: 'PWD Engineer (Admin)'
        }
      ],
      upvotes: 27,
      citizenContact: 'hazratganj.commuters@gmail.com',
      aiConfidence: 0.94,
      modelUsed: 'gemini-3.8-flash',
      createdAt: pastHours(48),
      updatedAt: pastHours(12)
    },
    {
      id: 'LKO-2026-1043',
      title: 'Overflowing community garbage vat near Patrakar Puram Crossing',
      description: 'The municipal secondary waste collection vat near Patrakar Puram Crossing has not been cleared for 3 consecutive days. Stray cattle and dogs are scattering decomposing plastic and organic waste onto the pedestrian walkway, causing intense stench and blocking pedestrian passage.',
      location: 'Vikas Khand / Patrakar Puram Crossing, Gomti Nagar, Lucknow',
      category: 'Sanitation & Waste',
      department: 'Lucknow Nagar Nigam (Health & Solid Waste Management Dept)',
      priority: 'high',
      priorityReason: 'Severe public health and disease vector hazard adjacent to residential housing and market eateries with heavy footfall.',
      summary: '3-day uncleared municipal waste container spilling organic refuse onto Gomti Nagar pedestrian paths, attracting stray animals.',
      missingInformation: [
        'Frequency of local door-to-door waste compactor collection in this lane',
        'Exact shop or landmark opposite the collection vat'
      ],
      recommendedSteps: [
        'Deploy mechanical loader and tipper truck for immediate refuse evacuation',
        'Disinfect the perimeter area with lime powder/bleaching agent',
        'Adjust daily compactor schedule to prevent overflow peaks'
      ],
      complaintDraft: `To,
The Chief Sanitary Inspector / Zonal Officer,
Lucknow Nagar Nigam, Zone 4 (Gomti Nagar),
Lucknow, Uttar Pradesh.

Subject: Urgent Complaint Regarding Uncleared Garbage Dump at Patrakar Puram Crossing

Respected Officer,

I wish to bring to your immediate notice the hazardous accumulation of municipal solid waste at the collection bin near Patrakar Puram Crossing, Gomti Nagar.

The vat has remained unattended for over 72 hours, resulting in waste spillage across pedestrian pathways and posing grave risks of vector-borne infections to nearby residents and schoolchildren. We earnestly request an immediate tipper truck dispatch and sanitization spray.

Thanking you in anticipation,
Resident Welfare Association,
Gomti Nagar, Lucknow`,
      imageData: '',
      status: 'Under Review',
      statusHistory: [
        {
          status: 'Reported',
          timestamp: pastHours(28),
          note: 'Reported with citizen verification',
          updatedBy: 'Citizen Portal'
        },
        {
          status: 'Under Review',
          timestamp: pastHours(8),
          note: 'Notification dispatched to Zone 4 Sanitary Inspector',
          updatedBy: 'LNN Control Room (Admin)'
        }
      ],
      upvotes: 19,
      citizenContact: 'gomtinagar.resident@outlook.com',
      aiConfidence: 0.91,
      modelUsed: 'gemini-3.8-flash',
      createdAt: pastHours(28),
      updatedAt: pastHours(8)
    },
    {
      id: 'LKO-2026-1044',
      title: 'Broken LED street lights causing total darkness on Alambagh Main Road',
      description: 'Five consecutive street light poles (Pole IDs ALB-84 to ALB-88) between Alambagh Chauraha and Singar Nagar have been non-functional for over a week. The stretch becomes pitch black after 7 PM, creating safety fears especially for women pedestrians and night commuters.',
      location: 'Alambagh Chauraha to Singar Nagar stretch, Kanpur Road, Lucknow',
      category: 'Street Lighting',
      department: 'Lucknow Electricity Supply Administration (LESA) & LNN Streetlight Cell',
      priority: 'medium',
      priorityReason: 'Safety and security threat along a major transit route during nighttime, increasing accident and theft vulnerabilities.',
      summary: 'Five continuous street lights dark on Kanpur Road link near Alambagh, impairing night visibility and pedestrian safety.',
      missingInformation: [
        'Confirmation whether feeder line tripped or individual LED fixtures burned out',
        'Time when lights first stopped turning on'
      ],
      recommendedSteps: [
        'Inspect the local timer panel and distribution junction box',
        'Replace burned out 90W LED luminaires on poles ALB-84 through ALB-88',
        'Verify lux levels after dusk'
      ],
      complaintDraft: `To,
The Executive Engineer (Street Lighting),
Lucknow Nagar Nigam & LESA Joint Cell,
Lucknow, Uttar Pradesh.

Subject: Complaint Regarding Persistent Non-Functioning of Street Lights along Alambagh - Singar Nagar Road

Respected Sir,

This is to lodge a grievance regarding five completely dead street light luminaires (Poles ALB-84 to ALB-88) on the main transit road near Alambagh.

The total darkness after sunset creates severe safety concerns for evening office commuters, women, and seniors. Kindly direct the electrical maintenance vendor to inspect the line and replace faulty fixtures without delay.

Sincerely,
Alambagh Traders & Residents Collective,
Lucknow`,
      imageData: '',
      status: 'Reported',
      statusHistory: [
        {
          status: 'Reported',
          timestamp: pastHours(16),
          note: 'Registered through CivicLens AI portal',
          updatedBy: 'Citizen Portal'
        }
      ],
      upvotes: 14,
      citizenContact: 'alambagh.civic@yahoo.com',
      aiConfidence: 0.93,
      modelUsed: 'gemini-3.8-flash',
      createdAt: pastHours(16),
      updatedAt: pastHours(16)
    },
    {
      id: 'LKO-2026-1045',
      title: 'Drinking water pipeline leakage flooding lane in Indira Nagar Sector 14',
      description: 'Underground Jal Sansthan potable water pipeline has developed a leak under the pavement in Sector 14, Indira Nagar. Thousands of liters of clean drinking water are gushing out daily, weakening the foundation of adjacent compound walls and causing low water pressure in nearby houses.',
      location: 'Near House 14/220, Sector 14, Indira Nagar, Lucknow',
      category: 'Water & Drainage',
      department: 'Lucknow Jal Sansthan (Zone 7 / Indira Nagar Division)',
      priority: 'high',
      priorityReason: 'Massive loss of treated drinking water combined with structural risk to surrounding foundations and road subsidence.',
      summary: 'Underground potable pipe rupture causing continuous road waterlogging and residential pressure drops in Indira Nagar.',
      missingInformation: [
        'Is the water flowing continuously or only during scheduled municipal supply hours?',
        'Approximate pipeline diameter if known'
      ],
      recommendedSteps: [
        'Isolate the Sector 14 feeder sluice valve to stop ongoing wastage',
        'Excavate damaged joint and apply mechanical pipe clamp / sleeve repair',
        'Backfill and re-lay the road surface'
      ],
      complaintDraft: `To,
The General Manager / Executive Engineer,
Lucknow Jal Sansthan (Zone 7),
Indira Nagar, Lucknow, Uttar Pradesh.

Subject: Urgent Complaint Regarding Major Drinking Water Pipeline Rupture in Sector 14

Respected Officer,

I write to report a significant underground water supply line leak near House 14/220, Sector 14, Indira Nagar.

Large volumes of potable water are being wasted around the clock while localized water pressure has dropped sharply for 40+ households. Please dispatch a repair gang to isolate the valve and replace the damaged section at the earliest.

Warm regards,
Residents of Sector 14,
Indira Nagar, Lucknow`,
      imageData: '',
      status: 'Resolved',
      statusHistory: [
        {
          status: 'Reported',
          timestamp: pastHours(72),
          note: 'Emergency report logged',
          updatedBy: 'Citizen Portal'
        },
        {
          status: 'Under Review',
          timestamp: pastHours(68),
          note: 'Jal Sansthan junior engineer verified site',
          updatedBy: 'Jal Sansthan (Admin)'
        },
        {
          status: 'Action In Progress',
          timestamp: pastHours(40),
          note: 'Valve isolated; sleeve clamp installed on 4-inch CI pipeline',
          updatedBy: 'Field Repair Unit'
        },
        {
          status: 'Resolved',
          timestamp: pastHours(6),
          note: 'Leak completely arrested, normal supply pressure restored and road backfilled',
          updatedBy: 'Jal Sansthan Assistant Engineer (Admin)'
        }
      ],
      upvotes: 35,
      citizenContact: 'indiranagar.rwa@gmail.com',
      aiConfidence: 0.95,
      modelUsed: 'gemini-3.8-flash',
      createdAt: pastHours(72),
      updatedAt: pastHours(6)
    }
  ];

  for (const report of demoReports) {
    insertReport(db, report);
  }
}

export function insertReport(db: SqlJsDatabase, r: CivicReport): void {
  const stmt = db.prepare(`
    INSERT INTO reports (
      id, title, description, location, category, department,
      priority, priority_reason, summary, missing_information,
      recommended_steps, complaint_draft, image_data, status,
      status_history, upvotes, citizen_contact, ai_confidence,
      model_used, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?
    )
  `);

  stmt.run([
    r.id,
    r.title,
    r.description,
    r.location,
    r.category,
    r.department,
    r.priority,
    r.priorityReason,
    r.summary,
    JSON.stringify(r.missingInformation || []),
    JSON.stringify(r.recommendedSteps || []),
    r.complaintDraft,
    r.imageData || null,
    r.status,
    JSON.stringify(r.statusHistory || []),
    r.upvotes || 0,
    r.citizenContact || null,
    r.aiConfidence || 0.85,
    r.modelUsed,
    r.createdAt,
    r.updatedAt
  ]);
  stmt.free();

  saveDatabaseToFile(db);
}

export function getAllReports(
  db: SqlJsDatabase,
  filters?: {
    search?: string;
    category?: string;
    priority?: string;
    status?: string;
  }
): CivicReport[] {
  let query = 'SELECT * FROM reports WHERE 1=1';
  const params: any[] = [];

  if (filters?.status && filters.status !== 'all') {
    query += ' AND status = ?';
    params.push(filters.status);
  }

  if (filters?.priority && filters.priority !== 'all') {
    query += ' AND priority = ?';
    params.push(filters.priority);
  }

  if (filters?.category && filters.category !== 'all') {
    query += ' AND category = ?';
    params.push(filters.category);
  }

  if (filters?.search && filters.search.trim()) {
    query += ' AND (title LIKE ? OR description LIKE ? OR location LIKE ? OR id LIKE ?)';
    const term = `%${filters.search.trim()}%`;
    params.push(term, term, term, term);
  }

  query += ' ORDER BY created_at DESC';

  const stmt = db.prepare(query);
  if (params.length > 0) {
    stmt.bind(params);
  }

  const results: CivicReport[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject() as any;
    results.push(mapRowToReport(row));
  }
  stmt.free();

  return results;
}

export function getReportById(db: SqlJsDatabase, id: string): CivicReport | null {
  const stmt = db.prepare('SELECT * FROM reports WHERE id = ?');
  stmt.bind([id]);
  if (!stmt.step()) {
    stmt.free();
    return null;
  }
  const row = stmt.getAsObject() as any;
  stmt.free();
  return mapRowToReport(row);
}

export function updateReportStatus(
  db: SqlJsDatabase,
  id: string,
  newStatus: ReportStatus,
  note: string,
  updatedBy: string
): CivicReport | null {
  const report = getReportById(db, id);
  if (!report) return null;

  const now = new Date().toISOString();
  const history = [...report.statusHistory, {
    status: newStatus,
    timestamp: now,
    note: note || `Status updated to ${newStatus}`,
    updatedBy: updatedBy || 'Demonstration Admin'
  }];

  const stmt = db.prepare(`
    UPDATE reports 
    SET status = ?, status_history = ?, updated_at = ?
    WHERE id = ?
  `);
  stmt.run([newStatus, JSON.stringify(history), now, id]);
  stmt.free();

  saveDatabaseToFile(db);
  return getReportById(db, id);
}

export function incrementUpvote(db: SqlJsDatabase, id: string): number | null {
  const report = getReportById(db, id);
  if (!report) return null;

  const newUpvotes = (report.upvotes || 0) + 1;
  const stmt = db.prepare('UPDATE reports SET upvotes = ? WHERE id = ?');
  stmt.run([newUpvotes, id]);
  stmt.free();

  saveDatabaseToFile(db);
  return newUpvotes;
}

export function getReportStats(db: SqlJsDatabase): ReportStats {
  const reports = getAllReports(db);

  const byStatus: Record<ReportStatus, number> = {
    'Reported': 0,
    'Under Review': 0,
    'Action In Progress': 0,
    'Resolved': 0,
    'Dismissed': 0
  };

  const byPriority: Record<PriorityLevel, number> = {
    low: 0,
    medium: 0,
    high: 0
  };

  const byCategory: Record<string, number> = {};

  let recentResolved = 0;
  for (const r of reports) {
    if (byStatus[r.status] !== undefined) {
      byStatus[r.status]++;
    }
    if (byPriority[r.priority] !== undefined) {
      byPriority[r.priority]++;
    }
    byCategory[r.category] = (byCategory[r.category] || 0) + 1;
    if (r.status === 'Resolved') {
      recentResolved++;
    }
  }

  return {
    totalReports: reports.length,
    byStatus,
    byPriority,
    byCategory,
    recentResolvedCount: recentResolved
  };
}

function mapRowToReport(row: any): CivicReport {
  let missingInfo: string[] = [];
  let recSteps: string[] = [];
  let history: any[] = [];

  try {
    missingInfo = JSON.parse(row.missing_information || '[]');
  } catch {
    missingInfo = [];
  }

  try {
    recSteps = JSON.parse(row.recommended_steps || '[]');
  } catch {
    recSteps = [];
  }

  try {
    history = JSON.parse(row.status_history || '[]');
  } catch {
    history = [];
  }

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    location: row.location,
    category: row.category as IssueCategory,
    department: row.department,
    priority: row.priority as PriorityLevel,
    priorityReason: row.priority_reason,
    summary: row.summary,
    missingInformation: missingInfo,
    recommendedSteps: recSteps,
    complaintDraft: row.complaint_draft,
    imageData: row.image_data || undefined,
    status: row.status as ReportStatus,
    statusHistory: history,
    upvotes: Number(row.upvotes || 0),
    citizenContact: row.citizen_contact || undefined,
    aiConfidence: Number(row.ai_confidence || 0.85),
    modelUsed: row.model_used,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
