import { z } from 'zod';

export const executeSignatureSchema = z.object({
  offer_id: z.string().uuid({ message: "Valid target offer UUID required" }),
  candidate_ip: z.string().min(1, { message: "Candidate IP footprint tracking required" }),
  signed_by_student_id: z.string().uuid({ message: "Signing Student identifier UUID required" })
});

export const verifyIntegritySchema = z.object({
  offer_id: z.string().uuid({ message: "Target offer lookup UUID required" }),
  provided_checksum: z.string().min(1, { message: "Verification checksum target signature required" })
});