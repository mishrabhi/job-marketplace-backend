import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url({ message: "Valid PostgreSQL connection URL required" }),
  DB_POOL_MAX: z.string().transform(Number).default('20'),
  DB_IDLE_TIMEOUT_MS: z.string().transform(Number).default('30000'),
  DB_CONNECTION_TIMEOUT_MS: z.string().transform(Number).default('5000')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Environment Parsing Error:', JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const env = parsed.data;