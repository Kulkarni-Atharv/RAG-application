import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    const dataDir = path.join(process.cwd(), 'data');
    // Ensure we are looking in the right place
    if (!fs.existsSync(dataDir)) {
        console.error(`Data directory not found at ${dataDir}`);
        process.exit(1);
    }

    const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.pdf'));
    console.log(`Found ${files.length} PDF files.`);

    const workerPath = path.join(__dirname, 'ingest_worker.js');
    console.log(`Worker path: ${workerPath}`);

    for (const file of files) {
        console.log('------------------------------------------------');
        console.log(`Starting worker for ${file}...`);
        const filePath = path.join(dataDir, file);

        try {
            // Run worker synchronously
            execSync(`node "${workerPath}" "${filePath}"`, {
                stdio: 'inherit', // Pipe output to parent
                cwd: process.cwd(),
                env: { ...process.env } // Pass env vars
            });
            console.log(`Worker finished for ${file}`);
        } catch (e) {
            console.error(`Worker failed for ${file}`);
            // Decide whether to stop or continue. Let's continue.
        }
    }
    console.log('------------------------------------------------');
    console.log('All files processed.');
}

main().catch(console.error);
