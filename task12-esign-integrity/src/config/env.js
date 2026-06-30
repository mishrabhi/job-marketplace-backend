import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3009'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  CRYPTOGRAPHIC_INTEGRITY_SALT: z.string().default('placemux-tamper-evident-salt-2026')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Task 12 Configuration Parsing Error:', JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const env = parsed.data;