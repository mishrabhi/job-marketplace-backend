import { z } from 'zod';

export const logProfileSchema = z.object({
  endpoint_path: z.string().min(1),
  query_raw_string: z.string().min(1),
  execution_time_ms: z.number().positive(),
  is_n_plus_one: z.boolean(),
  tenant_id: z.string().uuid().optional()
});

export const commitBenchmarkSchema = z.object({
  endpoint_path: z.string().min(1),
  p95_latency_before: z.number().positive(),
  p95_latency_after: z.number().positive(),
  optimization_applied: z.string().min(5)
});