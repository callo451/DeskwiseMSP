// src/ai/flows/ticket-insights.ts
'use server';
/**
 * @fileOverview An AI tool to analyze incoming support tickets and suggest
 * categorization or assignment based on keywords and past data.
 *
 * - analyzeTicket - A function that handles the ticket analysis process.
 * - AnalyzeTicketInput - The input type for the analyzeTicket function.
 * - AnalyzeTicketOutput - The return type for the analyzeTicket function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeTicketInputSchema = z.object({
  ticketContent: z
    .string()
    .describe('The text content of the support ticket.'),
});
export type AnalyzeTicketInput = z.infer<typeof AnalyzeTicketInputSchema>;

const AnalyzeTicketOutputSchema = z.object({
  suggestedCategory: z
    .string()
    .describe('The AI suggested category for the ticket.'),
  suggestedTechnician: z
    .string()
    .describe('The AI suggested technician to assign to the ticket.'),
  confidenceLevel: z
    .number()
    .describe(
      'The AI confidence level (0-1) of the category and technician suggestions.'
    ),
  reasoning: z
    .string()
    .describe('The AI reasoning behind the category and technician suggestions.'),
});
export type AnalyzeTicketOutput = z.infer<typeof AnalyzeTicketOutputSchema>;

export async function analyzeTicket(input: AnalyzeTicketInput): Promise<AnalyzeTicketOutput> {
  return analyzeTicketFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeTicketPrompt',
  input: {schema: AnalyzeTicketInputSchema},
  output: {schema: AnalyzeTicketOutputSchema},
  prompt: `You are an AI expert in analyzing support tickets for categorization and technician assignment.

  Analyze the following support ticket content and suggest a category and a technician to assign to the ticket.
  Also, provide a confidence level (0-1) for your suggestions and reasoning behind your suggestions.

  Ticket Content: {{{ticketContent}}}

  Respond in the following JSON format:
  {
    "suggestedCategory": "The AI suggested category",
    "suggestedTechnician": "The AI suggested technician",
    "confidenceLevel": 0.8, // Confidence level between 0 and 1
    "reasoning": "The AI reasoning behind the suggestion"
  }`,
});

const analyzeTicketFlow = ai.defineFlow(
  {
    name: 'analyzeTicketFlow',
    inputSchema: AnalyzeTicketInputSchema,
    outputSchema: AnalyzeTicketOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
