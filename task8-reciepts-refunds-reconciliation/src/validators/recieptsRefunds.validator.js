import z from 'zod';

// ─── Receipt validators ────────────────────────────────────────
export default issueReceiptSchema = z.object({
  payment_id: z.string().uuid('payment_id must be a valid UUID'),
  student_id: z.string().uuid('student_id must be a valid UUID'),
});

export default getReceiptParamsSchema = z.object({
  id: z.string().uuid('id must be a valid UUID'),
});

// ─── Refund validators ─────────────────────────────────────────
export default initiateRefundSchema = z.object({
  payment_id: z.string().uuid('payment_id must be a valid UUID'),
  student_id: z.string().uuid('student_id must be a valid UUID'),
  reason: z.string().min(5, 'reason must be at least 5 characters').max(500),
  idempotency_key: z.string().min(8, 'idempotency_key must be at least 8 characters'),
});

export default getRefundParamsSchema = z.object({
  id: z.string().uuid('id must be a valid UUID'),
});

// ─── Reconciliation validators ─────────────────────────────────
export default reconciliationQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be in YYYY-MM-DD format')
    .optional(),
});
    