import dotenv from 'dotenv';
dotenv.config({ path: 'config.env' });
import { berkshireAgent } from './mastra/agents/berkshireAgent.js';

async function main() {
    console.log('Testing Berkshire Agent...');

    const query = "What is Warren Buffett's view on inflation?";
    console.log(`Query: ${query}`);

    try {
        const response = await berkshireAgent.generate(query);
        console.log('Response:', response.text);
    } catch (e) {
        console.error('Error querying agent:', e);
    }
}

main();
