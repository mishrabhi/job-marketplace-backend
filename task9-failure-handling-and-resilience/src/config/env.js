import dotenv from 'dotenv';
import z from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3009'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  RAZORPAY_KEY_ID: z.string(),
  RAZORPAY_KEY_SECRET: z.string(),
  RAZORPAY_WEBHOOK_SECRET: z.string(),
  STUCK_PAYMENT_THRESHOLD_MINUTES: z.string().transform(Number).default('30'),
  STUCK_AUTHORIZED_THRESHOLD_MINUTES: z.string().transform(Number).default('15'),
  WEBHOOK_MAX_RETRY_ATTEMPTS: z.string().transform(Number).default('5')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export default parsed.data;