import { z } from 'zod';

export const createApplicationSchema = z.object({
  job_id: z.string().min(1, { message: "Job ID is required" }),
  candidate_id: z.string().min(1, { message: "Candidate ID is required" }),
  cover_note: z.string().optional()
});