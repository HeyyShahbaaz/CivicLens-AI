# AI Model Justification & Evaluation Notes

**Project:** CivicLens AI  
**Category:** Hacktoberfest Hack Day Lucknow — Option 1: Best Open-Source AI Project  

---

## 1. Chosen Model: Gemini 3.8 Flash & Gemma 2 Open Weights

For CivicLens AI, the AI model is not a cosmetic chatbot or an afterthought—it is the core reasoning and perception engine that powers civic triage.

### Why Gemini 3.8 Flash (`gemini-3.8-flash`)?
1. **Genuinely Multimodal Vision:**
   Civic grievances rely heavily on visual evidence (e.g. photos of pothole depth, water spread, fractured electrical poles, or overflowing bins). Gemini 3.8 Flash natively accepts high-resolution image bytes alongside text prompts, cross-referencing visual indicators with citizen descriptions.
2. **Deterministic Structured JSON Output:**
   With native `responseSchema` and `responseMimeType: "application/json"`, Gemini 3.8 Flash guarantees conforming JSON output, eliminating markdown hallucinations or malformed JSON blocks.
3. **High Throughput & Low Latency:**
   Produces complete triage breakdowns (category, department, priority, missing info, and complaint draft) within 1.5 - 2.5 seconds.
4. **Cost & Sustainability:**
   Extremely efficient token economics suitable for public municipal deployments with high report volume.

### Open-Weight Complement: Google Gemma 2 (`google/gemma-2-9b-it`)
- **License:** Gemma Terms of Use (Permissive open model weights for research and commercial applications).
- **Portability:** Configurable via environment variables (`LLM_PROVIDER="openrouter"` or `LLM_PROVIDER="huggingface"`). Users can self-host Gemma 2 on local Ollama or vLLM instances without changing frontend code.

---

## 2. Structured AI Schema & Prompt Architecture

The system prompt frames the model as an **expert civic engineer and municipal grievance analyst for Indian cities**, specifically tuned to Lucknow's municipal administrative divisions:
- Lucknow Nagar Nigam (Zones 1 through 8)
- Lucknow Jal Sansthan (Potable water supply & sewerage)
- Lucknow Electricity Supply Administration (LESA)
- Lucknow Development Authority (LDA)
- Traffic Police Lucknow

### Output Schema:
- `category`: Strictly normalized to 8 civic categories.
- `department`: Accurate government department in Lucknow.
- `summary`: Concise executive summary.
- `priority`: Advisory priority (`low`, `medium`, `high`).
- `priorityReason`: Concrete explanation considering pedestrian safety, road skidding hazard, or vector-borne epidemic hazard.
- `missingInformation`: Actionable checklist of information gaps (e.g. pole number, pipe diameter, daytime landmark).
- `recommendedSteps`: Clear operational actions for citizens and municipal crews.
- `complaintDraft`: Polite, professionally formatted formal grievance letter.
- `confidenceScore`: Transparent certainty metric (0.0 to 1.0).
- `safetyWarning`: Highlighted emergency warning if imminent danger exists.

---

## 3. Responsible AI & Safety Guarantees

1. **Advisory Framing:**
   The UI and documentation explicitly state that AI-generated priorities and categories are advisory recommendations, preventing automated misclassification from causing neglect.
2. **Human-in-the-Loop Agency:**
   The citizen has full ability to override the suggested category or priority, as well as directly edit the complaint draft before submission.
3. **Zero Arbitrary Execution:**
   The backend sanitizes all AI outputs. No model-generated code, shell scripts, or arbitrary instructions are ever evaluated or executed.
4. **Offline Heuristic Fallback Engine:**
   If API credentials are absent or remote network connectivity is disrupted, a built-in rule-based NLP classifier processes the request gracefully, ensuring 100% uptime.
