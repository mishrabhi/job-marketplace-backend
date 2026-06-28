import dotenv from 'dotenv';
import z from ('zod');

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3009'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  RAZORPAY_KEY_ID: z.string(),
  RAZORPAY_KEY_SECRET: z.string(),
  // Real Money vs Test Mode Switch 
  IS_REAL_MONEY_MODE: z.string().transform(val => val === 'true').default('false')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Configuration Validation Error:', JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export default envSchema