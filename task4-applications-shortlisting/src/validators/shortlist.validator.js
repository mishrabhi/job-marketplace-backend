import { z } from 'zod';

export const shortlistSchema = z.object({
  body: z.object({
    application_id: z.string().uuid(),
    company_id: z.string().uuid(),
    note: z.string().optional()
  })
});

export const rejectSchema = z.object({
  body: z.object({
    application_id: z.string().uuid(),
    company_id: z.string().uuid(),
    note: z.string().optional()
  })
});

export const shortlistIdSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  })
});

export const updateShortlistSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({
    status: z.enum(['shortlisted', 'rejected']),
    note: z.string().optional()
  })
});

export const listCandidatesSchema = z.object({
  query: z.object({
    job_id: z.string().uuid(),
    company_id: z.string().uuid(),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20)
  })
});
