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

export const listStudentAppsSchema = z.object({
  query: z.object({
    student_id: z.string().uuid(),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20)
  })
});
