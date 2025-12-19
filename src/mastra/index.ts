import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), 'config.env') });
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { berkshireAgent } from './agents/berkshireAgent.js';
import { berkshireVector } from './vectorStore.js';

export const mastra = new Mastra({
  agents: { berkshireAgent },
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  vectors: {
    berkshireVector,
  },
});
