import { GoogleGenAI, Type } from '@google/genai';
import { AIAnalysisResult, IssueCategory, PriorityLevel } from '../types.js';

const VALID_CATEGORIES: IssueCategory[] = [
  'Roads & Potholes',
  'Sanitation & Waste',
  'Street Lighting',
  'Water & Drainage',
  'Encroachment & Traffic',
  'Public Health & Safety',
  'Parks & Greenery',
  'Other'
];

const VALID_PRIORITIES: PriorityLevel[] = ['low', 'medium', 'high'];

interface AnalyzeOptions {
  title: string;
  description: string;
  location: string;
  imageData?: string; // Data URL or base64
}

/**
 * Validates and sanitizes raw AI output before passing downstream.
 * Never executes model code.
 */
function sanitizeAndValidateAIResponse(raw: any, modelName: string): AIAnalysisResult {
  let category: IssueCategory = 'Other';
  if (raw && typeof raw.category === 'string') {
    const matched = VALID_CATEGORIES.find(
      c => c.toLowerCase() === raw.category.toLowerCase() ||
           raw.category.toLowerCase().includes(c.toLowerCase().split(' ')[0])
    );
    if (matched) category = matched;
  }

  let priority: PriorityLevel = 'medium';
  if (raw && typeof raw.priority === 'string') {
    const p = raw.priority.toLowerCase().trim();
    if (VALID_PRIORITIES.includes(p as PriorityLevel)) {
      priority = p as PriorityLevel;
    }
  }

  const department = typeof raw?.department === 'string' && raw.department.trim()
    ? raw.department.trim()
    : 'Lucknow Nagar Nigam / Relevant Municipal Authority';

  const summary = typeof raw?.summary === 'string' && raw.summary.trim()
    ? raw.summary.trim()
    : 'Citizen report requiring municipal inspection.';

  const priorityReason = typeof raw?.priorityReason === 'string' && raw.priorityReason.trim()
    ? raw.priorityReason.trim()
    : 'Assessed based on immediate impact on citizen safety, sanitation, and transit accessibility.';

  let missingInformation: string[] = [];
  if (Array.isArray(raw?.missingInformation)) {
    missingInformation = raw.missingInformation
      .filter((item: any) => typeof item === 'string' && item.trim().length > 0)
      .map((item: string) => item.trim());
  }

  let recommendedSteps: string[] = [];
  if (Array.isArray(raw?.recommendedSteps)) {
    recommendedSteps = raw.recommendedSteps
      .filter((item: any) => typeof item === 'string' && item.trim().length > 0)
      .map((item: string) => item.trim());
  }

  const complaintDraft = typeof raw?.complaintDraft === 'string' && raw.complaintDraft.trim()
    ? raw.complaintDraft.trim()
    : generateBasicComplaintDraft(raw?.title || 'Civic Issue', raw?.description || '', raw?.location || 'Lucknow', category);

  let confidenceScore = typeof raw?.confidenceScore === 'number'
    ? Math.max(0.1, Math.min(1.0, raw.confidenceScore))
    : 0.85;

  // If description is very short or vague, reduce confidence
  if (raw?.description && raw.description.length < 30) {
    confidenceScore = Math.min(confidenceScore, 0.6);
    if (missingInformation.length === 0) {
      missingInformation.push('More specific details regarding exact location landmark, dimensions, and hazard severity');
    }
  }

  return {
    category,
    department,
    summary,
    priority,
    priorityReason,
    missingInformation,
    recommendedSteps,
    complaintDraft,
    confidenceScore,
    safetyWarning: typeof raw?.safetyWarning === 'string' ? raw.safetyWarning : undefined,
    modelUsed: modelName
  };
}

/**
 * Intelligent local fallback analyzer used when hosted inference API
 * is temporarily offline or unreachable.
 */
