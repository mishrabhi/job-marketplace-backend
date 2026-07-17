import { z } from 'zod';

export const registerTraceSpanSchema = z.object({
  trace_id: z.string().min(1),
  span_id: z.string().min(1),
  parent_span_id: z.string().nullable().optional(),
  endpoint_path: z.string().min(1),
  http_method: z.string().min(1),
  latency_ms: z.number().int().nonnegative(),
  status_code: z.number().int().positive(),
  tenant_id: z.string().uuid().optional(),
  meta_attributes: z.record(z.any()).optional()
});

export const getBudgetSummarySchema = z.object({
  endpoint_path: z.string().min(1)
});