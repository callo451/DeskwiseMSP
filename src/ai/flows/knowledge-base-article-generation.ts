// @ts-nocheck
'use server';
/**
 * @fileOverview Generates knowledge base articles using AI, incorporating web search results.
 *
 * - generateKnowledgeBaseArticle - A function that generates a knowledge base article.
 * - KnowledgeBaseArticleInput - The input type for the generateKnowledgeBaseArticle function.
 * - KnowledgeBaseArticleOutput - The return type for the generateKnowledgeBaseArticle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const KnowledgeBaseArticleInputSchema = z.object({
  prompt: z.string().describe('The prompt for generating the knowledge base article, usually containing ticket details.'),
  webSearchResults: z.string().optional().describe('Relevant web search results to incorporate into the article.'),
  useWebSearch: z.boolean().optional().describe('Whether or not to include web search results. Defaults to false.'),
});
export type KnowledgeBaseArticleInput = z.infer<typeof KnowledgeBaseArticleInputSchema>;

const KnowledgeBaseArticleOutputSchema = z.object({
  title: z.string().describe('The title of the knowledge base article.'),
  content: z.string().describe('The content of the knowledge base article in Markdown format.'),
});
export type KnowledgeBaseArticleOutput = z.infer<typeof KnowledgeBaseArticleOutputSchema>;

export async function generateKnowledgeBaseArticle(
  input: KnowledgeBaseArticleInput
): Promise<KnowledgeBaseArticleOutput> {
  return generateKnowledgeBaseArticleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'knowledgeBaseArticlePrompt',
  input: {schema: KnowledgeBaseArticleInputSchema},
  output: {schema: KnowledgeBaseArticleOutputSchema},
  prompt: `You are an expert technical writer who specializes in creating knowledge base articles from IT support tickets. Your goal is to transform the raw ticket information into a clean, well-structured, and easy-to-understand article for end-users or other technicians.

Based on the provided ticket information, generate an article with a clear title and content.

The content should be in Markdown and follow this structure:
1.  **Problem Summary:** A brief, one or two-sentence summary of the issue.
2.  **Symptoms:** A bulleted list of symptoms the user was experiencing.
3.  **Solution/Resolution:** A clear, step-by-step guide on how to resolve the issue.

Ticket Information:
{{{prompt}}}

Generate only the title and content for the knowledge base article.
  `,
});

const generateKnowledgeBaseArticleFlow = ai.defineFlow(
  {
    name: 'generateKnowledgeBaseArticleFlow',
    inputSchema: KnowledgeBaseArticleInputSchema,
    outputSchema: KnowledgeBaseArticleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
