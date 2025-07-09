'use server';
/**
 * @fileOverview An AI agent for the client portal voice chat.
 * It takes a user's text query, finds an answer using RAG, and returns the response as text and audio.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { tickets, assets, knowledgeBaseArticles } from '@/lib/placeholder-data';
import { textToSpeechFlow } from './text-to-speech';

// --- Tools from portal-chat.ts for RAG ---
const CURRENT_CLIENT_NAME = 'TechCorp';

const searchTicketsTool = ai.defineTool(
  {
    name: 'searchTickets',
    description: 'Searches for tickets belonging to the current client based on a query.',
    inputSchema: z.object({ query: z.string().describe("A search query (e.g., 'server down', 'open tickets').") }),
    outputSchema: z.array(
      z.object({
        id: z.string(),
        subject: z.string(),
        status: z.string(),
      })
    ),
  },
  async ({ query }) => {
    const lowerCaseQuery = query.toLowerCase();
    return tickets
      .filter(ticket => 
        ticket.client === CURRENT_CLIENT_NAME &&
        (ticket.subject.toLowerCase().includes(lowerCaseQuery) || ticket.status.toLowerCase().includes(lowerCaseQuery) || ticket.id.toLowerCase().includes(lowerCaseQuery))
      )
      .slice(0, 5)
      .map(t => ({ id: t.id, subject: t.subject, status: t.status }));
  }
);

const searchAssetsTool = ai.defineTool(
  {
    name: 'searchAssets',
    description: 'Searches for assets belonging to the current client based on a query.',
    inputSchema: z.object({ query: z.string().describe("A search query (e.g., 'server', 'workstation').") }),
    outputSchema: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        type: z.string(),
        status: z.string(),
      })
    ),
  },
  async ({ query }) => {
    const lowerCaseQuery = query.toLowerCase();
    return assets
      .filter(asset => 
        asset.client === CURRENT_CLIENT_NAME &&
        (asset.name.toLowerCase().includes(lowerCaseQuery) || asset.type.toLowerCase().includes(lowerCaseQuery))
      )
      .slice(0, 5)
      .map(a => ({ id: a.id, name: a.name, type: a.type, status: a.status }));
  }
);

const searchKnowledgeBaseTool = ai.defineTool(
  {
    name: 'searchKnowledgeBase',
    description: 'Searches the public knowledge base for articles matching a query.',
    inputSchema: z.object({ query: z.string().describe("A search query of 3-5 keywords based on the user's problem.") }),
    outputSchema: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        category: z.string(),
      })
    ),
  },
  async ({ query }) => {
    const lowerCaseQuery = query.toLowerCase();
    const keywords = lowerCaseQuery.split(' ');
    return knowledgeBaseArticles
      .filter(article => {
        if (article.type !== 'Public') return false;
        const content = `${article.title} ${article.category} ${article.content}`.toLowerCase();
        return keywords.some(keyword => content.includes(keyword));
      })
      .slice(0, 3)
      .map(a => ({ id: a.id, title: a.title, category: a.category }));
  }
);
// --- End of Tools ---


const VoiceCallInputSchema = z.object({
  query: z.string(),
  clientId: z.string().describe('The ID of the client who is asking the question.'),
});
export type VoiceCallInput = z.infer<typeof VoiceCallInputSchema>;

const VoiceCallOutputSchema = z.object({
  responseText: z.string(),
  audioDataUri: z.string(),
});
export type VoiceCallOutput = z.infer<typeof VoiceCallOutputSchema>;

export async function voiceCall(input: VoiceCallInput): Promise<VoiceCallOutput> {
  return voiceCallFlow(input);
}

const voiceCallFlow = ai.defineFlow(
  {
    name: 'voiceCallFlow',
    inputSchema: VoiceCallInputSchema,
    outputSchema: VoiceCallOutputSchema,
  },
  async (input) => {
    // 1. Get text response from LLM using tools (RAG)
    const llmResponse = await ai.generate({
      prompt: `You are Bernardo, a friendly and helpful AI assistant for the ServiceFlow client portal.
      The current client is ${CURRENT_CLIENT_NAME}. You MUST only use the provided tools to get information about this client's tickets and assets.
      Use the available tools to answer user questions. If you don't find information with the tools, say that you couldn't find any information.
      When asked about who you are, introduce yourself. Keep your answers concise and helpful. Do not use markdown.
      
      User Query: "${input.query}"`,
      tools: [searchTicketsTool, searchAssetsTool, searchKnowledgeBaseTool],
      model: 'googleai/gemini-2.0-flash'
    });

    const responseText = llmResponse.text;

    // 2. Convert text response to speech
    const ttsOutput = await textToSpeechFlow({ text: responseText });
    
    return {
      responseText: responseText,
      audioDataUri: ttsOutput.audioDataUri,
    };
  }
);
