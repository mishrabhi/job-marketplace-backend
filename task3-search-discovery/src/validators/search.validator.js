import { z } from 'zod';

export const searchJobsSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    skill_id: z.string().uuid().optional(),
    min_level: z.coerce.number().int().min(1).max(100).optional(),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20)
  })
});

export const jobIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  })
});
