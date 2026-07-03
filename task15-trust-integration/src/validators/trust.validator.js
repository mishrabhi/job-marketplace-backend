import { z } from 'zod';

export const dryRunExecutionSchema = z.object({
  session_token: z.string().min(1, { message: "Dry run sequence session tracking token required" }),
  application_id: z.string().uuid({ message: "Valid application id UUID required" }),
  student_id: z.string().uuid({ message: "Valid student id UUID required" }),
  company_name: z.string().min(1, { message: "Company name cannot be empty" }),
  ctc_paise: z.number().positive({ message: "CTC paise denomination must be positive" }),
  role_title: z.string().min(1, { message: "Role title description required" }),
  candidate_ip: z.string().min(1, { message: "Tracking source IP reference footprint required" }),
  idempotency_key: z.string().min(1, { message: "Idempotency key parameter required" })
});