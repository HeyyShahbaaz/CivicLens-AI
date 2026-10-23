# CivicLens AI — AI-Powered Community Issue Reporting Platform

> **Hacktoberfest Hack Day Lucknow — Option 1: Best Open-Source AI Project**  
> *Transforming citizen reports into structured municipal work orders through multimodal open-weight AI triage.*

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-19.0-cyan)](https://react.dev/)
[![SQLite](https://img.shields.io/badge/Database-SQLite%20WASM-003B57)](https://sqlite.org/)
[![Gemini](https://img.shields.io/badge/AI-Gemini%203.8%20Flash%20%2F%20Gemma%202-emerald)](https://deepmind.google/technologies/gemini/)

---

## 1. Problem Statement

Across Indian cities like Lucknow, municipal corporations (Nagar Nigam, Jal Sansthan, LESA) receive thousands of unstructured grievances every week—from dangerous pothole craters on arterial transit corridors to burst potable water pipes, non-functional street lighting, and overflowing garbage dumps. 

However, existing civic grievance channels face major hurdles:
1. **Unstructured & Ambiguous Descriptions:** Citizens often write vague complaints (e.g. *"light not working here"*) without specifying exact ward landmarks, pole identifiers, or dimensions.
2. **Jurisdiction Confusion:** Citizens rarely know whether an issue falls under Public Works (PWD), Solid Waste Management, Jal Sansthan (water/sewerage), or the Electricity Administration (LESA).
3. **No Explainable Prioritization:** Urgent pedestrian safety hazards (such as live dangling wires or deep waterlogged craters) get buried behind low-urgency cosmetic requests.
4. **Bureaucratic Friction:** Composing a formal, polite grievance letter complying with the municipal Citizen's Charter is tedious for common residents.

---

## 2. Proposed Solution: CivicLens AI

**CivicLens AI** is an open-source civic copilot and issue reporting engine designed for Lucknow and other municipal bodies. 

Rather than functioning as a cosmetic chatbot, the AI model serves as the **core triage and perception engine**:
- **Multimodal Visual Analysis:** Inspects uploaded photographs to evaluate pothole depth, water spread, and refuse volume.
- **Automated Sector & Department Classification:** Automatically maps reports to the correct municipal wing (e.g. *Lucknow Nagar Nigam Zone 1 Public Works*, *Jal Sansthan Zone 7*).
- **Advisory Priority Prediction with Rationale:** Recommends `low`, `medium`, or `high` priority backed by explicit hazard logic (skidding risks, disease vector propagation, transit blockage).
- **Missing Information Identification:** Highlights missing details (e.g. nearest milestone, pole number) needed for municipal crews to act swiftly.
- **Automated Formal Grievance Drafting:** Instantly drafts an editable, polite formal letter addressed to the Municipal Commissioner, ready to print or email.
- **Human-in-the-Loop Agency:** Citizens retain full authority to override AI priority suggestions and edit draft letters before submitting.
- **Persistent SQLite Storage:** Persists all reports, status timelines, and community upvotes without relying on fragile mock storage.

---

## 3. Technology Stack

### Frontend
- **Framework:** React 19 (Functional components, React Hooks)
- **Language:** TypeScript 5.x
- **Build Tool:** Vite 8.x
- **Styling:** Tailwind CSS v4 with modern semantic color tokens
- **Icons:** Lucide React
- **Visual Feedback:** Canvas Confetti for successful submission delight

### Backend & API
- **Runtime:** Node.js 22.x
- **Framework:** Express 4.x
- **Language:** TypeScript (`tsx`)
- **API Style:** RESTful JSON endpoints
- **Security:** Request body limits (10MB for base64 images), in-memory sliding-window rate limiting (30 req / 5 min), parameterized queries to prevent SQL injection, and demonstration admin verification.

### Database
- **Engine:** SQLite via `sql.js` (WebAssembly SQLite)
- **Persistence:** Local file sync (`./data/civiclens.sqlite`)
- **Querying:** Strict parameterized prepared statements (`stmt.run([param1, param2])`)
- **Audit Trails:** JSON-encoded status history tracking every administrative action.

### AI Inference
- **SDK:** `@google/genai` (v2.4.0) with server-side proxy
- **Primary Model:** `gemini-3.8-flash` (Multimodal vision + native structured JSON schema)
- **Configurable Alternatives:** Open-weight Google Gemma 2 (`google/gemma-2-9b-it`) or Llama 3 via OpenRouter / Hugging Face Inference API
- **Fallback Engine:** Intelligent local rule-based civic classifier for guaranteed zero-crash resilience during offline testing.

---

## 4. Repository Structure

```
├── .env.example              # Configuration variables & placeholders
├── .gitignore                # Git ignore rules for node_modules, dist, sqlite
├── LICENSE                   # Apache License 2.0
├── README.md                 # Complete project documentation
├── index.html                # HTML entry point with synchronized metadata
├── metadata.json             # AI Studio configuration & capabilities
├── package.json              # Dependencies, devDependencies, and test scripts
├── server.ts                 # Express server mounting API & Vite middlewares
├── tsconfig.json             # TypeScript compiler settings
│
├── backend/
│   ├── ai/
│   │   └── service.ts        # AI multimodal analysis, structured schema & fallback
│   ├── db/
│   │   └── database.ts       # SQLite WebAssembly persistence & seed data
│   ├── middleware/
│   │   └── validation.ts     # Input validation, rate limiting & demo admin check
│   ├── routes/
│   │   └── reports.ts        # REST API endpoints (/api/reports, /api/system/health)
│   ├── tests/
│   │   └── run_tests.ts      # Automated unit test suite (25 assertions)
│   └── types.ts              # Core backend TypeScript types
│
├── docs/
│   ├── ARCHITECTURE.md       # Technical architecture & database schema
│   ├── AI_MODEL_JUSTIFICATION.md # Model selection, licensing & safety
│   └── HACKATHON_DEMO_GUIDE.md   # 3-minute hackathon demonstration script
│
├── frontend/
│   └── README.md             # Guide to frontend components and styles
│
└── src/
    ├── App.tsx               # Root app coordinator
    ├── index.css             # Tailwind v4 setup & typography
    ├── main.tsx              # DOM hydration entry point
    ├── types.ts              # Frontend TypeScript definitions
    ├── components/
    │   ├── AdminPanel.tsx    # Municipal admin review dashboard
    │   ├── DocsModal.tsx     # In-app architecture documentation modal
    │   ├── Hero.tsx          # Landing hero with live stats
    │   ├── Navbar.tsx        # Responsive navigation with system health badge
    │   ├── ReportCard.tsx    # Public feed report card with upvotes
    │   ├── ReportDetailsModal.tsx # Full report view with timeline audit trail
    │   ├── ReportForm.tsx    # 3-step AI reporting wizard with 1-click test photos
    │   └── StatsOverview.tsx # Interactive statistics breakdown
    ├── services/
    │   └── api.ts            # Client-side API fetch client
    └── utils/
        └── sampleImages.ts   # 1-click SVG test photos (pothole, waste, lights)
```

---

## 5. AI Model Selection & Licensing

### Model: Gemini 3.8 Flash (`gemini-3.8-flash`) & Gemma 2 (`google/gemma-2-9b-it`)
1. **Multimodal Vision:** Truly accepts images and analyzes ground-truth road fissures, garbage accumulation, or lighting poles.
2. **Schema Enforcement:** Employs `responseSchema` with strict `Type.OBJECT` properties, preventing hallucinations or invalid markdown blocks.
3. **Open-Weight Support:** The architecture is fully compatible with open-weight models (e.g. Gemma 2 9B Instruct, licensed under the open Gemma Terms of Use) via hosted providers (OpenRouter / Hugging Face).
4. **Advisory Framing:** Priorities are explicitly marked as *recommendations*, never legal decrees, preserving human accountability.
5. **Zero Remote Execution:** The backend strictly parses JSON keys and never evaluates arbitrary code from LLM responses.

---

## 6. Installation & Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or bun

### Step 1: Clone Repository & Install Dependencies
```bash
git clone https://github.com/your-username/civiclens-ai.git
cd civiclens-ai
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` if desired:
```env
# Gemini API Key (automatically injected in AI Studio)
GEMINI_API_KEY="your-gemini-api-key"

# AI Model Provider: 'gemini' (default), 'openrouter', or 'huggingface'
LLM_PROVIDER="gemini"
LLM_MODEL="gemini-3.8-flash"

# Optional Alternative Keys
OPENROUTER_API_KEY=""
HUGGINGFACE_API_KEY=""

# SQLite Persistent Database Path
DATABASE_FILE="./data/civiclens.sqlite"

# Demonstration Admin Passcode
ADMIN_DEMO_PIN="1234"
```

### Step 3: Run the Development Server
```bash
npm run dev
```
The server will start on `http://localhost:3000` with both the Express REST API and Vite frontend running simultaneously.

### Step 4: Run the Test Suite
```bash
npm test
```
Executes all 25 automated unit tests verifying input validation, SQLite database persistence, parameterized query security, AI response validation, and offline fallback handling.

---

## 7. REST API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/system/health` | System diagnostics & model status | Public |
| `GET` | `/api/reports/stats` | Aggregated metrics & category breakdown | Public |
| `GET` | `/api/reports` | List reports with search & status filters | Public |
| `GET` | `/api/reports/:id` | Fetch detailed report by ID | Public |
| `POST` | `/api/reports/analyze`| Run AI analysis and preview draft | Rate-Limited |
| `POST` | `/api/reports` | Persist new report in SQLite | Public |
| `PATCH` | `/api/reports/:id/status`| Update report status with audit note | Demo Admin PIN (`1234`) |
| `POST` | `/api/reports/:id/upvote`| Community solidarity upvote | Public |

---

## 8. Demonstration Instructions for Hackathon Judges

1. **Launch App:** Visit the application root. Notice the live diagnostic badge in the navbar confirming SQLite persistence and model inference.
2. **Test 1-Click Multimodal Analysis:**
   - Click **"Report Issue"**.
   - Under photo evidence, click any 1-click sample button (e.g. **"Pothole Road Damage"** or **"Overflowing Waste Bin"**).
   - Click **"Analyze with AI Triage"**.
   - Observe how the AI visually assesses the hazard, predicts priority, maps the responsible municipal ward department, flags missing information, and produces an editable formal grievance draft.
3. **Submit Report:** Click **"Confirm & Save Report"** to trigger celebratory confetti and generate a unique tracking ID (`LKO-2026-XXXX`).
4. **Explore Public Feed:** Filter by category, test the search bar, or click the **Upvote** button to show community solidarity.
5. **Test Admin Review:** Click **"Admin Demo"**, click **"One-Click Unlock (1234)"**, and update any report status (e.g. to `Action In Progress` or `Resolved`) with a custom audit note.
6. **Verify Automated Tests:** Run `npm test` in the terminal to inspect all 25 test passes.

---

## 9. Security & Privacy Considerations

- **Secrets Isolation:** API keys exist strictly on the backend and are never bundled into client code.
- **SQL Injection Prevention:** All SQLite queries use parameterized prepared statements (`stmt.run([param1, param2])`).
- **File Upload Protection:** Strict MIME type validation (JPEG/PNG/WebP only) and a 6MB size ceiling.
- **Rate Limiting:** In-memory sliding-window rate limiting on AI analysis endpoints protects against denial-of-service or quota exhaustion.
- **Truthful Civic Claims:** The system explicitly reminds users that reports are stored locally in the community register and does not falsely claim direct API linkage with government departments where one does not yet exist.

---

## 10. Known Limitations & Future Improvements

### Current Limitations
- Demo admin authentication uses a shared PIN (`1234`) rather than production OpenID Connect / SAML SSO.
- SQLite is stored on the server's local filesystem (`./data/civiclens.sqlite`), which is ideal for single-instance hackathon demos; multi-region production scale would benefit from Cloud SQL PostgreSQL.

### Future Roadmap
1. **WhatsApp & SMS Gateway Integration:** Allow citizens in Lucknow without smartphones to report issues via WhatsApp voice notes transcribed and analyzed by Gemini.
2. **Official Smart City ICCC Integration:** Connect to the Lucknow Smart City Integrated Command and Control Centre (ICCC) API for direct municipal work order creation.
3. **Automated Satellite & Street-View Correlation:** Cross-reference citizen photos with GIS spatial data to identify recurring road degradation patterns.

---

## 11. Contribution Guidelines

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/NewCivicFeature`).
3. Commit your changes (`git commit -m 'Add new civic feature'`).
4. Push to the branch (`git push origin feature/NewCivicFeature`).
5. Open a Pull Request targeting `main`.

---

## 12. License

CivicLens AI is released under the **[Apache License 2.0](LICENSE)**.  
Copyright © 2026 CivicLens AI Open Source Contributors. Built with pride for **Hacktoberfest Hack Day Lucknow**.
