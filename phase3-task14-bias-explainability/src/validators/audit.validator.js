import { z } from 'zod';

export const recordDecisionSchema = z.object({
  decision_token: z.string().min(1, { message: "Unique decision token required" }),
  tenant_id: z.string().uuid({ message: "Valid tenant ID UUID required" }),
  candidate_id: z.string().uuid({ message: "Valid candidate ID UUID required" }),
  application_id: z.string().uuid({ message: "Valid application ID UUID required" }),
  model_version: z.string().min(1, { message: "Model version description required" }),
  decision_type: z.enum(['RANKED', 'SHORTLISTED', 'REJECTED']),
  decision_reason: z.string().min(1, { message: "Decision summary required" }),
  feature_weights: z.record(z.any()).default({}),
  input_snapshot: z.record(z.any()).default({})
});

export const submitAppealSchema = z.object({
  decision_token: z.string().min(1, { message: "Decision token string required" }),
  candidate_id: z.string().uuid({ message: "Valid candidate ID UUID required" }),
  tenant_id: z.string().uuid({ message: "Valid tenant ID UUID required" }),
  appeal_reason: z.string().min(10, { message: "Appeal reason must be at least 10 characters long" }),
  idempotency_key: z.string().min(1, { message: "Idempotency key parameter required" })
});

export const adjudicateAppealSchema = z.object({
  appeal_id: z.string().uuid({ message: "Valid appeal ID UUID required" }),
  tenant_id: z.string().uuid({ message: "Valid tenant ID UUID required for isolation" }),
  status: z.enum(['overturned', 'upheld'], { errorMap: () => ({ message: "Status must be overturned or upheld" }) }),
  reviewer_notes: z.string().min(5, { message: "Reviewer notes required" }),
  reviewed_by: z.string().uuid({ message: "Valid reviewer user ID UUID required" })
});