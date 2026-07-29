import { z } from 'zod';

export const invokeGovernedModelSchema = z.object({
  surface_name: z.string().min(1, { message: "Surface name identifier required" }),
  tenant_id: z.string().uuid({ message: "Valid tenant ID UUID required for multi-tenancy" }),
  candidate_ids: z.array(z.string().uuid()).min(1, { message: "At least one candidate ID is required" }),
  simulation_mode: z.enum(['NORMAL', 'MODEL_OFF', 'MODEL_SLOW', 'MODEL_WRONG']).default('NORMAL')
});

export const setPolicySchema = z.object({
  surface_name: z.string().min(1),
  pinned_version: z.string().min(1),
  hard_timeout_ms: z.number().int().positive(),
  fallback_strategy: z.enum(['HEURISTIC_SCORE', 'CHRONOLOGICAL', 'FAIL_OPEN_EMPTY'])
});