import { z } from 'zod';

export const rankCandidatesSchema = z.object({
  student_id: z.string().uuid({ message: "Valid student ID UUID required" }),
  tenant_id: z.string().uuid({ message: "Valid tenant ID UUID required" }),
  candidate_job_ids: z.array(z.string().uuid()).min(1, { message: "Candidate jobs array must contain at least 1 ID" }),
  idempotency_key: z.string().min(1, { message: "Idempotency key parameter required" })
});

export const configureDeploymentSchema = z.object({
  model_version: z.string().min(1, { message: "Model version identifier required" }),
  deployment_mode: z.enum(['shadow', 'canary', 'primary', 'disabled']),
  canary_traffic_pct: z.number().int().min(0).max(100),
  max_allowed_latency: z.number().int().positive()
});