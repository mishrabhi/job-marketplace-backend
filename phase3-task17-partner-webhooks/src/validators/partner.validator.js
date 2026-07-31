import { z } from 'zod';

export const registerPartnerSchema = z.object({
  partner_name: z.string().min(2, { message: "Partner name required" }),
  tenant_id: z.string().uuid({ message: "Valid tenant ID UUID required" }),
  environment: z.enum(['sandbox', 'production']).default('sandbox'),
  rate_limit_per_min: z.number().int().positive().default(60)
});

export const triggerWebhookSchema = z.object({
  target_url: z.string().url({ message: "Valid target URL required for webhook delivery" }),
  event_type: z.string().min(1, { message: "Event type identifier required" }),
  payload: z.record(z.any(), { message: "Payload must form a valid key-value object" }),
  idempotency_key: z.string().min(1, { message: "Idempotency key parameter required" })
});

export const verifySignatureSchema = z.object({
  raw_payload: z.record(z.any()),
  signature_header: z.string().min(1),
  webhook_secret: z.string().min(1)
});