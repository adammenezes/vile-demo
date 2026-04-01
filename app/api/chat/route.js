import { streamText, createDataStreamResponse } from 'ai';
import { google } from '@ai-sdk/google';
import { getRelevantContextWithSources } from '@/app/lib/rag-engine';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { messages, role } = await req.json();
    const lastMessage = messages[messages.length - 1].content;

    let retrievedContext = '';
    let sourceDocIds = [];

    if (process.env.PINECONE_API_KEY && process.env.PINECONE_INDEX) {
      try {
        const result = await getRelevantContextWithSources(lastMessage);
        retrievedContext = result.context;
        sourceDocIds = result.sourceDocIds;
      } catch (e) {
        console.error('RAG Search Error:', e);
      }
    }

    const systemPrompt = `You are an expert AI Teaching Assistant for "Business Communication" (COM 301), Fall 2026, taught by Professor Rebecca Sullivan.

${retrievedContext
  ? `RETRIEVED COURSE MATERIAL (use this as your primary knowledge source):
${retrievedContext}

Answer the student's question using ONLY the above course material. Be specific — cite exact rules, steps, or policies from the material. If the retrieved material is insufficient to fully answer the question, say so clearly and suggest what topic in the course might cover it.`
  : 'No course material was retrieved for this query. Politely let the student know their question may not be covered in the indexed materials, and encourage them to ask about specific course topics.'}

ROLE: ${role === 'teacher'
  ? 'The current user is the PROFESSOR. You may generate quizzes, study guides, and course content based on the retrieved material.'
  : 'The current user is a STUDENT. Provide clear, encouraging, and educationally appropriate explanations. Do not answer questions outside the scope of the course materials.'}`;

    return createDataStreamResponse({
      execute: async (dataStream) => {
        dataStream.writeData({ sourceDocIds });

        const result = streamText({
          model: google('gemini-2.5-flash'),
          system: systemPrompt,
          messages,
          temperature: 0.2,
        });

        result.mergeIntoDataStream(dataStream);
      },
      onError: (error) => {
        console.error('Stream error:', error?.message || error);
        return 'An error occurred while generating a response. Please try again.';
      },
    });
  } catch (error) {
    console.error('API Chat Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
