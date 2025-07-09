import { config } from 'dotenv';
config();

import '@/ai/flows/ticket-insights.ts';
import '@/ai/flows/ai-assistant-crud.ts';
import '@/ai/flows/asset-health-check.ts';
import '@/ai/flows/script-generation.ts';
import '@/ai/flows/ticket-summary.ts';
import '@/ai/flows/suggested-reply.ts';
import '@/ai/flows/proactive-kb-search.ts';
import '@/ai/flows/client-insights.ts';
import '@/ai/flows/knowledge-base-article-generation.ts';
import '@/ai/flows/portal-chat.ts';
import '@/ai/flows/text-to-speech.ts';