function localRuleBasedAnalyzer(input: AnalyzeOptions): AIAnalysisResult {
  const text = `${input.title} ${input.description} ${input.location}`.toLowerCase();

  let category: IssueCategory = 'Other';
  let department = 'Lucknow Nagar Nigam General Grievance Cell';
  let priority: PriorityLevel = 'medium';
  let priorityReason = 'Standard municipal maintenance priority assigned pending on-site verification.';
  let safetyWarning: string | undefined;

  if (text.includes('pothole') || text.includes('road') || text.includes('crater') || text.includes('tarmac') || text.includes('asphalt')) {
    category = 'Roads & Potholes';
    department = 'Lucknow Nagar Nigam (Public Works Department / Zone Office)';
    if (text.includes('accident') || text.includes('skid') || text.includes('deep') || text.includes('arterial') || text.includes('highway')) {
      priority = 'high';
      priorityReason = 'Significant vehicular skidding and collision risk on public roadway.';
    } else {
      priority = 'medium';
      priorityReason = 'Pavement wear and tear requiring scheduled asphalt restoration.';
    }
  } else if (text.includes('garbage') || text.includes('waste') || text.includes('trash') || text.includes('dump') || text.includes('stench') || text.includes('litter')) {
    category = 'Sanitation & Waste';
    department = 'Lucknow Nagar Nigam (Health & Solid Waste Management Dept)';
    if (text.includes('school') || text.includes('hospital') || text.includes('days') || text.includes('rotting') || text.includes('drain')) {
      priority = 'high';
      priorityReason = 'Biohazard risk and vector-borne epidemic hazard near populated residential zone.';
    } else {
      priority = 'medium';
      priorityReason = 'Uncleared refuse container causing localized civic inconvenience.';
    }
  } else if (text.includes('light') || text.includes('dark') || text.includes('lamp') || text.includes('pole') || text.includes('led') || text.includes('wire')) {
    category = 'Street Lighting';
    department = 'Lucknow Electricity Supply Administration (LESA) / Nagar Nigam Streetlight Wing';
    if (text.includes('wire') || text.includes('spark') || text.includes('hanging') || text.includes('shock')) {
      priority = 'high';
      safetyWarning = 'Caution: Potential live electrical current hazard reported.';
      priorityReason = 'Exposed electrical hazard poses critical electrocution risk to pedestrians.';
    } else {
      priority = 'medium';
      priorityReason = 'Absence of adequate street illumination compromising night transit safety.';
    }
  } else if (text.includes('water') || text.includes('pipe') || text.includes('leak') || text.includes('drain') || text.includes('sewage') || text.includes('flood') || text.includes('overflow')) {
    category = 'Water & Drainage';
    department = 'Lucknow Jal Sansthan (Zone Division) & Municipal Drainage Cell';
    if (text.includes('burst') || text.includes('gushing') || text.includes('foundation') || text.includes('contaminated')) {
      priority = 'high';
      priorityReason = 'Potable water resource loss and structural undermine hazard to road/compound foundation.';
    } else {
      priority = 'medium';
      priorityReason = 'Drainage blockage or slow water leak needing plumbing clearance.';
    }
  } else if (text.includes('park') || text.includes('tree') || text.includes('branch') || text.includes('grass')) {
    category = 'Parks & Greenery';
    department = 'Lucknow Nagar Nigam (Horticulture & Parks Wing)';
    priority = text.includes('fallen') || text.includes('blocking') ? 'high' : 'low';
    priorityReason = 'Horticultural upkeep and public park accessibility.';
  } else if (text.includes('encroach') || text.includes('hawker') || text.includes('stall') || text.includes('traffic') || text.includes('jam')) {
    category = 'Encroachment & Traffic';
    department = 'Lucknow Nagar Nigam Encroachment Squad & Traffic Police Lucknow';
    priority = 'medium';
    priorityReason = 'Right-of-way obstruction causing traffic congestion and pedestrian diversion.';
  }

  const missingInformation: string[] = [];
  if (!input.location || input.location.length < 8) {
    missingInformation.push('Precise street number, nearest landmark, or municipal ward number');
  }
  if (!input.imageData) {
    missingInformation.push('Clear daytime photograph showing the extent and surroundings of the issue');
  }
  if (input.description.length < 50) {
    missingInformation.push('Approximate duration of the issue (e.g. how many days/weeks it has persisted)');
  }

  const recommendedSteps = [
    'Document photo/video evidence with time-stamp GPS data',
    'Submit complaint token to the respective Lucknow Nagar Nigam Ward Office',
    'Rally community neighbors to upvote this report for higher administrative visibility'
  ];

  return {
    category,
    department,
    summary: `${input.title} at ${input.location || 'Lucknow'}. Primary issue: ${category}.`,
    priority,
    priorityReason,
    missingInformation,
    recommendedSteps,
    complaintDraft: generateBasicComplaintDraft(input.title, input.description, input.location, category),
    confidenceScore: 0.82,
    safetyWarning,
    modelUsed: 'civiclens-fallback-heuristic-engine'
  };
}

