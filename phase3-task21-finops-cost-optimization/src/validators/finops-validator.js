import { z } from 'zod';

export const logWorkloadCostSchema = z.object({
  tenant_id: z.string().uuid({ message: "Valid tenant ID UUID required" }),
  operation_type: z.enum(['CANDIDATE_APPLICATION', 'SHORTLIST_RANKING', 'BATCH_EXPORT']),
  payload_bytes: z.number().int().nonnegative(),
  db_query_time_ms: z.number().int().nonnegative(),
  is_optimized: z.boolean().default(false),
  idempotency_key: z.string().min(1, { message: "Idempotency key parameter required" })
});

export const computeUnitEconomicsSchema = z.object({
  tenant_id: z.string().uuid({ message: "Valid tenant ID UUID required" }),
  batch_identifier: z.string().min(1, { message: "Batch identifier string required" })
});