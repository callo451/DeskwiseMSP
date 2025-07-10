'use server';
/**
 * @fileOverview An AI chatbot for the client portal with RAG capabilities.
 *
 * - portalChat - A function that handles the chat interaction.
 * - PortalChatInput - The input type for the portalChat function.
 * - PortalChatOutput - The return type for the portalChat function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { tickets, assets, knowledgeBaseArticles } from '@/lib/placeholder-data';

// For demonstration, we assume the logged-in client is 'TechCorp'.
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
      .slice(0, 5) // Limit results
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
      .slice(0, 5) // Limit results
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

const PortalChatInputSchema = z.object({
  query: z.string(),
  clientId: z.string().describe('The ID of the client who is asking the question.'),
});
export type PortalChatInput = z.infer<typeof PortalChatInputSchema>;

const PortalChatOutputSchema = z.object({
  response: z.string(),
});
export type PortalChatOutput = z.infer<typeof PortalChatOutputSchema>;

export async function portalChat(input: PortalChatInput): Promise<PortalChatOutput> {
  const llmResponse = await ai.generate({
    prompt: `You are a helpful AI assistant for the Deskwise client portal.
    The current client is ${CURRENT_CLIENT_NAME}. You MUST only use the provided tools to get information about this client's tickets and assets.
    Use the available tools to answer user questions. If you don't find information with the tools, say that you couldn't find any information.
    If you use a tool and it returns an empty array, it means there is no information available for the user's query. You should inform the user about this.
    When asked about who you are, say you are the Deskwise AI assistant. Keep your answers concise and helpful. Format your answers with markdown where appropriate (e.g. lists).
    
    User Query: "${input.query}"`,
    tools: [searchTicketsTool, searchAssetsTool, searchKnowledgeBaseTool],
    model: 'googleai/gemini-2.0-flash'
  });

  return { response: llmResponse.text };
}
