import { z } from 'zod';

/**
 * Forgiving validation schemas: Normalizes inputs (trimmers, lowercase) server-side
 */
export const fastSignupSchema = z.object({
  email: z.string()
    .trim()                                            // Forgiving: Strips accidental leading/trailing spaces
    .toLowerCase()                                     // Normalizes casing
    .email({ message: "Please provide a valid email address format (e.g., user@domain.com)" }),
  full_name: z.string().trim().min(2, { message: "Full name must be at least 2 characters long" }),
  tenant_id: z.string().uuid({ message: "Valid tenant identifier UUID required" }),
  idempotency_key: z.string().min(1, { message: "Idempotency key context required" })
});

export const onboardingProfileSchema = z.object({
  user_id: z.string().uuid({ message: "Valid user ID required" }),
  tenant_id: z.string().uuid({ message: "Valid tenant ID required" }),
  graduation_year: z.number().int().min(2020).max(2035),
  academic_dept: z.string().trim().min(1, { message: "Academic department description required" }),
  idempotency_key: z.string().min(1, { message: "Idempotency key required" })
});

export const logActivationMetricSchema = z.object({
  tenant_id: z.string().uuid(),
  user_id: z.string().uuid(),
  activation_stage: z.enum(['signup', 'onboarding_profile', 'first_apply']),
  latency_ms: z.number().int().nonnegative(),
  is_success: z.boolean(),
  error_code: z.string().optional(),
  idempotency_key: z.string().min(1)
});