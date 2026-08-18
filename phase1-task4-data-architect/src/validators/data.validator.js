import { z } from 'zod';

export const createStudentSchema = z.object({
  college_id: z.string().uuid({ message: "Valid college UUID required" }),
  full_name: z.string().min(2, { message: "Name must have at least 2 characters" }),
  email: z.string().email({ message: "Valid email address required" }),
  gpa: z.number().min(0.0).max(10.0, { message: "GPA must be between 0.0 and 10.0" }),
  grad_year: z.number().int().min(2020).max(2035)
});

export const applyJobSchema = z.object({
  job_id: z.string().uuid({ message: "Valid job UUID required" }),
  student_id: z.string().uuid({ message: "Valid student UUID required" })
});