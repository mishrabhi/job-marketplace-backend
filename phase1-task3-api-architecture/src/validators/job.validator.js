import { z } from 'zod';

export const createJobSchema = z.object({
  title: z.string().min(3, { message: "Job title must be at least 3 characters long" }),
  department: z.string().min(2, { message: "Department name is required" }),
  location: z.string().min(2, { message: "Location is required" }),
  type: z.enum(['FULL_TIME', 'PART_TIME', 'INTERNSHIP']).default('FULL_TIME'),
  salary_range: z.string().min(1, { message: "Salary range description is required" })
});