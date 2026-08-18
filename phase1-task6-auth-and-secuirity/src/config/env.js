import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url({ message: "Valid PostgreSQL connection URL required" }),
  JWT_SECRET: z.string().min(16, { message: "JWT secret must be at least 16 characters" }),
  JWT_EXPIRES_IN: z.string().default('1h'),
  BCRYPT_SALT_ROUNDS: z.string().transform(Number).default('12'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 mins
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Environment Parsing Error:', JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const env = parsed.data;