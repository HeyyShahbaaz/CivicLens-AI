/**
 * High quality SVG-based test image samples for 1-click hackathon demonstration
 */

function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export const SAMPLE_IMAGES = [
  {
    id: 'pothole',
    label: 'Pothole Road Damage',
    description: 'Crater on asphalt with fractured edges and water accumulation',
    category: 'Roads & Potholes' as const,
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
        <rect width="600" height="400" fill="#334155"/>
        <line x1="0" y1="200" x2="600" y2="200" stroke="#f59e0b" stroke-width="8" stroke-dasharray="25,20" />
        <path d="M180,180 Q250,130 380,160 Q450,220 400,280 Q320,320 220,290 Q150,250 180,180 Z" fill="#1e293b" stroke="#0f172a" stroke-width="4"/>
        <path d="M220,200 Q280,170 340,190 Q370,240 330,260 Q260,270 220,240 Z" fill="#0284c7" opacity="0.7"/>
        <path d="M190,170 L210,190 M390,270 L430,300 M370,160 L410,140 M230,300 L210,330" stroke="#64748b" stroke-width="3"/>
        <text x="30" y="50" fill="#f8fafc" font-family="sans-serif" font-size="20" font-weight="bold">CIVIC REPORT EVIDENCE: ROAD HAZARD</text>
        <text x="30" y="80" fill="#94a3b8" font-family="sans-serif" font-size="14">Location: Hazratganj Corridor, Lucknow (Depth: ~6 inches)</text>
      </svg>
    `)
  },
  {
    id: 'garbage',
    label: 'Overflowing Waste Bin',
    description: 'Community garbage container spilling refuse onto walkway',
    category: 'Sanitation & Waste' as const,
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
        <rect width="600" height="400" fill="#e2e8f0"/>
        <rect x="0" y="280" width="600" height="120" fill="#94a3b8"/>
        <!-- Municipal Bin -->
        <rect x="220" y="160" width="160" height="150" rx="10" fill="#059669" stroke="#047857" stroke-width="4"/>
        <rect x="200" y="145" width="200" height="20" rx="4" fill="#065f46"/>
        <text x="240" y="240" fill="#ffffff" font-family="sans-serif" font-size="16" font-weight="bold">LNN SOLID WASTE</text>
        <!-- Spilling trash -->
        <circle cx="280" cy="130" r="22" fill="#ef4444" opacity="0.8"/>
        <rect x="310" y="120" width="35" height="40" rx="5" fill="#f59e0b" transform="rotate(15 310 120)"/>
        <circle cx="250" cy="140" r="18" fill="#3b82f6"/>
        <path d="M160,310 Q210,290 230,340 Q180,360 160,310 Z" fill="#84cc16"/>
        <circle cx="390" cy="320" r="20" fill="#eab308"/>
        <rect x="410" y="300" width="40" height="25" rx="4" fill="#a855f7" transform="rotate(-20 410 300)"/>
        <text x="30" y="50" fill="#0f172a" font-family="sans-serif" font-size="20" font-weight="bold">CIVIC REPORT EVIDENCE: SANITATION</text>
        <text x="30" y="80" fill="#475569" font-family="sans-serif" font-size="14">Location: Patrakar Puram Crossing, Gomti Nagar</text>
      </svg>
    `)
  },
  {
    id: 'streetlight',
    label: 'Dark Street Light Outage',
    description: 'Non-functional LED luminaire causing darkened road stretch',
    category: 'Street Lighting' as const,
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
        <rect width="600" height="400" fill="#090d16"/>
        <!-- Road -->
        <rect x="0" y="310" width="600" height="90" fill="#1e293b"/>
        <line x1="0" y1="355" x2="600" y2="355" stroke="#475569" stroke-width="4" stroke-dasharray="20,15"/>
        <!-- Lamp pole -->
        <line x1="160" y1="310" x2="160" y2="100" stroke="#64748b" stroke-width="8"/>
        <path d="M160,100 Q160,60 210,60 L240,60" fill="none" stroke="#64748b" stroke-width="8"/>
        <!-- Lamp head dark with red warning -->
        <polygon points="230,60 260,60 270,80 220,80" fill="#334155" stroke="#475569" stroke-width="2"/>
        <circle cx="245" cy="85" r="8" fill="#ef4444" opacity="0.8"/>
        <text x="260" y="90" fill="#f87171" font-family="sans-serif" font-size="12" font-weight="bold">POLE ALB-84 (INOPERATIVE)</text>
        <text x="30" y="50" fill="#f8fafc" font-family="sans-serif" font-size="20" font-weight="bold">CIVIC REPORT EVIDENCE: LIGHTING OUTAGE</text>
        <text x="30" y="80" fill="#94a3b8" font-family="sans-serif" font-size="14">Location: Alambagh Main Road, Lucknow (5 Poles Unlit)</text>
      </svg>
    `)
  },
  {
    id: 'waterleak',
    label: 'Potable Water Pipeline Burst',
    description: 'Clean drinking water gushing onto asphalt roadway',
    category: 'Water & Drainage' as const,
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
        <rect width="600" height="400" fill="#475569"/>
        <!-- Sidewalk & Road -->
        <rect x="0" y="240" width="600" height="160" fill="#334155"/>
        <line x1="0" y1="240" x2="600" y2="240" stroke="#cbd5e1" stroke-width="6"/>
        <!-- Burst water fountain -->
        <ellipse cx="280" cy="250" rx="90" ry="30" fill="#38bdf8" opacity="0.6"/>
        <path d="M260,240 Q280,130 300,240" fill="#0284c7" opacity="0.8"/>
        <path d="M270,240 Q285,150 295,240" fill="#7dd3fc"/>
        <path d="M250,245 Q210,180 190,230" fill="none" stroke="#38bdf8" stroke-width="4"/>
        <path d="M310,245 Q350,180 370,230" fill="none" stroke="#38bdf8" stroke-width="4"/>
        <text x="30" y="50" fill="#ffffff" font-family="sans-serif" font-size="20" font-weight="bold">CIVIC REPORT EVIDENCE: WATER BURST</text>
        <text x="30" y="80" fill="#cbd5e1" font-family="sans-serif" font-size="14">Location: Sector 14, Indira Nagar (Jal Sansthan Main Line)</text>
      </svg>
    `)
  }
];
