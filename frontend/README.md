# CivicLens AI — Frontend Architecture

The frontend application is built with React 19, TypeScript, Vite, and Tailwind CSS v4.

## Directory Layout
- **`src/components/Navbar.tsx`**: Header with Lucknow branding, live diagnostic badges, and navigation.
- **`src/components/Hero.tsx`**: Landing page hero with live metrics and mission pillars.
- **`src/components/ReportForm.tsx`**: Core AI reporting wizard with multimodal image upload, 1-click test samples, live AI analysis breakdown, editable complaint draft, and human overrides.
- **`src/components/ReportCard.tsx`**: Modular card for public feed with priority indicators, municipal department, and upvote button.
- **`src/components/ReportDetailsModal.tsx`**: Complete report details, timeline audit trail, AI evaluation, and print/copy grievance tools.
- **`src/components/AdminPanel.tsx`**: Municipal official review panel with status update workflow and audit trail.
- **`src/components/StatsOverview.tsx`**: Real-time statistics bar with category breakdown.
- **`src/components/DocsModal.tsx`**: In-app documentation and system architecture modal.
- **`src/services/api.ts`**: Typed REST API client for backend communication.
- **`src/utils/sampleImages.ts`**: High-quality SVG sample assets for 1-click test evaluations.
