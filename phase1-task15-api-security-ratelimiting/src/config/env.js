import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  REDIS_HOST: z.string().default('127.0.0.1'),
  REDIS_PORT: z.string().transform(Number).default('6379'),
  JWT_SECRET: z.string().default('super_secret_jwt_encryption_key_2026_placemux'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000,http://localhost:5173')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Environment Parsing Error:', JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const env = parsed.data;