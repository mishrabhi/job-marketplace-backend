import { z } from 'zod';

export const getFeaturesSchema = z.object({
  student_id: z.string().uuid({ message: "Valid student ID UUID required" }),
  tenant_id: z.string().uuid({ message: "Valid tenant ID UUID required" })
});

export const updateFeaturesSchema = z.object({
  student_id: z.string().uuid({ message: "Valid student ID UUID required" }),
  tenant_id: z.string().uuid({ message: "Valid tenant ID UUID required" }),
  skills_vector: z.array(z.string()).min(1),
  applications_count: z.number().int().nonnegative(),
  avg_match_score: z.number().min(0).max(1)
});

export const invalidateCacheSchema = z.object({
  student_id: z.string().uuid({ message: "Valid student ID UUID required" }),
  tenant_id: z.string().uuid({ message: "Valid tenant ID UUID required" }),
  reason: z.string().min(1, { message: "Invalidation reason required" })
});