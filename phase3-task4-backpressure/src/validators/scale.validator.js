import { z } from 'zod';

export const logLoadTestSchema = z.object({
  test_run_token: z.string().min(1),
  traffic_mix_type: z.string().default('MARKETPLACE_CONCURRENCY_MIX'),
  simulated_rps: z.number().positive(),
  total_requests: z.number().int().positive()
});

export const logBreakingPointSchema = z.object({
  test_run_token: z.string().min(1),
  breaking_point_rps: z.number().positive(),
  root_cause_failure: z.string().min(5),
  failed_dependency: z.string().min(2),
  tenant_id: z.string().uuid().optional()
});