import dotenv from 'dotenv';
dotenv.config({ path: 'config.env' });
// import { MDocument } from '@mastra/rag';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

function chunkText(text: string, size: number = 1000, overlap: number = 200): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
        let end = start + size;

        // If we are not at the end of the text, try to find a break point
        if (end < text.length) {
            // Try to split at paragraph
            let breakPoint = text.lastIndexOf('\n\n', end);
            if (breakPoint === -1 || breakPoint < start) {
                // Try to split at newline
                breakPoint = text.lastIndexOf('\n', end);
            }
            if (breakPoint === -1 || breakPoint < start) {
                // Try to split at space
                breakPoint = text.lastIndexOf(' ', end);
            }

            if (breakPoint !== -1 && breakPoint > start) {
                end = breakPoint;
            }
        }

        chunks.push(text.substring(start, end).trim());
        start = end - overlap;

        // Prevent infinite loop if overlap is too large or no progress
        if (start >= end) {
            start = end;
        }
    }

    return chunks;
}

async function ingestDocuments() {
    const dataDir = path.join(process.cwd(), 'data');
    const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.pdf'));

    console.log(`Found ${files.length} PDF files:`, files);

    // Dynamic import to ensure dotenv loads first
    const { berkshireVector } = await import('./vectorStore.js');
    const vectorStore = berkshireVector;

    if (!vectorStore) {
        throw new Error('Vector store not configured');
    }

    const indexName = 'berkshire_embeddings';

    try {
        // Attempt to fix createIndex argument based on lint error
        // @ts-ignore
        await vectorStore.createIndex(indexName, 1536);
        console.log(`Created index ${indexName}`);
    } catch (e) {
        console.log(`Index ${indexName} might already exist or error:`, e);
    }

    for (const file of files) {
        console.log(`Processing ${file}...`);
        const filePath = path.join(dataDir, file);
        const buffer = fs.readFileSync(filePath);
        console.log(`Read buffer for ${file}, size: ${buffer.length}`);

        let text = '';
        try {
            console.log('Calling pdf()...');
            const data = await pdf(buffer);
            console.log('PDF call finished');
            text = data.text;
        } catch (e) {
            console.error('Catch block entered');
            console.error('PDF parsing error for file ' + file + ':', e);
            continue;
        }

        // Use custom chunking instead of MDocument
        console.log('Chunking document...');
        const chunks = chunkText(text, 1000, 200);
        console.log(`Generated ${chunks.length} chunks for ${file}`);

        // Explicitly call garbage collection
        if (global.gc) {
            console.log('Running GC...');
            global.gc();
        }

        /*
        const batchSize = 100;
        for (let i = 0; i < chunks.length; i += batchSize) {
          const batch = chunks.slice(i, i + batchSize);
          // batch is array of strings
          
          const embeddingResponse = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: batch,
          });
    
          const vectors = (embeddingResponse as any).data.map((d: any, idx: number) => ({
            id: `${file}-${i + idx}`,
            vector: d.embedding,
            payload: {
              text: batch[idx],
              source: file,
              year: file.replace('.pdf', ''),
            },
          }));
    
          await vectorStore.upsert({
            indexName,
            vectors: vectors as any,
          });
          console.log(`Upserted batch ${i / batchSize + 1} for ${file}`);
        }
        */
    }
}

ingestDocuments().catch(console.error);
