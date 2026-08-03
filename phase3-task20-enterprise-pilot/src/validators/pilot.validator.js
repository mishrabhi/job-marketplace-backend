import { z } from 'zod';

export const provisionPilotTenantSchema = z.object({
  tenant_id: z.string().uuid({ message: "Valid tenant ID UUID required" }),
  pilot_name: z.string().min(2, { message: "Pilot organization name required" }),
  sso_login_url: z.string().url({ message: "Valid SSO login URL required" }),
  ats_partner_key: z.string().min(1, { message: "ATS integration key required" })
});

export const runPilotJourneySchema = z.object({
  tenant_id: z.string().uuid({ message: "Valid tenant ID UUID required" }),
  candidate_id: z.string().uuid({ message: "Valid candidate ID UUID required" }),
  action_type: z.enum(['SSO_LOGIN', 'SCIM_PROVISION', 'JOB_EXPORT', 'ATS_WEBHOOK_DISPATCH']),
  idempotency_key: z.string().min(1, { message: "Idempotency key parameter required" })
});

export const logRemediationItemSchema = z.object({
  tenant_id: z.string().uuid({ message: "Valid tenant ID UUID required" }),
  gap_title: z.string().min(5, { message: "Gap title must be at least 5 characters long" }),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  category: z.string().min(2, { message: "Category classification required" }),
  idempotency_key: z.string().min(1, { message: "Idempotency key parameter required" })
});