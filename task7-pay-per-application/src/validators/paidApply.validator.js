const { z } = require('zod');

const initiatePaidApplySchema = z.object({
  student_id: z.string().uuid('student_id must be a valid UUID'),
  job_id: z.string().uuid('job_id must be a valid UUID'),
  idempotency_key: z.string().min(8, 'idempotency_key must be at least 8 characters'),
});

const confirmPaymentSchema = z.object({
  application_id: z.string().uuid('application_id must be a valid UUID'),
  razorpay_order_id: z.string().min(1, 'razorpay_order_id is required'),
  razorpay_payment_id: z.string().min(1, 'razorpay_payment_id is required'),
  razorpay_signature: z.string().min(10, 'razorpay_signature must be at least 10 characters'),
});

const getApplicationStatusSchema = z.object({
  id: z.string().uuid('id must be a valid UUID'),
});

module.exports = {
  initiatePaidApplySchema,
  confirmPaymentSchema,
  getApplicationStatusSchema,
};
