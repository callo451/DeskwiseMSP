'use server';
/**
 * @fileOverview An AI agent to generate contextual replies for IT support tickets.
 *
 * - generateSuggestedReply - A function that generates a reply.
 * - SuggestedReplyInput - The input type for the generateSuggestedReply function.
 * - SuggestedReplyOutput - The return type for the generateSuggestedReply function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestedReplyInputSchema = z.object({
  replyType: z.enum(['acknowledgement', 'more_info', 'resolution_confirmation']).describe('The type of reply to generate.'),
  ticketContext: z.string().describe('The full context of the ticket, including subject, description, and activity.'),
});
export type SuggestedReplyInput = z.infer<typeof SuggestedReplyInputSchema>;

const SuggestedReplyOutputSchema = z.object({
  reply: z.string().describe('The generated reply text.'),
});
export type SuggestedReplyOutput = z.infer<typeof SuggestedReplyOutputSchema>;

export async function generateSuggestedReply(input: SuggestedReplyInput): Promise<SuggestedReplyOutput> {
  return generateSuggestedReplyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestedReplyPrompt',
  input: {schema: SuggestedReplyInputSchema},
  output: {schema: SuggestedReplyOutputSchema},
  prompt: `You are an expert IT Help Desk professional. Your tone is helpful, empathetic, and concise.
Based on the provided ticket context, generate a suitable reply for the requested type.

**Ticket Context:**
{{{ticketContext}}}

**Reply Type Requested:** {{{replyType}}}

{{#if replyType == 'acknowledgement'}}
Generate a reply acknowledging receipt of the ticket and letting the user know it's being looked into. Mention the ticket ID if available.
{{/if}}

{{#if replyType == 'more_info'}}
Generate a polite reply asking the user for more specific information that might be needed to solve the problem (e.g., asking for screenshots, error messages, or steps to reproduce the issue).
{{/if}}

{{#if replyType == 'resolution_confirmation'}}
Generate a reply informing the user that the issue is believed to be resolved and politely asking them to confirm if everything is working as expected on their end.
{{/if}}

Provide only the text for the reply.
`,
});

const generateSuggestedReplyFlow = ai.defineFlow(
  {
    name: 'generateSuggestedReplyFlow',
    inputSchema: SuggestedReplyInputSchema,
    outputSchema: SuggestedReplyOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
