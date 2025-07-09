import { config } from 'dotenv';
config();

import '@/ai/flows/ticket-insights.ts';
import '@/ai/flows/ai-assistant-crud.ts';
import '@/ai/flows/knowledge-base-article-generation.ts';
import '@/ai/flows/asset-health-check.ts';
import '@/ai/flows/script-generation.ts';
