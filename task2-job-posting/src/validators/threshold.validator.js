import { z } from 'zod';

export const checkThresholdSchema = z.object({
  body: z.object({
    student_id: z.string().uuid(),
    job_id: z.string().uuid()
  })
});
