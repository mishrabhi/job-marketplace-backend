import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  USE_MOCK_DATA: z.string().transform(v => v === 'true').default('true')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Environment parsing error:', JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const env = parsed.data;