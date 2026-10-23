# CivicLens AI — System Architecture & Design

**Hacktoberfest Hack Day Lucknow — Option 1: Best Open-Source AI Project**

## 1. High-Level Architecture

CivicLens AI is built as a production-grade full-stack civic copilot. The architecture cleanly decouples the React client, Express REST API, SQLite WebAssembly persistent database, and hosted AI inference pipeline.

```
┌─────────────────────────────────────────────────────────────┐
│                    Citizen / Admin Browser                  │
│   (React 19, TypeScript, Tailwind CSS v4, Lucide Icons)     │
└───────────────▲─────────────────────────────┬───────────────┘
                │ HTTP / REST                 │ JSON Payloads
                │ Responses                   │ + Base64 Evidence
┌───────────────┴─────────────────────────────▼───────────────┐
│                    Express Backend Server                   │
│   - In-memory Sliding Window Rate Limiter (30 req / 5 min)  │
│   - Payload Validation & Sanitization Middleware             │
│   - Parameterized SQL Query Engine                          │
│   - Demonstration Admin Audit Guard                         │
└───────────────▲─────────────────────────────┬───────────────┘
                │                             │
    ┌───────────┴──────────┐       ┌──────────▼────────────┐
    │  SQLite Persistence  │       │  Hosted AI Inference  │
    │  - sql.js WebAssembly│       │  - Google GenAI SDK   │
    │  - Parameterized DML │       │    (Gemini 3.8 Flash) │
    │  - Auto-sync to disk │       │  - Open-Weight Gemma2 │
    │    (./data/*.sqlite) │       │    (OpenRouter / HF)  │
    └──────────────────────┘       │  - Multimodal Vision  │
                                   │  - Structured JSON    │
                                   │  - Heuristic Fallback │
                                   └───────────────────────┘
```

## 2. Component Breakdown

### Frontend (`/src`)
- **`App.tsx`**: Central state coordinator for navigation tabs (`home`, `report`, `explore`, `admin`), query filtering, and modal dialogs.
- **`Navbar.tsx`**: Responsive header with Lucknow Edition branding, real-time system health diagnostics, and quick report button.
- **`Hero.tsx`**: Landing showcase highlighting open-source ethos, core pillars, and live metrics.
- **`ReportForm.tsx`**: Interactive 3-step reporting wizard with 1-click test photos, real-time AI triage breakdown, editable complaint draft, and human-in-the-loop override controls.
- **`ReportCard.tsx`**: Modular card for public feed with priority indicators, municipal department, and community upvote button.
- **`ReportDetailsModal.tsx`**: Deep inspect view with complete audit trail, AI rationale, missing info checklist, and print/copy grievance tools.
- **`AdminPanel.tsx`**: Municipal official review panel with status update workflow and audit trail.
- **`StatsOverview.tsx`**: Interactive statistics bar with dynamic category filtering.
- **`sampleImages.ts`**: High-quality SVG sample assets for potholes, waste dumps, street light outages, and water pipe ruptures.

### Backend (`/backend`)
- **`server.ts`**: Main entry point running Express on port 3000, mounting Vite middleware in dev and serving static in prod.
- **`routes/reports.ts`**: RESTful API endpoints for creating, analyzing, listing, updating, and upvoting reports.
- **`db/database.ts`**: SQLite database layer powered by `sql.js`, parameterized queries, and seed data for Lucknow.
- **`ai/service.ts`**: Multimodal AI analysis service supporting Gemini 3.8 Flash, Gemma 2, and graceful heuristic fallback.
- **`middleware/validation.ts`**: Request payload validation, image size limits, rate limiting, and demo admin authentication.
- **`tests/run_tests.ts`**: Automated 25-assertion test suite.

## 3. Data Schema (SQLite)

| Column | Type | Description |
|---|---|---|
| `id` | TEXT PRIMARY KEY | Unique reference code (e.g. `LKO-2026-1042`) |
| `title` | TEXT NOT NULL | Short issue title (min 3 chars) |
| `description` | TEXT NOT NULL | Detailed problem description |
| `location` | TEXT NOT NULL | Locality, landmark, or GPS coordinates |
| `category` | TEXT NOT NULL | Categorized municipal sector |
| `department` | TEXT NOT NULL | Target municipal department (e.g. Nagar Nigam Zone 1) |
| `priority` | TEXT NOT NULL | Advisory priority (`low`, `medium`, `high`) |
| `priority_reason`| TEXT NOT NULL | Justification for priority assignment |
| `summary` | TEXT NOT NULL | 1-2 sentence executive summary |
| `missing_information` | TEXT NOT NULL | JSON string array of missing details |
| `recommended_steps` | TEXT NOT NULL | JSON string array of recommended actions |
| `complaint_draft` | TEXT NOT NULL | Formatted formal complaint letter |
| `image_data` | TEXT | Optional Base64 data URL of evidence |
| `status` | TEXT NOT NULL | `Reported`, `Under Review`, `Action In Progress`, `Resolved`, `Dismissed` |
| `status_history` | TEXT NOT NULL | JSON array of `{ status, timestamp, note, updatedBy }` |
| `upvotes` | INTEGER NOT NULL | Community endorsement count |
| `citizen_contact`| TEXT | Optional citizen email or phone |
| `ai_confidence` | REAL NOT NULL | Model confidence score (0.0 to 1.0) |
| `model_used` | TEXT NOT NULL | Inference model identifier |
| `created_at` | TEXT NOT NULL | ISO 8601 creation timestamp |
| `updated_at` | TEXT NOT NULL | ISO 8601 update timestamp |
