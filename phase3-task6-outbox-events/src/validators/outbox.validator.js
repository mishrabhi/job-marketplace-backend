import { z } from 'zod';

export const emitEventSchema = z.object({
  event_type: z.string().min(1, { message: "Event type description required" }),
  schema_version: z.string().default('v1.0'),
  tenant_id: z.string().uuid({ message: "Valid tenant identifier UUID required" }),
  payload: z.record(z.any(), { message: "Event payload must form a valid key-value object" }),
  idempotency_key: z.string().min(1, { message: "Idempotency key parameter string required" })
});

export const replayEventsSchema = z.object({
  from_sequence_number: z.number().int().nonnegative({ message: "Starting sequence number must be non-negative" })
});