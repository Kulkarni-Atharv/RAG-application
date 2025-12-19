import dotenv from 'dotenv';
dotenv.config({ path: 'config.env' });
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
import OpenAI from 'openai';

// simple chunking function to avoid external dependencies
function chunkText(text: string, size: number = 1000, overlap: number = 200): string[] {
    const chunks: string[] = [];
    let start = 0;
    while (start < text.length) {
        let end = start + size;
        if (end < text.length) {
            let breakPoint = text.lastIndexOf('\n\n', end);
            if (breakPoint === -1 || breakPoint < start) breakPoint = text.lastIndexOf('\n', end);
            if (breakPoint === -1 || breakPoint < start) breakPoint = text.lastIndexOf(' ', end);
            if (breakPoint !== -1 && breakPoint > start) end = breakPoint;
        }
        chunks.push(text.substring(start, end).trim());
        start = end - overlap;
        if (start >= end) start = end;
    }
    return chunks;
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function processFile(filePath: string) {
    const fileName = path.basename(filePath);
    console.log(`[Worker] Processing ${fileName}...`);

    // Dynamic import
    const { berkshireVector } = await import('./vectorStore.js');
    const vectorStore = berkshireVector;
    if (!vectorStore) throw new Error('Vector store not configured');
    const indexName = 'berkshire_embeddings';

    // Parse PDF
    const buffer = fs.readFileSync(filePath);
    let text = '';
    try {
        const data = await pdf(buffer);
        text = data.text;
    } catch (e) {
        console.error(`[Worker] Error parsing PDF ${fileName}:`, e);
        process.exit(1);
    }

    // Chunk
    console.log(`[Worker] Chunking ${fileName}...`);
    const chunks = chunkText(text, 1000, 200);
    console.log(`[Worker] Generated ${chunks.length} chunks.`);

    // Embed and Upsert
    const batchSize = 50; // Smaller batch size for safety
    for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        try {
            const embeddingResponse = await openai.embeddings.create({
                model: 'text-embedding-3-small',
                input: batch,
            });

            const vectors = (embeddingResponse as any).data.map((d: any, idx: number) => ({
                id: `${fileName}-${i + idx}`,
                vector: d.embedding,
                payload: {
                    text: batch[idx],
                    source: fileName,
                    year: fileName.replace('.pdf', ''),
                },
            }));

            await vectorStore.upsert({
                indexName,
                vectors: vectors as any,
            });
            console.log(`[Worker] Upserted batch ${Math.floor(i / batchSize) + 1} for ${fileName}`);
        } catch (e) {
            console.error(`[Worker] Error embedding/upserting batch for ${fileName}:`, e);
            // Don't exit, try next batch? or exit? Better to fail file for now.
            // process.exit(1); 
        }
    }
    console.log(`[Worker] Finished ${fileName}`);
}

const targetFile = process.argv[2];
if (!targetFile) {
    console.error('No file provided');
    process.exit(1);
}

processFile(targetFile).catch(e => {
    console.error(e);
    process.exit(1);
});
