import { z } from 'zod';

export const recordConsentSchema = z.object({
  user_id: z.string().uuid({ message: "Valid user identity UUID identifier required" }),
  consent_type: z.enum(['profile_sharing', 'placement_analytics', 'proctoring_logs'], {
    errorMap: () => ({ message: "Must match authorized DPDP data collection domains" })
  }),
  is_granted: z.boolean(),
  ip_address: z.string().min(1, { message: "Client source IP tracking footprint required" }),
  user_agent: z.string().min(1, { message: "Client user agent fingerprint tracking string required" }),
  idempotency_key: z.string().min(1, { message: "Idempotency validation token required" })
});

export const dataPurgeSchema = z.object({
  user_id: z.string().uuid({ message: "Valid data subject UUID required for erasure requests" })
});