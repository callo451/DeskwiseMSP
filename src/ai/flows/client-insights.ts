'use server';
/**
 * @fileOverview An AI agent to analyze client health and suggest business opportunities.
 *
 * - generateClientInsights - A function that handles the client analysis process.
 * - ClientInsightsInput - The input type for the generateClientInsights function.
 * - ClientInsightsOutput - The return type for the generateClientInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClientInsightsInputSchema = z.object({
  clientName: z.string(),
  totalTickets: z.number(),
  openTickets: z.number(),
  overdueTickets: z.number(),
  totalAssets: z.number(),
  assetsAtRisk: z.number(),
  ticketSubjects: z.array(z.string()).describe("A list of subjects from recent tickets."),
});
export type ClientInsightsInput = z.infer<typeof ClientInsightsInputSchema>;

const ClientInsightsOutputSchema = z.object({
  healthStatus: z.enum(['Healthy', 'Needs Attention', 'At Risk']).describe("A one-word summary of the client's overall health."),
  summary: z.string().describe("A brief paragraph summarizing the client's current situation, sentiment, and any recurring problems."),
  opportunities: z.array(z.string()).describe("A bulleted list of actionable business opportunities or recommendations for the client (e.g., hardware upgrades, training, new services)."),
});
export type ClientInsightsOutput = z.infer<typeof ClientInsightsOutputSchema>;

export async function generateClientInsights(input: ClientInsightsInput): Promise<ClientInsightsOutput> {
  return clientInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'clientInsightsPrompt',
  input: {schema: ClientInsightsInputSchema},
  output: {schema: ClientInsightsOutputSchema},
  prompt: `You are an expert Account Manager for a Managed Service Provider (MSP). Your job is to analyze client data to determine their overall health and identify potential business opportunities.

Analyze the following data for the client: {{{clientName}}}
- Total Tickets: {{{totalTickets}}}
- Open Tickets: {{{openTickets}}}
- Overdue Tickets: {{{overdueTickets}}}
- Total Assets: {{{totalAssets}}}
- Assets with Security Risks: {{{assetsAtRisk}}}
- Recent Ticket Subjects:
{{#each ticketSubjects}}
  - {{{this}}}
{{/each}}

Based on this data:
1.  **Determine the Health Status**:
    - 'Healthy': Low number of open/overdue tickets, few at-risk assets. No major recurring issues.
    - 'Needs Attention': A growing number of tickets, some overdue tickets, or a few at-risk assets. Might have recurring minor issues.
    - 'At Risk': High number of critical/overdue tickets, many at-risk assets, clear signs of recurring major problems (e.g., repeated "server down" tickets).
2.  **Write a Summary**: Provide a brief, insightful summary of the client's situation. Mention their sentiment if it can be inferred from the ticket subjects (e.g., frustration from repeated issues).
3.  **Identify Opportunities**: Suggest concrete, actionable opportunities. For example, if you see many old assets, suggest a hardware refresh project. If you see many "how-to" questions, suggest a training session. If you see security issues, suggest a security audit or enhanced protection plan.

Provide a concise and professional analysis.
`,
});

const clientInsightsFlow = ai.defineFlow(
  {
    name: 'clientInsightsFlow',
    inputSchema: ClientInsightsInputSchema,
    outputSchema: ClientInsightsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
