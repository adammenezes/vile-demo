# Canvas 2.0 AI LMS Demo Guidelines

## Commands
- **Install dependencies**: `npm install`
- **Start development server**: `npm run dev`
- **Build optimized production bundle**: `npm run build`
- **Start production server**: `npm run start`
- **Lint code**: `npm run lint`

## Technology Stack
- **Framework**: Next.js 15 (App Router, Turbopack)
- **Styling**: Vanilla CSS Variables (`globals.css`), no Tailwind.
- **AI Integration**: Vercel AI SDK (`@ai-sdk/react`, `@ai-sdk/google`) + Gemini 1.5 Pro
- **Icons**: `lucide-react`

## Architecture & State
- **Role Toggle Context**: `app/components/RoleProvider.js` heavily dictates conditional UI rendering across the app. Always import `useRole` rather than hardcoding auth checks.
  - `role === 'teacher'`: Exposes the "RAG Document Upload Zone" and drafts.
  - `role === 'student'`: Triggers the read-only file list and study-focused AI chat.
- **Next.js 15 strictness**: Route parameters are Promises. Always unwrap them: `const resolvedParams = React.use(params); const id = resolvedParams?.id;`

## Styling Guidelines
- Stick to the premium "Glassmorphism" design system established in `globals.css`.
- Use CSS variables exclusively for colors: `var(--background)`, `var(--primary)`, `var(--muted-foreground)`, `var(--card)`.
- Use the predefined utility classes: `.glass-panel`, `.btn-primary`, `.input-field`.
- **Spacing/Layout**: The app follows a global Flexbox "Row" layout. The primary structural components are `GlobalSidebar.js` and expanding Flex `<div>`s for main content.

## Error Handling
- Never expose raw database or backend logic to the frontend demo code. Stick to mocked dummy data arrays for visual scenarios.
- AI route (`/api/chat`) is pre-loaded with simulated RAG instruction prompts pending a true Document Embeddings database integration.
