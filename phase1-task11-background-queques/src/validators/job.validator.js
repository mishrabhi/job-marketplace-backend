import { z } from 'zod';

export const enqueueEmailSchema = z.object({
  recipient: z.string().email({ message: "Valid recipient email required" }),
  subject: z.string().min(3, { message: "Subject must be at least 3 characters" }),
  body: z.string().min(5, { message: "Body text required" }),
  idempotency_key: z.string().min(1, { message: "Idempotency key is required" }),
  should_fail: z.boolean().optional().default(false)
});