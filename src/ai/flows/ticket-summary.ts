'use server';
/**
 * @fileOverview An AI agent to summarize IT support tickets.
 *
 * - summarizeTicket - A function that generates a ticket summary.
 * - SummarizeTicketInput - The input type for the summarizeTicket function.
 * - SummarizeTicketOutput - The return type for the summarizeTicket function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeTicketInputSchema = z.object({
  ticketContext: z.string().describe('The full context of the ticket, including subject, description, and activity log.'),
});
export type SummarizeTicketInput = z.infer<typeof SummarizeTicketInputSchema>;

const SummarizeTicketOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the ticket in a few bullet points.'),
});
export type SummarizeTicketOutput = z.infer<typeof SummarizeTicketOutputSchema>;

export async function summarizeTicket(input: SummarizeTicketInput): Promise<SummarizeTicketOutput> {
  return summarizeTicketFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeTicketPrompt',
  input: {schema: SummarizeTicketInputSchema},
  output: {schema: SummarizeTicketOutputSchema},
  prompt: `You are an AI assistant for a Managed Service Provider (MSP). Your task is to read a support ticket and provide a quick, scannable summary for a technician who is new to the ticket.

Analyze the following ticket context:
{{{ticketContext}}}

Generate a summary that includes:
- The core problem reported by the user.
- Key actions taken by technicians so far.
- The current status or next step.

Present the summary as a few concise bullet points in a single string.
`,
});

const summarizeTicketFlow = ai.defineFlow(
  {
    name: 'summarizeTicketFlow',
    inputSchema: SummarizeTicketInputSchema,
    outputSchema: SummarizeTicketOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
