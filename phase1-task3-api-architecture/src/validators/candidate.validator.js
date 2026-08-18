import { z } from 'zod';

export const createCandidateSchema = z.object({
  full_name: z.string().min(2, { message: "Candidate name must be at least 2 characters" }),
  email: z.string().email({ message: "Valid candidate email required" }),
  degree: z.string().min(2, { message: "Degree is required" }),
  grad_year: z.number().int().min(2020).max(2030),
  skills: z.array(z.string()).min(1, { message: "At least one skill is required" })
});