
'use server';
/**
 * @fileOverview An AI agent to generate insights from report data.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const ReportInsightsInputSchema = z.object({
  reportTitle: z.string().describe("The title of the report being analyzed."),
  reportData: z.string().describe("The report data as a JSON string."),
});

export type ReportInsightsInput = z.infer<typeof ReportInsightsInputSchema>;

export const ReportInsightsOutputSchema = z.object({
    insights: z.array(z.string()).describe("A list of 2-3 bullet-point insights derived from the report data."),
});
export type ReportInsightsOutput = z.infer<typeof ReportInsightsOutputSchema>;

export async function generateReportInsights(input: ReportInsightsInput): Promise<ReportInsightsOutput> {
  return generateReportInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReportInsightsPrompt',
  input: {schema: ReportInsightsInputSchema},
  output: {schema: ReportInsightsOutputSchema},
  prompt: `You are an expert business analyst for a Managed Service Provider (MSP).
Your task is to analyze a report and provide a few key, actionable insights for an administrator.

Report Title: "{{{reportTitle}}}"

Report Data (JSON format):
\`\`\`json
{{{reportData}}}
\`\`\`

Based on the data, generate 2-3 concise, bullet-pointed insights. Focus on trends, outliers, or potential areas of concern or opportunity.
For example, if you see one client has significantly more tickets than others, point that out. If you see a spike in critical tickets, mention it.
Be specific and reference data points where possible.
`,
});

const generateReportInsightsFlow = ai.defineFlow(
  {
    name: 'generateReportInsightsFlow',
    inputSchema: ReportInsightsInputSchema,
    outputSchema: ReportInsightsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
