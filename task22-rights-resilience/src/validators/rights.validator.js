import { z } from 'zod';

export const dataExportSchema = z.object({
  user_id: z.string().uuid({ message: "Valid user identity UUID target required" }),
  idempotency_key: z.string().min(1, { message: "Idempotency tracking parameter key required" })
});

export const requestErasureSchema = z.object({
  user_id: z.string().uuid({ message: "Valid data subject UUID required for erasure requests" }),
  idempotency_key: z.string().min(1, { message: "Idempotency tracking parameter key required" })
});