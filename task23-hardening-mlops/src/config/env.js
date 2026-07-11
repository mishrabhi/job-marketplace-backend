import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3009'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  GLOBAL_RATE_LIMIT_MAX: z.string().transform(Number).default('100'),
  GLOBAL_RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('60000')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Environment Context Error:', JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const env = parsed.data;