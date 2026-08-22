import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url().default('postgresql://postgres:postgres@localhost:5432/placemux_db'),
  DB_POOL_MAX: z.string().transform(Number).default('50'), // Tuned pool limit[cite: 15]
  DB_IDLE_TIMEOUT_MS: z.string().transform(Number).default('10000'),
  DB_CONNECTION_TIMEOUT_MS: z.string().transform(Number).default('5000'),
  EVENT_LOOP_MAX_LAG_MS: z.string().transform(Number).default('70'), // Load shedding threshold[cite: 15]
  MAX_IN_FLIGHT_REQUESTS: z.string().transform(Number).default('300')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Environment Parsing Error:', JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const env = parsed.data;