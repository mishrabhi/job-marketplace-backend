import { z } from 'zod';

export const scheduleInterviewSchema = z.object({
  application_id: z.string().uuid({ message: "Valid application context UUID identifier required" }),
  interviewer_id: z.string().uuid({ message: "Valid interviewer profile UUID required" }),
  student_id: z.string().uuid({ message: "Valid student identifier UUID required" }),
  scheduled_start: z.string().datetime({ message: "Start must be a valid ISO 8601 datetime format" }),
  scheduled_end: z.string().datetime({ message: "End must be a valid ISO 8601 datetime format" }),
  meeting_link: z.string().url({ message: "Meeting link field must represent a secure url endpoint string" }).optional(),
  idempotency_key: z.string().min(1, { message: "Idempotency key context missing" })
});