import { z } from 'zod';

export const triggerCutoverSchema = z.object({
  verified_by: z.string().uuid({ message: "Valid administrator/engineer identifier UUID required" }),
  checklist_snapshot: z.object({
    idempotency_keys_active: z.boolean(),
    tenant_isolation_verified: z.boolean(),
    gateway_webhooks_live: z.boolean(),
    dpdp_consent_depth_enforced: z.boolean()
  }, { message: "Launch checklist verification parameters are completely required" }),
  smoke_tests_passed: z.boolean().refine(val => val === true, {
    message: "Smoke tests must clear and pass green before live production cutover"[cite: 16]
  }),
  idempotency_key: z.string().min(1, { message: "Idempotency key parameter string required" })
});