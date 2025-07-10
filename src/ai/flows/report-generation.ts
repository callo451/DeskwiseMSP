
'use server';
/**
 * @fileOverview An AI agent to generate report configurations from natural language.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReportFilterSchema = z.object({
  field: z.string().describe("The field to filter on (e.g., 'status', 'priority', 'client'). Must be a valid field from the list for the module."),
  operator: z.enum(['equals', 'not_equals', 'contains', 'greater_than', 'less_than']).describe("The filter operator."),
  value: z.string().describe("The value to filter by."),
});

const ReportConfigSchema = z.object({
  title: z.string().describe("A descriptive title for the report."),
  columns: z.array(z.string()).describe("The columns to display in the report. Must be from the available fields list."),
  filters: z.array(ReportFilterSchema).describe("An array of filters to apply to the data."),
  groupBy: z.string().optional().describe("The field to group the results by. Must be from the available fields list."),
  chartType: z.enum(['bar', 'line', 'pie', 'table_only']).describe("The suggested chart type for visualization."),
});

export type ReportConfig = z.infer<typeof ReportConfigSchema>;

const ReportGenerationInputSchema = z.object({
  query: z.string().describe("The user's natural language query for the report."),
  module: z.enum(['Tickets', 'Assets', 'Clients']).describe("The module to generate the report for."),
});

export type ReportGenerationInput = z.infer<typeof ReportGenerationInputSchema>;


export async function generateReportConfig(input: ReportGenerationInput): Promise<ReportConfig> {
  return generateReportConfigFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReportConfigPrompt',
  input: {schema: ReportGenerationInputSchema},
  output: {schema: ReportConfigSchema},
  prompt: `You are an expert data analyst who creates report configurations from user requests.
The user wants a report for the "{{{module}}}" module.

Based on the module, here are the available fields and their types:
{{#if module == 'Tickets'}}
- id (string), subject (string), client (string), assignee (string), priority (string), status (string), createdDate (date), queue (string)
{{/if}}
{{#if module == 'Assets'}}
- id (string), name (string), client (string), type (string), status (string), isSecure (boolean), lastSeen (date), os (string)
{{/if}}
{{#if module == 'Clients'}}
- id (string), name (string), industry (string), status (string), contacts (number), tickets (number)
{{/if}}

Parse the user's query and generate a JSON object matching the ReportConfig schema.
- **title**: Create a concise, descriptive title for the report based on the query.
- **columns**: Select relevant columns from the available fields. If the user asks to group by a field, you MUST include that field and a count/metric column (e.g., for "tickets per client", columns should be ['client', 'count']). Default to all available fields if not specified.
- **filters**: Identify any filters. For example, "critical tickets" means a filter where 'priority' equals 'Critical'. "for TechCorp" means a filter where 'client' equals 'TechCorp'. "in the last 7 days" implies a date filter on 'createdDate'.
- **groupBy**: If the user asks to aggregate or group data (e.g., "by assignee", "per client"), specify the field here.
- **chartType**: Suggest a suitable chart type. Use 'bar' for counts by category, 'pie' for proportions of a whole (e.g., tickets by priority), 'line' for trends over time, and 'table_only' if no chart is suitable (e.g., just a list of tickets).

User Query: "{{{query}}}"
`,
});

const generateReportConfigFlow = ai.defineFlow(
  {
    name: 'generateReportConfigFlow',
    inputSchema: ReportGenerationInputSchema,
    outputSchema: ReportConfigSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);

