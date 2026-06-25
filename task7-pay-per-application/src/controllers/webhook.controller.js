const { handleWebhookEvent } = require('../services/webhook.service');

async function handleWebhookHandler(req, res, next) {
  try {
    const signatureHeader = req.headers['x-razorpay-signature'];
    const rawBody = req.rawBody;

    const result = await handleWebhookEvent(rawBody, signatureHeader);
    return res.status(200).json(result);
  } catch (err) {
    // Log the error but always return 200 to prevent Razorpay from retrying
    console.error('Webhook error:', err);
    return res.status(200).json({
      received: true,
      error: err.message,
    });
  }
}

module.exports = {
  handleWebhookHandler,
};
