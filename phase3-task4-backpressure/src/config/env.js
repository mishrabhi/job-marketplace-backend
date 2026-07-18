import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3009'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  OUTBOUND_CALL_TIMEOUT_MS: z.string().transform(Number).default('3000'),
  BREAKER_FAILURE_THRESHOLD: z.string().transform(Number).default('5'),
  BREAKER_COOLDOWN_MS: z.string().transform(Number).default('10000')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Configuration Validation Failure:', JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const env = parsed.data;