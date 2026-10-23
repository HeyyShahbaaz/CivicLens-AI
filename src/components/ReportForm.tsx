import React, { useState } from 'react';
import { 
  Sparkles, 
  Upload, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  FileText, 
  ArrowRight, 
  RotateCcw, 
  Copy, 
  Check, 
  Info, 
  Layers, 
  ShieldCheck,
  ChevronDown,
  Camera,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { analyzeCivicIssue, submitReport } from '../services/api';
import { AIAnalysisResult, CivicReport, IssueCategory, PriorityLevel } from '../types';
import { SAMPLE_IMAGES } from '../utils/sampleImages';

interface ReportFormProps {
  onReportCreated: (report: CivicReport) => void;
  onCancel: () => void;
}

const QUICK_LOCALITIES = [
  'Central Sector',
  'North Zone',
  'East Market',
  'Station Road',
  'Civic Area 1',
];

const QUICK_TITLES = [
  'Deep pothole cluster causing vehicle skids',
  'Overflowing community garbage dump and stench',
  'Multiple broken street lights creating dark zone',
  'Drinking water pipeline leakage flooding road',
  'Dangerous open drainage manhole without cover'
];

export const ReportForm: React.FC<ReportFormProps> = ({ onReportCreated, onCancel }) => {
  // Steps: 'input' | 'analyzing' | 'review' | 'success'
  const [step, setStep] = useState<'input' | 'analyzing' | 'review' | 'success'>('input');

  // Input states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [imageData, setImageData] = useState<string | undefined>(undefined);
  const [citizenContact, setCitizenContact] = useState('');

  // AI & Review states
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [editedDraft, setEditedDraft] = useState('');
  const [customCategory, setCustomCategory] = useState<IssueCategory>('Other');
  const [customPriority, setCustomPriority] = useState<PriorityLevel>('medium');
  const [createdReport, setCreatedReport] = useState<CivicReport | null>(null);

  // UI helpers
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // File upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 6 * 1024 * 1024) {
      setError('Selected image exceeds 6MB size limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageData(reader.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  // Location Geolocation helper
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(`GPS Location (Lat: ${pos.coords.latitude.toFixed(4)}, Long: ${pos.coords.longitude.toFixed(4)})`);
      },
      () => {
        setLocation('Default Location (GPS access denied, locality selected)');
      }
    );
  };

  // Execute AI Analysis
  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (title.trim().length < 3) {
      setError('Please provide a title with at least 3 characters.');
      return;
    }
    if (description.trim().length < 10) {
      setError('Please describe the problem in at least 10 characters.');
      return;
    }
    if (location.trim().length < 2) {
      setError('Please provide or select a location.');
      return;
    }

    setStep('analyzing');

    try {
      const result = await analyzeCivicIssue({
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        imageData
      });

      setAiAnalysis(result);
      setEditedDraft(result.complaintDraft);
      setCustomCategory(result.category);
      setCustomPriority(result.priority);
      setStep('review');
    } catch (err: any) {
      setError(err.message || 'Failed to complete AI analysis. Please verify your input and try again.');
      setStep('input');
    }
  };

  // Final submission to SQLite
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const report = await submitReport({
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        imageData,
        citizenContact: citizenContact.trim() || undefined,
        editedDraft: editedDraft.trim(),
        customCategory,
        customPriority,
        precomputedAnalysis: aiAnalysis || undefined
      });

      setCreatedReport(report);
      setStep('success');

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}

      onReportCreated(report);
    } catch (err: any) {
      setError(err.message || 'Failed to persist report into database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, type: 'draft' | 'id') => {
    navigator.clipboard.writeText(text);
    if (type === 'draft') {
      setCopiedDraft(true);
      setTimeout(() => setCopiedDraft(false), 2000);
    } else {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      
      {/* Step Indicator Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            Interactive AI Reporting Flow
          </span>
          <span className="text-xs font-semibold text-slate-500">
            Step {step === 'input' ? '1 of 3' : step === 'analyzing' ? '2 of 3 (Analyzing)' : step === 'review' ? '2 of 3' : '3 of 3'}
          </span>
        </div>

        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-emerald-600 h-full transition-all duration-500 ease-out"
            style={{
              width: step === 'input' ? '33%' : step === 'analyzing' ? '60%' : step === 'review' ? '75%' : '100%'
            }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Attention Required</p>
            <p className="mt-0.5">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 1: INPUT DETAILS */}
      {step === 'input' && (
        <form onSubmit={handleRunAnalysis} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Report a Local Civic Problem</h2>
            <p className="text-sm text-slate-600 mt-1">
              Provide the details below. Our AI will automatically categorize, assign priority, flag missing details, and draft an official municipal complaint.
            </p>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="issue-title" className="block text-sm font-semibold text-slate-800 mb-1.5">
              Issue Title <span className="text-red-500">*</span>
            </label>
            <input
              id="issue-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deep pothole cluster near Metro station gate"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900 text-sm"
              required
            />

            {/* Quick Title Suggestions */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-slate-400 font-medium">Quick samples:</span>
              {QUICK_TITLES.map((t, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setTitle(t)}
                  className="text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200 transition-colors"
                >
                  {t.slice(0, 32)}...
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="issue-desc" className="block text-sm font-semibold text-slate-800">
                Problem Description <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-slate-400">
                {description.length} / 5000 chars (min 10)
              </span>
            </div>
            <textarea
              id="issue-desc"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what is broken, how long it has persisted, and the risk to commuters or pedestrians..."
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900 text-sm leading-relaxed"
              required
            />
          </div>

          {/* Location */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="issue-loc" className="block text-sm font-semibold text-slate-800">
                Location & Ward <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleDetectLocation}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Use Current Location</span>
              </button>
            </div>
            
            <input
              id="issue-loc"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Near Main Street, Central Market"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900 text-sm"
              required
            />

            {/* Locality Quick Select */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="text-xs text-slate-400 font-medium">Quick Presets:</span>
              {QUICK_LOCALITIES.map((loc, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setLocation(loc)}
                  className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 transition-colors"
                >
                  {loc.split(',')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Image Upload + 1-Click Samples */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Photo Evidence <span className="text-xs font-normal text-slate-500">(Optional, enables AI Multimodal Vision Analysis)</span>
            </label>

            {!imageData ? (
              <div className="space-y-3">
                <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center transition-colors bg-slate-50/50">
                  <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100/70 text-emerald-700 flex items-center justify-center mb-3">
                    <Camera className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">
                    Upload a photograph from your device
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports JPEG, PNG, WebP (Max 6MB)
                  </p>
                  
                  <label className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 shadow-2xs text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer">
                    <Upload className="w-4 h-4 text-emerald-600" />
                    <span>Choose File</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/svg+xml"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* 1-Click Demonstration Samples */}
                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
                  <p className="text-xs font-bold text-emerald-900 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Hackathon Quick-Test: 1-Click Multimodal Photo Samples</span>
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SAMPLE_IMAGES.map((sample) => (
                      <button
                        type="button"
                        key={sample.id}
                        onClick={() => {
                          setImageData(sample.dataUrl);
                          if (!title) setTitle(sample.label);
                          if (!description) setDescription(sample.description);
                          if (!location) setLocation('Sample Incident Ward');
                        }}
                        className="p-2 rounded-lg bg-white border border-emerald-200 hover:border-emerald-500 hover:shadow-xs text-left transition-all group"
                      >
                        <span className="block text-xs font-semibold text-slate-800 group-hover:text-emerald-700 truncate">
                          {sample.label}
                        </span>
                        <span className="block text-[10px] text-slate-500 mt-0.5 truncate">
                          {sample.category}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-slate-300 bg-slate-900 max-w-sm">
                <img 
                  src={imageData} 
                  alt="Evidence preview" 
                  className="w-full h-48 object-cover opacity-90"
                />
                <button
                  type="button"
                  onClick={() => setImageData(undefined)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-red-600 transition-colors"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Multimodal Evidence Attached</span>
                </div>
              </div>
            )}
          </div>

          {/* Citizen Contact */}
          <div>
            <label htmlFor="citizen-contact" className="block text-sm font-semibold text-slate-800 mb-1">
              Contact Email / Phone <span className="text-xs font-normal text-slate-500">(Optional, for municipal status alerts)</span>
            </label>
            <input
              id="citizen-contact"
              type="text"
              value={citizenContact}
              onChange={(e) => setCitizenContact(e.target.value)}
              placeholder="e.g. resident@example.com"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900 text-sm"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-sm shadow-md shadow-emerald-600/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>Analyze with AI Triage</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: ANALYZING ANIMATION */}
      {step === 'analyzing' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center space-y-6">
          <div className="relative w-20 h-20 mx-auto">
            <div className="w-20 h-20 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-emerald-600">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">CivicLens AI is Analyzing Your Report</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
              Evaluating municipal jurisdiction, safety hazard priority, identifying information gaps, 
              and composing a formal complaint letter...
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Hosted Inference API / Structured JSON Parser</span>
          </div>
        </div>
      )}

      {/* STEP 2: REVIEW AI ASSESSMENT & CUSTOMIZE */}
      {step === 'review' && aiAnalysis && (
        <div className="space-y-6">
          
          {/* Safety Warning if present */}
          {aiAnalysis.safetyWarning && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-300 text-red-900 flex items-start gap-3 shadow-xs">
              <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm uppercase tracking-wider text-red-800">
                  Critical Hazard Alert
                </p>
                <p className="text-sm mt-0.5">{aiAnalysis.safetyWarning}</p>
              </div>
            </div>
          )}

          {/* AI Analysis Result Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    AI Triage Assessment
                  </span>
                  <span className="text-xs text-slate-400">
                    Model: {aiAnalysis.modelUsed}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  {title}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{location}</span>
                </p>
              </div>

              {/* Priority & Confidence Box */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Recommended Priority
                  </p>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mt-0.5 ${
                    customPriority === 'high'
                      ? 'bg-red-100 text-red-800 border border-red-300'
                      : customPriority === 'medium'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      customPriority === 'high' ? 'bg-red-600 animate-pulse' : customPriority === 'medium' ? 'bg-amber-600' : 'bg-emerald-600'
                    }`} />
                    {customPriority} Priority
                  </span>
                </div>

                <div className="text-right pl-3 border-l border-slate-200">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Confidence
                  </p>
                  <p className="text-base font-extrabold text-slate-900">
                    {Math.round((aiAnalysis.confidenceScore || 0.85) * 100)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Department & Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Responsible Municipal Department
                </p>
                <p className="text-sm font-semibold text-slate-900 mt-1">
                  {aiAnalysis.department}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Assigned Category
                </p>
                <p className="text-sm font-semibold text-slate-900 mt-1">
                  {customCategory}
                </p>
              </div>
            </div>

            {/* AI Summary & Priority Rationale */}
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Executive Summary
                </p>
                <p className="text-sm text-slate-800 mt-1 leading-relaxed">
                  {aiAnalysis.summary}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Why this priority was suggested
                </p>
                <p className="text-sm text-slate-700 mt-1 leading-relaxed bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                  {aiAnalysis.priorityReason}
                </p>
              </div>
            </div>

            {/* Missing Information Checklist */}
            {aiAnalysis.missingInformation && aiAnalysis.missingInformation.length > 0 && (
              <div className="p-4 rounded-xl bg-sky-50 border border-sky-200">
                <p className="text-xs font-bold text-sky-900 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Info className="w-4 h-4 text-sky-600" />
                  <span>Missing Information for Swifter Municipal Action</span>
                </p>
                <ul className="space-y-1.5 text-xs text-sky-800">
                  {aiAnalysis.missingInformation.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-sky-600 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommended Next Steps */}
            {aiAnalysis.recommendedSteps && aiAnalysis.recommendedSteps.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Recommended Actionable Next Steps
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {aiAnalysis.recommendedSteps.map((stepItem, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2 text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{stepItem}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Human in the loop overrides */}
            <div className="pt-4 border-t border-slate-200">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Human-in-the-Loop Adjustments
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="custom-priority" className="block text-xs font-medium text-slate-600 mb-1">
                    Override Priority (if AI underestimated/overestimated):
                  </label>
                  <select
                    id="custom-priority"
                    value={customPriority}
                    onChange={(e) => setCustomPriority(e.target.value as PriorityLevel)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="custom-category" className="block text-xs font-medium text-slate-600 mb-1">
                    Override Category:
                  </label>
                  <select
                    id="custom-category"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as IssueCategory)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white"
                  >
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
              </div>
            </div>

            {/* Editable Formal Complaint Letter Draft */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Generated Formal Complaint Letter
                  </p>
                  <p className="text-xs text-slate-500">
                    You can edit and customize this draft directly before registering.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(editedDraft, 'draft')}
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-semibold px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 cursor-pointer"
                >
                  {copiedDraft ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Draft</span>
                    </>
                  )}
                </button>
              </div>

              <label htmlFor="complaint-draft-editor" className="sr-only">Edit Formal Complaint Draft</label>
              <textarea
                id="complaint-draft-editor"
                rows={9}
                value={editedDraft}
                onChange={(e) => setEditedDraft(e.target.value)}
                className="w-full p-4 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs sm:text-sm font-mono leading-relaxed text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Disclaimer */}
            <p className="text-[11px] text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-200">
              Notice: AI-generated category, priority, and complaint text are recommendations to assist rapid community reporting. Reports are stored in the local SQLite database for municipal review.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setStep('input')}
                className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Back to Edit Input</span>
              </button>

              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-sm shadow-md shadow-emerald-600/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Saving to SQLite...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Save Report</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* STEP 3: SUBMISSION SUCCESS */}
      {step === 'success' && createdReport && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h3 className="text-2xl font-bold text-slate-900">Report Successfully Logged</h3>
            <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
              Your civic report has been persisted in SQLite and assigned an official tracking identifier.
            </p>
          </div>

          {/* Reference ID Card */}
          <div className="inline-flex items-center gap-3 p-3.5 px-6 rounded-xl bg-slate-900 text-white font-mono text-base font-bold shadow-md">
            <span>Tracking ID: {createdReport.id}</span>
            <button
              onClick={() => copyToClipboard(createdReport.id, 'id')}
              className="p-1 rounded hover:bg-slate-800 text-emerald-400"
              title="Copy ID"
            >
              {copiedId ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Actions */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                setStep('input');
                setTitle('');
                setDescription('');
                setLocation('');
                setImageData(undefined);
                setCitizenContact('');
                setAiAnalysis(null);
                setCreatedReport(null);
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold transition-colors"
            >
              Report Another Issue
            </button>

            <button
              onClick={() => copyToClipboard(createdReport.complaintDraft, 'draft')}
              className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-sm font-semibold transition-colors flex items-center gap-2"
            >
              <Copy className="w-4 h-4 text-emerald-600" />
              <span>Copy Complaint Letter</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
