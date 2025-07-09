'use server';
/**
 * @fileOverview Generates scripts in various programming languages using AI.
 *
 * - generateScript - A function that handles the script generation process.
 * - GenerateScriptInput - The input type for the generateScript function.
 * - GenerateScriptOutput - The return type for the generateScript function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateScriptInputSchema = z.object({
  prompt: z.string().describe('The user\'s request for the script to be generated.'),
  language: z.string().describe('The programming language for the script (e.g., PowerShell, Bash, Python).'),
});
export type GenerateScriptInput = z.infer<typeof GenerateScriptInputSchema>;

const GenerateScriptOutputSchema = z.object({
  script: z.string().describe('The generated script code.'),
});
export type GenerateScriptOutput = z.infer<typeof GenerateScriptOutputSchema>;

export async function generateScript(input: GenerateScriptInput): Promise<GenerateScriptOutput> {
  return generateScriptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateScriptPrompt',
  input: {schema: GenerateScriptInputSchema},
  output: {schema: GenerateScriptOutputSchema},
  prompt: `You are an expert script writer for IT administrators and Managed Service Providers (MSPs).
Your task is to generate a clean, efficient, and well-documented script based on the user's request.

The script must be written in the following language: {{{language}}}

User's request: "{{{prompt}}}"

Please provide only the raw script code in the 'script' field of the JSON output. Do not include any explanations, introductory text, or markdown code fences (like \`\`\`) around the code. The output should be ready to be copied and pasted directly into a file.
`,
});

const generateScriptFlow = ai.defineFlow(
  {
    name: 'generateScriptFlow',
    inputSchema: GenerateScriptInputSchema,
    outputSchema: GenerateScriptOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
