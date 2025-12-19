import dotenv from 'dotenv';
import path from 'path';
const result = dotenv.config({ path: path.resolve(process.cwd(), '.env') });
if (result.error) {
    console.error('Dotenv error:', result.error);
}
console.log('Parsed:', result.parsed);
console.log('POSTGRES_CONNECTION_STRING:', process.env.POSTGRES_CONNECTION_STRING);
