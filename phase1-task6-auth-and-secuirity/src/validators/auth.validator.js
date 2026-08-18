import { z } from 'zod';

export const registerUserSchema = z.object({
  email: z.string().email({ message: "Valid email address required" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  full_name: z.string().min(2, { message: "Full name must be at least 2 characters" }),
  role: z.enum(['STUDENT', 'TPO_ADMIN', 'RECRUITER']).default('STUDENT')
});

export const loginUserSchema = z.object({
  email: z.string().email({ message: "Valid email address required" }),
  password: z.string().min(1, { message: "Password is required" })
});