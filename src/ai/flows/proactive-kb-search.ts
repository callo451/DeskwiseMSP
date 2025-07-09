'use server';
/**
 * @fileOverview An AI agent to proactively search the knowledge base for relevant articles.
 *
 * - findRelevantArticles - A function that finds articles based on ticket content.
 * - ProactiveKbSearchInput - The input type for the findRelevantArticles function.
 * - ProactiveKbSearchOutput - The return type for the findRelevantArticles function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { knowledgeBaseArticles } from '@/lib/placeholder-data';
import type { KnowledgeBaseArticle } from '@/lib/types';

const searchKnowledgeBaseTool = ai.defineTool(
  {
    name: 'searchKnowledgeBase',
    description: 'Searches the knowledge base for articles matching a query. Returns up to 3 relevant articles.',
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

    // A simple search implementation
    return knowledgeBaseArticles
      .filter(article => {
        const title = article.title.toLowerCase();
        const content = `${article.title} ${article.category}`.toLowerCase();
        return keywords.some(keyword => content.includes(keyword));
      })
      .slice(0, 3)
      .map(a => ({ id: a.id, title: a.title, category: a.category }));
  }
);

const ProactiveKbSearchInputSchema = z.object({
  subject: z.string(),
  description: z.string(),
});
export type ProactiveKbSearchInput = z.infer<typeof ProactiveKbSearchInputSchema>;

const ProactiveKbSearchOutputSchema = z.array(
  z.object({
    id: z.string(),
    title: z.string(),
    category: z.string(),
  })
);
export type ProactiveKbSearchOutput = z.infer<typeof ProactiveKbSearchOutputSchema>;


export async function findRelevantArticles(input: ProactiveKbSearchInput): Promise<ProactiveKbSearchOutput> {
  return findRelevantArticlesFlow(input);
}

const findRelevantArticlesFlow = ai.defineFlow(
  {
    name: 'findRelevantArticlesFlow',
    inputSchema: ProactiveKbSearchInputSchema,
    outputSchema: ProactiveKbSearchOutputSchema,
  },
  async ({ subject, description }) => {
    const llmResponse = await ai.generate({
      prompt: `You are a helpful IT assistant. Analyze the following ticket content and use the provided tool to find relevant knowledge base articles that might help solve the issue.
      
      Subject: ${subject}
      Description: ${description}`,
      tools: [searchKnowledgeBaseTool],
    });
    
    const toolResponse = llmResponse.toolRequest?.tool.response;
    if (toolResponse) {
      return (toolResponse as ProactiveKbSearchOutput) || [];
    }
    
    return [];
  }
);
