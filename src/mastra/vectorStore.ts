import { PgVector } from '@mastra/pg';

export const berkshireVector = new PgVector({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/mastra',
});
