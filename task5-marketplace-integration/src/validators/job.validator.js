import { z } from 'zod';

export const createJobSchema = z.object({
  body: z.object({
    company_id: z.string().uuid(),
    title: z.string().min(1),
    description: z.string().min(1),
    thresholds: z.array(
      z.object({
        skill_id: z.string().uuid(),
        min_level: z.number().int().min(1).max(100)
      })
    ).min(1)
  })
});

export const jobIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  })
});

export const publishJobSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({
    company_id: z.string().uuid()
  })
});
