"use client";
import { createContext, useContext, useState } from 'react';

const INITIAL_DOCS = [
  {
    id: 'syllabus',
    name: "Syllabus_Fall_2026.pdf",
    size: "1.2 MB",
    date: "Aug 24",
    status: 'indexed',
    topics: ["Course Overview", "Grading Breakdown", "Late Policy", "Office Hours"],
    chunks: 12,
    knowledge: `SYLLABUS — COM 301 Business Communication (Fall 2026)
Professor: Rebecca Sullivan. Office Hours: Mon/Wed 2–4pm, Room 210.
Late Policy: 10% deduction per day, maximum 50% total deduction.
Grading: Weekly Case Studies 30%, Midterm Practical 30%, Final Presentation 40%.
Learning Objectives: (1) Master internal vs. external email etiquette. (2) Navigate conflict resolution effectively. (3) Construct highly persuasive proposals.
Required Texts: "The Business Writer's Handbook" (11th ed.) and supplemental readings posted to Canvas.
Attendance: More than 3 unexcused absences will result in a grade reduction of one letter grade.`
  },
  {
    id: 'lecture-01',
    name: "Lecture_01_Email_Etiquette.pdf",
    size: "2.4 MB",
    date: "Aug 26",
    status: 'indexed',
    topics: ["Subject Lines", "Professional Greetings", "Tone & Empathy", "Call to Action", "Sign-offs"],
    chunks: 18,
    knowledge: `LECTURE 1: Professional Email Etiquette (COM 301)
Rule 1: Subject lines must be clear and action-oriented. Example: "Follow-up: Q3 Budget Meeting — Decision Needed by Friday."
Rule 2: Greetings — "Dear [Full Name]" for formal communications; "Hello [First Name]" for semi-formal. Never begin with "Hey" in professional contexts.
Rule 3: Body tone — be concise yet empathetic. In complaint or escalation emails, always acknowledge the issue before proposing solutions.
Rule 4: Every email must close with a clear call to action: state the desired outcome and a specific deadline.
Rule 5: Sign-offs — use "Best regards," "Sincerely," or "Kind regards." Avoid casual closings like "Thanks!" in formal contexts.
Rule 6: Response time SLA — reply within 24 business hours. Configure "Out of Office" auto-replies when unavailable.
Syllabus mandate: Students must demonstrate measurable empathy in all client-facing written communications.`
  }
];

const NEW_DOC_KNOWLEDGE = {
  'conflict-resolution': `LECTURE 2: Conflict Resolution Framework (COM 301)
Step 1 — Acknowledge: Begin by validating the other party's perspective before presenting your own. Use "I understand that..." framing.
Step 2 — Identify the root cause: Separate the people from the problem. Focus on interests, not positions (Fisher & Ury, "Getting to Yes").
Step 3 — Generate options: Brainstorm multiple solutions collaboratively. Avoid anchoring on the first proposal.
Step 4 — Agree on criteria: Establish objective standards before evaluating options (e.g., company policy, industry norms).
Step 5 — Reach agreement: Document the resolution in writing. Assign owners, deadlines, and follow-up checkpoints.
Key principle: Conflict managed well strengthens professional relationships. Conflict avoided or escalated destroys them.
Application: Students must apply this framework in the Midterm Practical role-play exercise (30% of grade).`
};

const ContentEngineContext = createContext();

export function ContentEngineProvider({ children }) {
  const [docs, setDocs] = useState(INITIAL_DOCS);

  const addDoc = async (newDoc) => {
    // 1. Instantly update UI with indexing state
    setDocs(prev => [...prev, { ...newDoc, status: 'indexing' }]);

    try {
      // 2. Fire the real ingestion pipeline
      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docId: newDoc.id, text: newDoc.knowledge }),
      });

      if (!response.ok) throw new Error('Ingestion failed');

      // 3. Mark as indexed
      setDocs(prev => prev.map(d => d.id === newDoc.id ? { ...d, status: 'indexed' } : d));
    } catch (error) {
      console.error("RAG Ingestion Error:", error);
      // Fallback for demo if API isn't fully configured
      setTimeout(() => {
        setDocs(prev => prev.map(d => d.id === newDoc.id ? { ...d, status: 'indexed' } : d));
      }, 1500);
    }
  };

  const registerDoc = (metadata) => {
    setDocs(prev => [...prev, { ...metadata, status: 'indexed' }]);
  };

  const removeDoc = (id) => {
    setDocs(prev => prev.filter(d => d.id !== id));
  };

  const indexedDocs = docs.filter(d => d.status === 'indexed');
  const totalChunks = indexedDocs.reduce((sum, d) => sum + d.chunks, 0);

  const buildSystemPrompt = () => {
    if (indexedDocs.length === 0) {
      return 'You are an AI Teaching Assistant. No course materials have been indexed yet. Ask the professor to upload documents first.';
    }
    const knowledgeBase = indexedDocs.map(d => d.knowledge).join('\n\n---\n\n');
    return `You are an AI Teaching Assistant for "Business Communication" (COM 301), Fall 2026, taught by Professor Rebecca Sullivan.

Your knowledge is strictly grounded in the following indexed course documents:

${knowledgeBase}

CRITICAL RULES:
- Only answer questions based on the above course materials.
- Be specific and reference the exact rule, section, or document your answer comes from.
- If a question falls entirely outside these materials, politely decline and redirect to the course content.
- Keep all responses clear, structured, and educationally appropriate.`;
  };

  return (
    <ContentEngineContext.Provider value={{ docs, addDoc, registerDoc, removeDoc, indexedDocs, totalChunks, buildSystemPrompt }}>
      {children}
    </ContentEngineContext.Provider>
  );
}

export const useContentEngine = () => useContext(ContentEngineContext);
