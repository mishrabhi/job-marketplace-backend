import { z } from 'zod';

export const executePortalDryRunSchema = z.object({
  test_session_token: z.string().min(1, { message: "Test sequence session tracking token required" }),
  college_id: z.string().uuid({ message: "Valid college_id UUID context identifier required" }),
  college_officer_id: z.string().uuid({ message: "Valid college officer identity UUID required" }),
  student_id: z.string().uuid({ message: "Valid student tracking ID UUID required" }),
  application_id: z.string().uuid({ message: "Valid application file UUID context required" }),
  admin_user_id: z.string().uuid({ message: "Valid operating system administrator ID required" }),
  idempotency_key: z.string().min(1, { message: "Idempotency validation parameter token required" })
});