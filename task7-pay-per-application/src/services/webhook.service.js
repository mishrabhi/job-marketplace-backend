const crypto = require('crypto');
const supabase = require('../config/db');
const config = require('../config/env');
const { appError } = require('../middlewares/errorHandler');

/**
 * Handle Razorpay webhook event
 * Verifies signature and processes payment events
 */
async function handleWebhookEvent(rawBody, signatureHeader) {
  // Step 1: Verify signature
  const expected = crypto
    .createHmac('sha256', config.razorpay.webhookSecret)
    .update(rawBody)
    .digest('hex');

  if (expected !== signatureHeader) {
    appError(400, 'INVALID_WEBHOOK_SIGNATURE', 'Webhook signature verification failed');
  }

  // Step 2: Parse payload
  let payload;
  try {
    payload = JSON.parse(rawBody.toString());
  } catch (err) {
    appError(400, 'INVALID_PAYLOAD', 'Failed to parse webhook payload');
  }

  const eventType = payload.event;
  const entity = payload.payload?.payment?.entity || payload.payload?.refund?.entity;

  // Step 3: Always store event in payment_events table
  let paymentId = null;
  if (eventType === 'payment.captured' || eventType === 'payment.failed') {
    // Find payment by razorpay_order_id
    const { data: payment } = await supabase
      .from('payments')
      .select('id')
      .eq('razorpay_order_id', entity.order_id)
      .maybeSingle();
    paymentId = payment?.id;
  } else if (eventType === 'refund.created') {
    // Find payment by razorpay_payment_id
    const { data: payment } = await supabase
      .from('payments')
      .select('id')
      .eq('razorpay_payment_id', entity.payment_id)
      .maybeSingle();
    paymentId = payment?.id;
  }

  await supabase.from('payment_events').insert([
    {
      payment_id: paymentId,
      event_type: eventType,
      payload,
    },
  ]);

  // Step 4: Handle specific events
  if (eventType === 'payment.captured') {
    // Find payment by razorpay_order_id
    const { data: payment } = await supabase
      .from('payments')
      .select('id, application_id')
      .eq('razorpay_order_id', entity.order_id)
      .maybeSingle();

    if (payment) {
      // Update payment to captured
      await supabase
        .from('payments')
        .update({
          status: 'captured',
          razorpay_payment_id: entity.id,
        })
        .eq('id', payment.id);

      // Find and update application
      const { data: application } = await supabase
        .from('applications')
        .select('id')
        .eq('payment_id', payment.id)
        .maybeSingle();

      if (application) {
        await supabase
          .from('applications')
          .update({ status: 'applied' })
          .eq('id', application.id);
      }
    }

    return { received: true, event_type: eventType };
  }

  if (eventType === 'payment.failed') {
    // Find payment by razorpay_order_id
    const { data: payment } = await supabase
      .from('payments')
      .select('id')
      .eq('razorpay_order_id', entity.order_id)
      .maybeSingle();

    if (payment) {
      // Update payment to failed (application stays pending_payment)
      await supabase
        .from('payments')
        .update({
          status: 'failed',
          failure_reason: entity.error_description,
        })
        .eq('id', payment.id);
    }

    return { received: true, event_type: eventType };
  }

  if (eventType === 'refund.created') {
    // Find payment by razorpay_payment_id
    const { data: payment } = await supabase
      .from('payments')
      .select('id')
      .eq('razorpay_payment_id', entity.payment_id)
      .maybeSingle();

    if (payment) {
      // Update payment to refunded
      await supabase
        .from('payments')
        .update({ status: 'refunded' })
        .eq('id', payment.id);

      // Find and update application to withdrawn
      const { data: application } = await supabase
        .from('applications')
        .select('id')
        .eq('payment_id', payment.id)
        .maybeSingle();

      if (application) {
        await supabase
          .from('applications')
          .update({ status: 'withdrawn' })
          .eq('id', application.id);
      }
    }

    return { received: true, event_type: eventType };
  }

  // Unknown event type — log but don't throw
  console.log(`Unknown Razorpay event type: ${eventType}`);
  return { received: true, event_type: eventType };
}

module.exports = {
  handleWebhookEvent,
};
