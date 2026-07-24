import { z } from 'zod';

export const recordOutcomeSchema = z.object({
  flag_key: z.string().min(1, { message: "Flag key identifier required" }),
  user_id: z.string().uuid({ message: "Valid user ID UUID required" }),
  tenant_id: z.string().uuid({ message: "Valid tenant ID UUID required" }),
  assigned_variant: z.string().min(1, { message: "Assigned variant string required" }),
  outcome_event_type: z.string().min(1, { message: "Outcome event type description required" }),
  idempotency_key: z.string().min(1, { message: "Idempotency key parameter required" })
});

export const getReadoutSchema = z.object({
  flag_key: z.string().min(1, { message: "Flag key required for experiment readout" }),
  tenant_id: z.string().uuid({ message: "Valid tenant ID required for isolation" })
});

export const cleanupZombieFlagsSchema = z.object({
  performed_by: z.string().uuid({ message: "Valid admin executor ID required" })
});