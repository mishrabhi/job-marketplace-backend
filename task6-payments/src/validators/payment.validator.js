const { z } = require('zod');

const uuid = z.string().uuid();

const createOrderSchema = z.object({
  application_id: uuid,
  student_id: uuid,
  company_id: uuid,
  amount_paise: z.number().int().positive(),
  idempotency_key: z.string().min(8)
});

const verifyPaymentSchema = z.object({
  payment_id: uuid,
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string()
});

module.exports = { createOrderSchema, verifyPaymentSchema };
