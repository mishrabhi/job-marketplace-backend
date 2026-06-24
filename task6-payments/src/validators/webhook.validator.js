const { z } = require('zod');

// Very loose shape — Razorpay payloads vary; we minimally require event
const webhookSchema = z.object({
  event: z.string(),
  payload: z.record(z.any()).optional()
});

module.exports = { webhookSchema };
