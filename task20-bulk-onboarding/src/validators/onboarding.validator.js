import { z } from 'zod';

const studentRecordSchema = z.object({
  full_name: z.string().min(1, { message: "Student name content cannot be blank" }),
  email: z.string().email({ message: "Invalid candidate email address layout" }),
  graduation_year: z.number().int().min(2020),
  academic_dept: z.string().min(1, { message: "Academic department tag description required" })
});

export const bulkOnboardingSchema = z.object({
  college_id: z.string().uuid({ message: "Valid source institution tracking UUID required" }),
  operator_user_id: z.string().uuid({ message: "Valid identity execution credential required" }),
  idempotency_key: z.string().min(1, { message: "Idempotency key execution perimeter context missing" }),
  student_roster: z.array(studentRecordSchema).min(1, { message: "Roster batch array items cannot be empty" })
});