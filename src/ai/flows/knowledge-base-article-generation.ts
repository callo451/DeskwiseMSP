
'use server';
/**
 * @fileOverview An AI agent to generate knowledge base articles.
 *
 * - generateKbArticle - A function that generates a knowledge base article.
 * - GenerateKbArticleInput - The input type for the generateKbArticle function.
 * - GenerateKbArticleOutput - The return type for the generateKbArticle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateKbArticleInputSchema = z.object({
  prompt: z.string().describe('A short description of the topic for the knowledge base article.'),
  category: z.string().describe('The category for the article.'),
});
export type GenerateKbArticleInput = z.infer<typeof GenerateKbArticleInputSchema>;

const GenerateKbArticleOutputSchema = z.object({
  title: z.string().describe('A clear and concise title for the article.'),
  content: z.string().describe('The full content of the article, formatted in Markdown.'),
});
export type GenerateKbArticleOutput = z.infer<typeof GenerateKbArticleOutputSchema>;

export async function generateKbArticle(input: GenerateKbArticleInput): Promise<GenerateKbArticleOutput> {
  return generateKbArticleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateKbArticlePrompt',
  input: {schema: GenerateKbArticleInputSchema},
  output: {schema: GenerateKbArticleOutputSchema},
  prompt: `You are an expert technical writer for a Managed Service Provider (MSP). Your task is to write a clear, helpful, and well-structured knowledge base article.

The article should be in the category: {{{category}}}
The user's request is: "{{{prompt}}}"

Based on the request, generate a suitable title and the full article content.
The content must be in Markdown format. Use headings, bullet points, numbered lists, and code blocks where appropriate to make the article easy to read and follow.

For example, for a request about "how to flush DNS in Windows", you might include:
- A title like "How to Flush the DNS Cache in Windows"
- An introduction explaining what DNS cache is.
- A step-by-step guide with numbered lists.
- A code block with the exact command: \`ipconfig /flushdns\`
- A conclusion summarizing the process.
`,
});

const generateKbArticleFlow = ai.defineFlow(
  {
    name: 'generateKbArticleFlow',
    inputSchema: GenerateKbArticleInputSchema,
    outputSchema: GenerateKbArticleOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
