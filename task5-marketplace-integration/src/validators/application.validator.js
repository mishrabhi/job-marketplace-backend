import { z } from 'zod';

export const applySchema = z.object({
  body: z.object({
    job_id: z.string().uuid(),
    student_id: z.string().uuid()
  })
});

export const applicationIdSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  })
});
