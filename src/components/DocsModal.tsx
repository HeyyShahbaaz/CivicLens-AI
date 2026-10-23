import React from 'react';
import { 
  X, 
  BookOpen, 
  Cpu, 
  Database, 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink,
  Code2,
  Terminal,
  FileCheck
} from 'lucide-react';

interface DocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocsModal: React.FC<DocsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                CivicLens AI Documentation & Architecture
              </h3>
              <p className="text-xs text-slate-500">
                Hacktoberfest Hack Day Lucknow — Option 1: Best Open-Source AI Project
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6 text-sm text-slate-700 leading-relaxed">
          
          {/* Section: Project Purpose & Hackathon Context */}
          <section className="space-y-2">
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              1. Project Purpose & Problem Statement
            </h4>
            <p>
              In rapidly expanding urban ecosystems like Lucknow, millions of civic issues (cratered potholes, overflowing garbage dumps, dark transit corridors, and burst potable water lines) go unaddressed or delayed because citizen complaints are unstructured, lack essential technical context (ward numbers, landmark coordinates, risk scale), and are routed to incorrect departments.
            </p>
            <p>
              <strong>CivicLens AI</strong> bridges this communication barrier by serving as an intelligent, transparent civic triage copilot. It classifies municipal jurisdiction, predicts urgency based on safety hazards, uncovers missing data gaps, and drafts formal, respectful grievance letters ready for local civic bodies (Lucknow Nagar Nigam, Jal Sansthan, LESA).
            </p>
          </section>

          {/* Section: AI Model & Inference Architecture */}
          <section className="space-y-3 p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-600" />
              2. AI Model Selection & Licensing Justification
            </h4>
            <div className="space-y-2 text-xs text-slate-600">
              <p>
                <strong>Primary Provider & Model:</strong> Google GenAI SDK with <code>gemini-3.8-flash</code> (Multimodal Vision + Structured JSON Schema).
              </p>
              <p>
                <strong>Open-Weight Compatibility:</strong> Supports Google Gemma 2 (<code>google/gemma-2-9b-it</code> under permissive Gemma Terms of Use) and Llama 3 via configurable hosted inference (OpenRouter / Hugging Face).
              </p>
              <p>
                <strong>Multimodal Vision:</strong> Inspects attached photographic evidence to directly assess pothole depth, water spread, and refuse volume without relying solely on citizen text.
              </p>
              <p>
                <strong>Zero Arbitrary Execution:</strong> The backend never executes model code or unsanitized instructions; all responses are parsed via strict schemas and validated before storage.
              </p>
              <p>
                <strong>Offline Heuristic Fallback:</strong> If the cloud inference provider experiences transient network errors, an intelligent local rule-based classifier handles triage seamlessly without crashing.
              </p>
            </div>
          </section>

          {/* Section: Technology Stack */}
          <section className="space-y-2">
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-600" />
              3. Technology Stack & Database
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <p className="font-bold text-slate-800">Frontend</p>
                <p className="text-slate-600 mt-1">React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Canvas Confetti.</p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <p className="font-bold text-slate-800">Backend & API</p>
                <p className="text-slate-600 mt-1">Node.js, Express, TypeScript, REST API, in-memory rate limiting, input validation.</p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <p className="font-bold text-slate-800">Database Layer</p>
                <p className="text-slate-600 mt-1">SQLite via <code>sql.js</code> WebAssembly with persistent file sync (<code>./data/civiclens.sqlite</code>), parameterized queries.</p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <p className="font-bold text-slate-800">Security & Privacy</p>
                <p className="text-slate-600 mt-1">Environment-only secrets, rate limits, no mock claims, human-in-the-loop overrides.</p>
              </div>
            </div>
          </section>

          {/* Section: REST Endpoints */}
          <section className="space-y-2">
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-emerald-600" />
              4. Core REST Endpoints
            </h4>
            <div className="space-y-1.5 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900 text-slate-200 flex items-center justify-between">
                <span>POST /api/reports/analyze</span>
                <span className="text-emerald-400">AI analysis & draft preview</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 text-slate-200 flex items-center justify-between">
                <span>POST /api/reports</span>
                <span className="text-cyan-400">Persist new report in SQLite</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 text-slate-200 flex items-center justify-between">
                <span>GET /api/reports?status=...</span>
                <span className="text-amber-400">Filter and search reports</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 text-slate-200 flex items-center justify-between">
                <span>PATCH /api/reports/:id/status</span>
                <span className="text-purple-400">Admin audit status update</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 text-slate-200 flex items-center justify-between">
                <span>GET /api/system/health</span>
                <span className="text-slate-400">Diagnostics & provider status</span>
              </div>
            </div>
          </section>

          {/* Section: Open Source & License */}
          <section className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
            <p className="font-bold text-sm">Open-Source License & Community Ethos</p>
            <p>
              CivicLens AI is released under the <strong>Apache License 2.0</strong>, allowing community civic tech contributors, non-profits, and municipal bodies across India to freely fork, audit, adapt, and self-host the application.
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs cursor-pointer hover:bg-slate-800"
          >
            Close Documentation
          </button>
        </div>

      </div>
    </div>
  );
};
