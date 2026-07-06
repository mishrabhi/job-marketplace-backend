import { z } from 'zod';

export const createQuestionSchema = z.object({
  topic: z.string().min(1, { message: "Assessment topic classification required" }),
  difficulty_level: z.enum(['easy', 'medium', 'hard'], {
    errorMap: () => ({ message: "Difficulty must clear easy, medium, or hard definitions" })
  }),
  question_payload: z.object({
    text: z.string().min(1, { message: "Question text content cannot be blank" }),
    options: z.array(z.string()).min(2, { message: "Multiple choice definitions must provide at least 2 options" })
  }),
  correct_meta: z.object({
    answer_index: z.number().nonnegative({ message: "Correct choice reference mapping parameter index required" })
  }),
  admin_user_id: z.string().uuid({ message: "Valid executing administrator account ID required" })
});

export const resolveProctorReviewSchema = z.object({
  review_id: z.string().uuid({ message: "Valid review record queue tracking reference UUID identifier required" }),
  verdict: z.enum(['cleared', 'disqualified'], {
    errorMap: () => ({ message: "Verdict selection must resolve to either cleared or disqualified" })
  }),
  admin_user_id: z.string().uuid({ message: "Valid auditing administrator user identity required" }),
  resolution_notes: z.string().min(5, { message: "Auditor justification notes must be at least 5 characters long" })
});