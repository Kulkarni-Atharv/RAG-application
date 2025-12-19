
import { spawn } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';

// Force load config.env
const result = dotenv.config({ path: path.resolve(process.cwd(), 'config.env') });

if (result.error) {
    console.error('Error loading config.env:', result.error);
}

console.log('Starting Mastra Dev (ESM Wrapper)...');
// Mask the key for logging safety, but confirm partial presence
const key = process.env.OPENAI_API_KEY;
console.log('API Key Status:', key ? `Present (${key.substring(0, 5)}...)` : 'MISSING');

const cmd = 'npx';
const child = spawn(cmd, ['mastra', 'dev'], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env } // Explicitly pass the environment
});

child.on('error', (err) => console.error('Failed to start mastra dev:', err));
child.on('close', (code) => console.log(`Mastra dev exited with code ${code}`));
