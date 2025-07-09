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
  prompt: z.string().describe('The prompt for generating the knowledge base article.'),
  webSearchResults: z.string().describe('Relevant web search results to incorporate into the article.'),
  useWebSearch: z.boolean().optional().describe('Whether or not to include web search results. Defaults to false.'),
});
export type KnowledgeBaseArticleInput = z.infer<typeof KnowledgeBaseArticleInputSchema>;

const KnowledgeBaseArticleOutputSchema = z.object({
  title: z.string().describe('The title of the knowledge base article.'),
  content: z.string().describe('The content of the knowledge base article.'),
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
  prompt: `You are an expert knowledge base article writer.

  You will generate a knowledge base article based on the given prompt and web search results.

  Prompt: {{{prompt}}}

  {{#if useWebSearch}}
  Web Search Results:
  {{{webSearchResults}}}
  {{/if}}
  Please generate the knowledge base article with a title and content.
  The title and content must be well formatted.
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