function generateBasicComplaintDraft(title: string, description: string, location: string, category: IssueCategory): string {
  return `To,
The Competent Municipal Authority / Zonal Officer,
Lucknow Nagar Nigam,
Lucknow, Uttar Pradesh.

Subject: Formal Grievance Regarding ${title} at ${location || 'Lucknow'}

Respected Sir/Madam,

I am writing to formally register a civic grievance classified under "${category}". 

Issue Description:
${description}

Location:
${location || 'Lucknow Ward'}

This issue is causing severe inconvenience and hazard to residents, commuters, and pedestrians in the locality. I request that a site inspection be conducted and prompt remedial action be taken under the Citizen's Municipal Charter.

Thank you for your prompt attention to public safety and cleanliness.

Yours faithfully,
Concerned Resident / CivicLens AI Reporter
Lucknow`;
}

/**
 * Main AI Analysis function supporting:
 * 1. Default Google GenAI (with Gemini 3.8 Flash / Gemma 2)
 * 2. Vision multimodal input (when image is uploaded)
 * 3. Graceful fallback with zero crash guarantee
 */
export async function analyzeCivicIssue(options: AnalyzeOptions): Promise<AIAnalysisResult> {
  const provider = (process.env.LLM_PROVIDER || 'gemini').toLowerCase();
  const modelName = process.env.LLM_MODEL || 'gemini-3.8-flash';
  const apiKey = process.env.GEMINI_API_KEY;

  // If user configured OpenRouter or other provider, or if no API key is available
  if (provider === 'gemini') {
    if (!apiKey) {
      console.warn('[AI Service] GEMINI_API_KEY is not set. Executing local heuristic civic analyzer.');
      return localRuleBasedAnalyzer(options);
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const promptText = `
You are the core AI analysis engine for "CivicLens AI", an open-source civic problem reporting platform deployed for Lucknow, Uttar Pradesh, India.
A resident has reported the following municipal community issue:

Title: ${options.title}
Location: ${options.location}
Description: ${options.description}
Image attached: ${options.imageData ? 'Yes (analyze image below)' : 'No'}

Analyze this civic problem thoroughly and return structured JSON conforming to this schema:
- category: One of ["Roads & Potholes", "Sanitation & Waste", "Street Lighting", "Water & Drainage", "Encroachment & Traffic", "Public Health & Safety", "Parks & Greenery", "Other"]
- department: Specific government department/wing in Lucknow responsible (e.g. "Lucknow Nagar Nigam - Public Works", "Lucknow Jal Sansthan", "LESA Streetlight Division", "Health & Sanitation Dept")
- summary: Concise 1-2 sentence executive summary of the problem
- priority: Recommended priority strictly "low", "medium", or "high" (Treat this as an advisory recommendation, not an authoritative decree. Clearly reflect uncertainty if details are sparse.)
- priorityReason: Justification for the priority level considering pedestrian hazard, road accidents, disease transmission, environmental pollution, or property damage
- missingInformation: Array of 1-3 specific critical pieces of information that the citizen should still provide to enable swift action by municipal engineers (e.g., exact pole number, pipe diameter, daytime photo, landmark)
- recommendedSteps: Array of 2-4 concrete next steps (e.g., safety caution tape, contacting ward councilor, scheduling inspection)
- complaintDraft: A complete, highly professional, polite formal complaint letter addressed to the Municipal Commissioner / Executive Engineer of Lucknow Nagar Nigam or relevant department, incorporating the location and issue specifics, ready for the citizen to print, email, or copy.
- confidenceScore: A number from 0.0 to 1.0 indicating AI confidence in the assessment
- safetyWarning: Optional string if an imminent acute hazard exists (e.g., exposed high voltage wires, deep open manhole, gas smell)
`;

      const contents: any[] = [];

      // Check if image is provided
      if (options.imageData && options.imageData.startsWith('data:image/')) {
        const matches = options.imageData.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const mimeType = matches[1];
          const base64Data = matches[2];
          contents.push({
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: base64Data
                }
              },
              {
                text: promptText
              }
            ]
          });
        } else {
          contents.push(promptText);
        }
      } else {
        contents.push(promptText);
      }

      const generatePromise = ai.models.generateContent({
        model: modelName,
        contents: contents.length === 1 && typeof contents[0] === 'string' ? contents[0] : contents[0],
        config: {
          systemInstruction: 'You are CivicLens AI, an expert civic engineer and municipal grievance analyst for Indian cities. Provide accurate, safety-oriented, and constructive assessments. Always output strictly valid JSON.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              department: { type: Type.STRING },
              summary: { type: Type.STRING },
              priority: { type: Type.STRING },
              priorityReason: { type: Type.STRING },
              missingInformation: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              recommendedSteps: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              complaintDraft: { type: Type.STRING },
              confidenceScore: { type: Type.NUMBER },
              safetyWarning: { type: Type.STRING }
            },
            required: ['category', 'department', 'summary', 'priority', 'priorityReason', 'missingInformation', 'recommendedSteps', 'complaintDraft', 'confidenceScore']
          }
        }
      });

      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('AI inference timeout after 12 seconds')), 12000)
      );

      const response = await Promise.race([generatePromise, timeoutPromise]);

      const responseText = response.text ? response.text.trim() : '';
      if (!responseText) {
        throw new Error('Empty response received from Gemini model');
      }

      const parsed = JSON.parse(responseText);
      return sanitizeAndValidateAIResponse(parsed, modelName);

    } catch (err) {
      console.error('[AI Service] Gemini inference failed or threw error:', err);
      // Fallback gracefully without breaking the user experience
      const fallback = localRuleBasedAnalyzer(options);
      fallback.summary += ' (Processed with local fallback engine due to API timeout)';
      return fallback;
    }
  }

  // If another provider is specified or openrouter
  if (provider === 'openrouter' && process.env.OPENROUTER_API_KEY) {
    try {
      const openRouterModel = process.env.LLM_MODEL || 'google/gemma-2-9b-it:free';
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.APP_URL || 'https://civiclens.ai',
          'X-Title': 'CivicLens AI'
        },
        body: JSON.stringify({
          model: openRouterModel,
          messages: [
            {
              role: 'system',
              content: 'You are CivicLens AI. Output strictly valid JSON with keys: category, department, summary, priority (low/medium/high), priorityReason, missingInformation, recommendedSteps, complaintDraft, confidenceScore.'
            },
            {
              role: 'user',
              content: `Analyze this civic issue:\nTitle: ${options.title}\nLocation: ${options.location}\nDescription: ${options.description}`
            }
          ]
        })
      });

      if (!res.ok) throw new Error(`OpenRouter HTTP ${res.status}`);
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || '{}';
      const cleanJson = content.replace(/^```json/g, '').replace(/```$/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return sanitizeAndValidateAIResponse(parsed, openRouterModel);
    } catch (e) {
      console.warn('[AI Service] OpenRouter call failed, falling back:', e);
      return localRuleBasedAnalyzer(options);
    }
  }

  return localRuleBasedAnalyzer(options);
}
