import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { getRelevantContext } from '@/app/lib/rag-engine';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { messages, role } = await req.json();
    const lastMessage = messages[messages.length - 1].content;

    let retrievedContext = "";

    // Only attempt search if Pinecone is configured
    if (process.env.PINECONE_API_KEY && process.env.PINECONE_INDEX) {
      try {
        retrievedContext = await getRelevantContext(lastMessage);
      } catch (e) {
        console.error("RAG Search Error:", e);
      }
    }

    const systemPrompt = `You are a helpful AI Teaching Assistant for "Business Communication" (COM 301).
Your knowledge is grounded in the provided course materials. 

${retrievedContext ? `RELEVANT CONTEXT FROM COURSE MATERIALS:\n${retrievedContext}\n\n` : ''}

${role === 'teacher'
        ? 'CURRENT USER: PROFESSOR. You may generate quizzes and study guides based on the context.'
        : 'CURRENT USER: STUDENT. Provide helpful, encouraging explanations grounded in the materials.'}

If the context doesn't contain the answer, politely say you don't know based on the provided materials.`;

    const result = streamText({
      model: google('gemini-1.5-pro'),
      system: systemPrompt,
      messages,
      temperature: 0.2,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('API Chat Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
