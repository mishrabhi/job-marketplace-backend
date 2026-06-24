const webhookService = require('../services/webhook.service');
const env = require('../config/env');

async function handleWebhook(req, res) {
  const signature = req.headers['x-razorpay-signature'];
  const rawBody = req.rawBody || req.body;
  try {
    const result = await webhookService.handleWebhookEvent(rawBody, signature, env.RAZORPAY_WEBHOOK_SECRET);
    return res.status(200).json(result);
  } catch (err) {
    // Log error but respond suitably: Razorpay retries on non-200; on bad signature respond 400
    if (err.statusCode === 400) return res.status(400).json({ success: false, error: { code: err.code, message: err.message } });
    return res.status(200).json({ received: false });
  }
}

module.exports = { handleWebhook };
