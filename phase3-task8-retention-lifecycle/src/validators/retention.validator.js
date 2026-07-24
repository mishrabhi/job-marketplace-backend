import { z } from 'zod';

export const updateLifecycleSchema = z.object({
  user_id: z.string().uuid({ message: "Valid user ID UUID required" }),
  tenant_id: z.string().uuid({ message: "Valid tenant ID UUID required" }),
  lifecycle_state: z.enum(['active', 'at_risk', 'dormant', 'churned'], {
    errorMap: () => ({ message: "State must match active, at_risk, dormant, or churned" })
  })
});

export const triggerReengagementSchema = z.object({
  user_id: z.string().uuid({ message: "Valid user ID UUID required" }),
  tenant_id: z.string().uuid({ message: "Valid tenant ID UUID required" }),
  notification_type: z.string().min(1, { message: "Notification type description required" }),
  channel: z.enum(['email', 'sms', 'push']),
  idempotency_key: z.string().min(1, { message: "Idempotency key parameter required" })
});