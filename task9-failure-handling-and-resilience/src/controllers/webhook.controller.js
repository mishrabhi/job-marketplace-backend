import webhookService from ('../services/webhook.service');

const handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBodyBuffer = req.rawBody;

    if (!rawBodyBuffer) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_BODY', message: 'Raw body missing' } });
    }

    const result = await webhookService.handleWebhookEvent(rawBodyBuffer, signature);
    return res.status(200).json(result);
  } catch (err) {
    if (err.code === 'INVALID_WEBHOOK_SIGNATURE') {
      return res.status(400).json({ success: false, error: { code: err.code, message: err.message } });
    }
    return res.status(200).json({ received: true, error_swallowed: true });
  }
};

export default handleWebhook;