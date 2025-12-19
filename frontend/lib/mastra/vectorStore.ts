import { PgVector } from '@mastra/pg';

if (!process.env.POSTGRES_CONNECTION_STRING) {
    throw new Error('POSTGRES_CONNECTION_STRING is not defined');
}

export const berkshireVector = new PgVector({
    connectionString: process.env.POSTGRES_CONNECTION_STRING,
});
