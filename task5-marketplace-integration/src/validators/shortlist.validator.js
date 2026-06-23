import { z } from 'zod';

export const shortlistSchema = z.object({
  body: z.object({
    application_id: z.string().uuid(),
    company_id: z.string().uuid(),
    note: z.string().optional()
  })
});
