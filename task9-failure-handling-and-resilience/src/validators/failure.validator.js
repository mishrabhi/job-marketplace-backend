import z from 'zod';

export default recoverPaymentSchema = z.object({
  payment_id: z.string().uuid({ message: "Invalid payment_id UUID format" }),
  action: z.enum(['mark_failed', 'mark_captured', 'trigger_refund', 'dismiss'], {
    errorMap: () => ({ message: "Action must be mark_failed, mark_captured, trigger_refund, or dismiss" })
  }),
  resolution_note: z.string().max(500, { message: "Resolution note cannot exceed 500 characters" }).optional()
});

export default failureSummaryQuerySchema = z.object({}).strict();

export default dlqQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? Math.max(1, parseInt(val, 10)) : 1),
  limit: z.string().optional().transform(val => val ? Math.min(100, Math.max(1, parseInt(val, 10))) : 20)
});

module.exports = {
  recoverPaymentSchema,
  failureSummaryQuerySchema,
  dlqQuerySchema
};