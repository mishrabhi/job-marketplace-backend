import crypto from 'crypto';
import  supabase from '../config/db';
import env from '../config/env';
import appError from '../middlewares/errorHandler';

/**
 * Handle incoming Razorpay webhook events relevant to Task 8
 * (refund.created, refund.processed, refund.failed).
 *
 * Always stores the event in payment_events.
 * Always returns 200 — Razorpay retries on non-200.
 */
export default handleWebhookEvent = async (rawBody, signatureHeader) => {
  // 1. Verify webhook signature
  const expected = crypto
    .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  if (expected !== signatureHeader) {
    throw appError(400, 'INVALID_WEBHOOK_SIGNATURE', 'Webhook signature verification failed');
  }

  // 2. Parse payload
  const payload = JSON.parse(rawBody.toString());
  const eventType = payload.event;

  // 3. Resolve payment_id for the event (best-effort)
  let resolvedPaymentId = null;
  try {
    const entity = payload?.payload?.refund?.entity || payload?.payload?.payment?.entity;
    if (entity?.payment_id) {
      const { data } = await supabase
        .from('payments')
        .select('id')
        .eq('razorpay_payment_id', entity.payment_id)
        .single();
      resolvedPaymentId = data?.id || null;
    }
  } catch (_) {
    // Non-critical — store event even if we can't resolve the payment
  }

  // 4. Always store in payment_events (audit trail)
  await supabase.from('payment_events').insert({
    payment_id: resolvedPaymentId,
    event_type: eventType,
    payload,
  });

  // 5. Handle specific events
  try {
    switch (eventType) {
      case 'refund.created': {
        const refund = payload?.payload?.refund?.entity;
        if (refund) {
          await supabase
            .from('refunds')
            .update({ status: 'processed', razorpay_refund_id: refund.id, processed_at: new Date().toISOString() })
            .eq('payment_id', resolvedPaymentId)
            .eq('status', 'initiated');

          // Mirror payment status
          await supabase
            .from('payments')
            .update({ status: 'refunded' })
            .eq('id', resolvedPaymentId);
        }
        break;
      }

      case 'refund.failed': {
        const refund = payload?.payload?.refund?.entity;
        if (refund) {
          await supabase
            .from('refunds')
            .update({ status: 'failed', failure_reason: refund.description || 'Refund failed at gateway' })
            .eq('razorpay_refund_id', refund.id);
        }
        break;
      }

      default:
        // Unknown event — logged via payment_events, no action needed
        break;
    }
  } catch (handlerErr) {
    console.error(`[Webhook] Error handling event ${eventType}:`, handlerErr.message);
    // Do NOT rethrow — always return 200 to Razorpay
  }

  return { received: true, event_type: eventType };
};

