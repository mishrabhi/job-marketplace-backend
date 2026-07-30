import { z } from 'zod';

export const createDossierSchema = z.object({
  candidate_id: z.string().uuid({ message: "Valid candidate ID UUID required" }),
  confidential_notes: z.string().min(5, { message: "Confidential notes must be at least 5 characters" })
});

export const assignRoleSchema = z.object({
  user_id: z.string().uuid({ message: "Valid user ID UUID required" }),
  tenant_id: z.string().uuid({ message: "Valid tenant ID UUID required" }),
  role_name: z.string().min(1, { message: "Role name string required" })
});