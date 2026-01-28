import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, tool, convertToModelMessages, stepCountIs } from 'ai';
import { z } from 'zod';
import { searchProducts, getCatalogSummary } from '@/lib/products';

import dbConnect from '@/lib/mongodb';
import Prompt from '@/models/Prompt';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const DEFAULT_SYSTEM_PROMPT = `You are a helpful and knowledgeable shopping assistant.
        You help users find products from our catalog.
        You can search for products using the 'searchProducts' tool.
        
        CRITICAL: When using 'searchProducts', only provide the core keywords (e.g., "black t-shirt", "running shoes"). 
        Do NOT include conversational phrases like "show me", "find", or "I'm looking for".
        
        When you find products, display them to the user and ask if they want to know more details.
        Be concise, friendly, and professional.
        If you don't find any products, suggest alternatives or ask clarifying questions.
        Always use the 'searchProducts' tool if the user asks for a product, do not make up products.`;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY;

        console.log('[PEEQ-DIAGNOSTIC] Environment Check:', {
            hasGenerativeAiKey: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
            hasGoogleApiKey: !!process.env.GOOGLE_API_KEY,
            hasApiKey: !!apiKey,
            hasMongoUri: !!process.env.MONGODB_URI,
            nodeEnv: process.env.NODE_ENV
        });

        if (!apiKey) {
            console.error('[PEEQ-DIAGNOSTIC] API Key is missing in environment');
            return new Response('[ERR-001] API Key missing in production environment. Please check Vercel Project Settings.', { status: 500 });
        }

        // Fetch dynamic system prompt from MongoDB
        let systemPrompt = DEFAULT_SYSTEM_PROMPT;
        try {
            await dbConnect();
            const activePrompt = await Prompt.findOne({ isActive: true });
            if (activePrompt) {
                systemPrompt = activePrompt.content;
                console.log('Using dynamic system prompt version:', activePrompt.version);
            }
        } catch (dbError) {
            console.error('Failed to fetch dynamic prompt, using default:', dbError);
        }

        const googleProvider = createGoogleGenerativeAI({
            apiKey: apiKey,
        });

        const result = streamText({
            model: googleProvider('gemini-2.0-flash'),
            stopWhen: stepCountIs(5),
            messages: await convertToModelMessages(messages),
            system: systemPrompt,
            tools: {
                searchProducts: tool({
                    description: 'Search for products in the catalog using keywords (e.g., "black tshirt")',
                    inputSchema: z.object({
                        query: z.string().describe('The search keywords only, no conversational phrases'),
                    }),
                    execute: async ({ query }: { query: string }) => {
                        const products = await searchProducts(query);
                        return products;
                    },
                }),
                getCatalogSummary: tool({
                    description: 'Get a summary of the available product collections/brands and total product counts.',
                    inputSchema: z.object({}),
                    execute: async () => {
                        const summary = await getCatalogSummary();
                        return summary;
                    },
                }),
            },
        });

        console.log('[PEEQ-DIAGNOSTIC] Dynamic System Prompt:', systemPrompt);
        return result.toUIMessageStreamResponse();
    } catch (error) {
        console.error('Error in API route:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
