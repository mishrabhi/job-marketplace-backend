import crypto from ('crypto');
import supabase from ('../config/db');
import logger from ('../config/logger');
import env from ('../config/env');
import appError from ('../middlewares/errorHandler');

export default handleWebhookEvent = async (rawBody, signatureHeader, isFromRetryWorker = false) => {
  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  if (expectedSignature !== signatureHeader) {
    throw appError(400, 'INVALID_WEBHOOK_SIGNATURE', 'Signature validation mismatch matching secret context');
  }

  const payload = JSON.parse(rawBody.toString());
  const eventType = payload.event;

  let rzpOrderId = payload.payload?.payment?.entity?.order_id || payload.payload?.refund?.entity?.order_id;
  
  let paymentRecord = null;
  if (rzpOrderId) {
    const { data } = await supabase.from('payments').select('*').eq('razorpay_order_id', rzpOrderId).maybeSingle();
    paymentRecord = data;
  }

  // Audit Log writing strategy
  await supabase.from('payment_events').insert([{
    payment_id: paymentRecord?.id || null,
    event_type: eventType,
    payload,
    processed_at: new Date().toISOString()
  }]);

  try {
    switch (eventType) {
      case 'payment.captured': {
        const rzpPaymentId = payload.payload.payment.entity.id;
        const { error: pErr } = await supabase
          .from('payments')
          .update({ status: 'captured', razorpay_payment_id: rzpPaymentId })
          .eq('razorpay_order_id', rzpOrderId);
        if (pErr) throw pErr;

        if (paymentRecord) {
          const { error: aErr } = await supabase
            .from('applications')
            .update({ status: 'applied' })
            .eq('id', paymentRecord.application_id);
          if (aErr) throw aErr;
        }
        break;
      }

      case 'payment.failed': {
        const { error: pErr } = await supabase
          .from('payments')
          .update({ status: 'failed', failure_reason: payload.payload.payment.entity.error_description || 'Gateway failed event triggered' })
          .eq('razorpay_order_id', rzpOrderId);
        if (pErr) throw pErr;
        break;
      }

      case 'refund.created': {
        const rzpRefundId = payload.payload.refund.entity.id;
        const { error: rErr } = await supabase
          .from('refunds')
          .update({ status: 'processed' })
          .eq('razorpay_refund_id', rzpRefundId);
        if (rErr) throw rErr;

        if (paymentRecord) {
          await supabase.from('payments').update({ status: 'refunded' }).eq('id', paymentRecord.id);
          await supabase.from('applications').update({ status: 'withdrawn' }).eq('id', paymentRecord.application_id);
        }
        break;
      }

      case 'refund.failed': {
        const rzpRefundId = payload.payload.refund.entity.id;
        await supabase.from('refunds').update({ status: 'failed' }).eq('razorpay_refund_id', rzpRefundId);
        break;
      }

      default:
        logger.info(`Unhandled webhook type pattern matched: ${eventType}`);
        return { received: true, queued: false };
    }

    return { received: true, queued: false };
  } catch (err) {
    if (isFromRetryWorker) {
      throw err; 
    }

    const { enqueueWebhook } = require('./webhookRetry.service');
    const { logPaymentFailure } = require('./failureHandling.service');

    await enqueueWebhook(eventType, payload, signatureHeader);
    await logPaymentFailure(
      paymentRecord?.id || null,
      'WEBHOOK_PROCESSING_ERROR',
      'HANDLER_EXCEPTION',
      err.message,
      { event_type: eventType }
    );

    logger.error('Webhook handler failed — enqueued for retry', { event_type: eventType, error: err.message });
    return { received: true, queued: true };
  }
};

