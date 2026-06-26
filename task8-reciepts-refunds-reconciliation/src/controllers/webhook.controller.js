import webhookService from '../services/webhook.service';

export default handleWebhook = async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];

  try {
    if (!signature) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_SIGNATURE', message: 'X-Razorpay-Signature header is required' } });
    }

    const result = await webhookService.handleWebhookEvent(req.body, signature);
    return res.status(200).json(result);
  } catch (err) {
    // Log but always return 200 to Razorpay — except for signature failures
    if (err.code === 'INVALID_WEBHOOK_SIGNATURE') {
      return res.status(400).json({ success: false, error: { code: err.code, message: err.message } });
    }
    console.error('[Webhook] Error:', err.message);
    return res.status(200).json({ received: true }); // Don't let Razorpay retry endlessly
  }
};
