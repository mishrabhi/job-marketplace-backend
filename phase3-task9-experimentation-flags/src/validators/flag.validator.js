import { z } from 'zod';

export const evaluateFlagSchema = z.object({
  flag_key: z.string().min(1, { message: "Flag key string identifier required" }),
  user_id: z.string().uuid({ message: "Valid user ID UUID required" }),
  tenant_id: z.string().uuid({ message: "Valid tenant ID UUID required" })
});

export const toggleKillSwitchSchema = z.object({
  flag_key: z.string().min(1, { message: "Flag key string identifier required" }),
  is_active: z.boolean({ message: "Active boolean toggle status required" })
});

export const createFlagSchema = z.object({
  flag_key: z.string().min(1),
  description: z.string().min(1),
  variants: z.array(z.string()).min(2),
  traffic_allocation: z.number().int().min(0).max(100),
  owner_email: z.string().email(),
  expires_at: z.string().optional()
});