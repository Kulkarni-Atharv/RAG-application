import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { berkshireVector } from '../vectorStore.js';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const vectorSearchTool = createTool({
    id: 'vectorSearch',
    description: 'Search for information in Warren Buffett\'s shareholder letters',
    inputSchema: z.object({
        query: z.string().describe('The search query to find relevant information'),
        year: z.string().optional().describe('Filter by specific year if needed'),
    }),
    execute: async ({ context }) => {
        const { query, year } = context;
        const vectorStore = berkshireVector;

        if (!vectorStore) {
            throw new Error('Vector store not configured');
        }

        const embeddingResponse = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: query,
        });
        const queryVector = embeddingResponse.data[0].embedding;

        const results = await (vectorStore as any).query(queryVector, {
            indexName: 'berkshire_embeddings',
            topK: 5,
            filter: year ? { year: year } : undefined,
        });

        return results.map((r: any) => ({
            text: r.payload.text,
            source: r.payload.source,
            year: r.payload.year,
            score: r.score,
        }));
    },
});
