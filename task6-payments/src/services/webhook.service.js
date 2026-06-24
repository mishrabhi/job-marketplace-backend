const crypto = require('crypto');
const supabase = require('../config/db');
const razorpay = require('../config/razorpay');
const { appError } = require('../middlewares/errorHandler');
const env = require('../config/env');

async function handleWebhookEvent(rawBody, signature, webhookSecret) {
  const computed = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
  let parsed;
  try {
    if (computed !== signature) throw appError(400, 'INVALID_WEBHOOK_SIGNATURE', 'Invalid webhook signature');
    parsed = JSON.parse(rawBody.toString());
  } catch (err) {
    // store event even if malformed signature? spec: store every event regardless — store minimal
    await supabase.from('payment_events').insert({ event_type: 'invalid_or_malformed', payload: rawBody.toString() });
    if (err && err.code === 'INVALID_WEBHOOK_SIGNATURE') throw err;
    throw appError(400, 'INVALID_WEBHOOK_SIGNATURE', 'Invalid webhook payload or signature');
  }

  const eventType = parsed.event || parsed.event_type || 'unknown';

  // store event audit
  try {
    await supabase.from('payment_events').insert({ event_type: eventType, payload: parsed });
  } catch (e) {
    // swallow — audit should not crash
  }

  const paymentEntity = parsed.payload && parsed.payload.payment && parsed.payload.payment.entity;
  const orderId = paymentEntity && (paymentEntity.order_id || paymentEntity.orderId || parsed.payload.payment.entity.order_id);

  try {
    if (eventType === 'payment.captured' && orderId) {
      await supabase.from('payments').update({ status: 'captured', razorpay_payment_id: paymentEntity.id }).eq('razorpay_order_id', orderId);
    } else if (eventType === 'payment.failed' && orderId) {
      const reason = (paymentEntity && paymentEntity.error_description) || 'gateway_failed';
      await supabase.from('payments').update({ status: 'failed', failure_reason: reason }).eq('razorpay_order_id', orderId);
    } else if (eventType === 'refund.created' && orderId) {
      await supabase.from('payments').update({ status: 'refunded' }).eq('razorpay_order_id', orderId);
    } else {
      // unknown events — log and return
    }
  } catch (e) {
    // don't crash on processing errors
  }

  return { received: true, event_type: eventType };
}

async function generateReconciliationReport(date) {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  const { data: payments } = await supabase.from('payments').select('*').gte('created_at', start.toISOString()).lt('created_at', end.toISOString());

  const total_orders = payments.length;
  const total_captured = payments.filter(p => p.status === 'captured').length;
  const total_failed = payments.filter(p => p.status === 'failed').length;
  const our_total_paise = payments.filter(p => p.status === 'captured').reduce((s, p) => s + (p.amount || 0), 0);

  // fetch gateway payments
  let gateway_total_paise = 0;
  try {
    const gw = await razorpay.payments.all({ from: Math.floor(start.getTime() / 1000), to: Math.floor(end.getTime() / 1000) });
    if (gw && gw.items) gateway_total_paise = gw.items.reduce((s, it) => s + (it.amount || 0), 0);
  } catch (e) {
    // ignore gateway errors for now
  }

  const matched = our_total_paise === gateway_total_paise;
  const discrepancies = matched ? {} : { our_total_paise, gateway_total_paise };

  const payload = {
    report_date: date,
    total_orders,
    total_captured,
    total_failed,
    gateway_total_paise,
    our_total_paise,
    matched,
    discrepancies
  };

  const { data: upserted } = await supabase.from('reconciliation_reports').upsert(payload, { onConflict: 'report_date' }).select().single();
  return upserted;
}

module.exports = { handleWebhookEvent, generateReconciliationReport };
