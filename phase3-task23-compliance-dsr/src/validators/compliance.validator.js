import { z } from 'zod';

export const submitDsrRequestSchema = z.object({
  tenant_id: z.string().uuid({ message: "Valid tenant ID UUID required" }),
  candidate_id: z.string().uuid({ message: "Valid candidate ID UUID required" }),
  request_type: z.enum(['ACCESS_EXPORT', 'RIGHT_TO_BE_FORGOTTEN', 'DATA_CORRECTION'], {
    errorMap: () => ({ message: "Request type must be ACCESS_EXPORT, RIGHT_TO_BE_FORGOTTEN, or DATA_CORRECTION" })
  }),
  requested_by_email: z.string().email({ message: "Valid requester email required" }),
  idempotency_key: z.string().min(1, { message: "Idempotency key parameter required" })
});

export const processDsrSchema = z.object({
  dsr_request_id: z.string().uuid({ message: "Valid DSR request UUID required" }),
  tenant_id: z.string().uuid({ message: "Valid tenant ID UUID required" }),
  actor_id: z.string().uuid({ message: "Valid admin actor UUID required" })
});