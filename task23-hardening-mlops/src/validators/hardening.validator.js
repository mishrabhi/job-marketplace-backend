import { z } from 'zod';

export const logInferenceSchema = z.object({
  model_name: z.string().min(1, { message: "MLOps identifier model title required" }),
  model_version: z.string().min(1, { message: "Model deployment version tag description required" }),
  student_id: z.string().uuid({ message: "Valid target student UUID signature mapping required" }),
  features_payload: z.record(z.any(), { message: "Features tracking parameters must form a valid object" }),
  prediction_output: z.record(z.any(), { message: "Prediction array matrices must form a valid object" }),
  latency_ms: z.number().int().nonnegative({ message: "Inference response latency duration must be a non-negative integer" })
});

export const saveLoadMetricsSchema = z.object({
  test_run_token: z.string().min(1, { message: "Unique stress execution baseline run token string required" }),
  concurrent_users: z.number().int().positive(),
  requests_per_second: z.number().positive(),
  error_rate_percent: z.number().nonnegative(),
  peak_latency_ms: z.number().int().positive()
});