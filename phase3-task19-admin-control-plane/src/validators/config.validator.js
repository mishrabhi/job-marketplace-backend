import { z } from 'zod';

/**
 * Strict Guardrails and Validation on every config change[cite: 17]
 */
export const updateTenantConfigSchema = z.object({
  tenant_id: z.string().uuid({ message: "Valid tenant ID UUID required" }),
  admin_user_id: z.string().uuid({ message: "Valid admin user ID UUID required" }),
  primary_color_hex: z.string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { message: "Guardrail Breach: Invalid primary color hex format (e.g. #1E40AF)" }),
  company_logo_url: z.string().url({ message: "Guardrail Breach: Company logo URL must be a valid URL" }),
  custom_domain: z.string().optional(),
  max_concurrent_jobs: z.number().int().min(1).max(500, { message: "Guardrail Breach: max_concurrent_jobs must be between 1 and 500" }),
  rate_limit_per_min: z.number().int().min(10).max(10000, { message: "Guardrail Breach: rate_limit_per_min must be between 10 and 10000" }),
  reason_notes: z.string().min(5, { message: "Reason notes must be at least 5 characters long for audit logging" }),
  idempotency_key: z.string().min(1, { message: "Idempotency key required" })
});

export const rollbackConfigSchema = z.object({
  tenant_id: z.string().uuid({ message: "Valid tenant ID UUID required" }),
  admin_user_id: z.string().uuid({ message: "Valid admin user ID UUID required" }),
  target_audit_log_id: z.string().uuid({ message: "Valid target audit log UUID required for rollback" }),
  reason_notes: z.string().min(5, { message: "Reason notes required for rollback action" }),
  idempotency_key: z.string().min(1, { message: "Idempotency key required" })
});