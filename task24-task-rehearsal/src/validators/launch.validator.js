import { z } from 'zod';

export const resolveBlockerSchema = z.object({
  blocker_id: z.string().uuid({ message: "Valid blocker record identifier UUID required" }),
  resolved_notes: z.string().min(5, { message: "Resolution notes must provide clear verification details" })
});

export const executeRetentionSchema = z.object({
  retention_policy: z.enum(['PRUNE_EXPIRED_DRAFT_OFFERS', 'PURGE_OLD_RETRY_LOGS'], {
    errorMap: () => ({ message: "Must select a valid system cleanup retention protocol" })
  }),
  operator_id: z.string().uuid({ message: "Valid administrator executor ID required" })
});