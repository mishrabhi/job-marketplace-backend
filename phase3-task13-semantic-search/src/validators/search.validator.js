import { z } from 'zod';

export const executeSearchSchema = z.object({
  query: z.string().min(1, { message: "Search query string required" }),
  tenant_id: z.string().uuid({ message: "Valid tenant ID UUID required for isolation" }),
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(10),
  vector_query: z.array(z.number()).optional()
});

export const indexCandidateSchema = z.object({
  student_id: z.string().uuid({ message: "Valid student ID UUID required" }),
  tenant_id: z.string().uuid({ message: "Valid tenant ID UUID required" }),
  full_name: z.string().min(1),
  headline: z.string().min(1),
  skills_keywords: z.string().min(1),
  dense_embedding: z.array(z.number()).default([])
});