import { z } from 'zod';

export const publicVerifyQuerySchema = z.object({
  offer_id: z.string().uuid({ message: "Valid target offer UUID required" }),
  checksum: z.string().min(1, { message: "Cryptographic signature checksum verification token required" })
});