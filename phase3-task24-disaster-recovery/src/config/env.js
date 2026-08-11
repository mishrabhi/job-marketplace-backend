import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3009'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  RTO_TARGET_SECONDS: z.string().transform(Number).default('300'),
  RPO_TARGET_SECONDS: z.string().transform(Number).default('60')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Environment Parsing Error:', JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const env = parsed.data;