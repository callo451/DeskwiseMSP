'use server';
/**
 * @fileOverview An AI agent to analyze asset health and provide recommendations.
 *
 * - checkAssetHealth - A function that handles the asset health analysis.
 * - AssetHealthCheckInput - The input type for the checkAssetHealth function.
 * - AssetHealthCheckOutput - The return type for the checkAssetHealth function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssetHealthCheckInputSchema = z.object({
  name: z.string(),
  status: z.string(),
  isSecure: z.boolean(),
  cpuUsage: z.number().describe('CPU usage percentage'),
  ramUsage: z.number().describe('RAM usage percentage'),
  diskUsage: z.number().describe('Disk usage percentage'),
  activityLogs: z.array(z.object({ timestamp: z.string(), activity: z.string() })).describe('Recent activity logs'),
});
export type AssetHealthCheckInput = z.infer<typeof AssetHealthCheckInputSchema>;

const AssetHealthCheckOutputSchema = z.object({
  overallStatus: z.enum(['Healthy', 'Needs Attention', 'Critical']).describe('A one-word summary of the asset\'s health.'),
  analysis: z.array(z.string()).describe('A bulleted list of observations about the asset\'s health and performance.'),
  recommendations: z.array(z.string()).describe('A bulleted list of actionable recommendations for the IT administrator.'),
});
export type AssetHealthCheckOutput = z.infer<typeof AssetHealthCheckOutputSchema>;

export async function checkAssetHealth(input: AssetHealthCheckInput): Promise<AssetHealthCheckOutput> {
  return checkAssetHealthFlow(input);
}

const prompt = ai.definePrompt({
  name: 'checkAssetHealthPrompt',
  input: {schema: AssetHealthCheckInputSchema},
  output: {schema: AssetHealthCheckOutputSchema},
  prompt: `You are an expert IT Systems Administrator and performance analyst.
You are tasked with analyzing the health of a device based on the provided data.

Analyze the following asset information:
- Name: {{{name}}}
- Status: {{{status}}}
- Security Status: {{#if isSecure}}Secured{{else}}At Risk{{/if}}
- CPU Usage: {{{cpuUsage}}}%
- RAM Usage: {{{ramUsage}}}%
- Disk Usage: {{{diskUsage}}}%
- Recent Activity Logs:
{{#each activityLogs}}
  - {{this.timestamp}}: {{this.activity}}
{{/each}}

Based on your analysis, provide a concise health check report.
- The overall status should be "Healthy" if there are no pressing issues.
- The status should be "Needs Attention" if there are minor issues or warnings (e.g., high-but-not-critical resource usage, non-critical warnings in logs).
- The status should be "Critical" if the device is offline, security is at risk, or there are critical errors in the logs (e.g., 'exceeded threshold', 'offline').

Provide a brief analysis of the current state and a few actionable recommendations. The analysis and recommendations should be in bullet points.
`,
});

const checkAssetHealthFlow = ai.defineFlow(
  {
    name: 'checkAssetHealthFlow',
    inputSchema: AssetHealthCheckInputSchema,
    outputSchema: AssetHealthCheckOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
