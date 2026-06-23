import { z } from 'zod';

export const discoveryFeedSchema = z.object({
  query: z.object({
    student_id: z.string().uuid(),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20)
  })
});
