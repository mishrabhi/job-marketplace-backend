const supabase = require('../config/db');
const razorpay = require('../config/razorpay');
const env = require('../config/env');
const crypto = require('crypto');
const { appError } = require('../middlewares/errorHandler');

async function createOrder({ application_id, student_id, company_id, amount_paise, idempotency_key }) {
  // idempotency check
  const { data: existing, error: e1 } = await supabase
    .from('payments')
    .select('*')
    .eq('idempotency_key', idempotency_key)
    .single();
  if (e1 && e1.code !== 'PGRST116') {
    // PGRST116 = no rows? supabase error handling varies; ignore if not found
  }
  if (existing) return { payment: existing };

  // verify application exists and belongs to student
  const { data: appRow, error: appErr } = await supabase
    .from('applications')
    .select('*')
    .eq('id', application_id)
    .single();
  if (appErr || !appRow || appRow.student_id !== student_id) {
    throw appError(404, 'APPLICATION_NOT_FOUND', 'Application not found or does not belong to student');
  }

  // verify no existing non-failed payment for this application
  const { data: existingPayment } = await supabase
    .from('payments')
    .select('*')
    .eq('application_id', application_id)
    .neq('status', 'failed')
    .limit(1)
    .maybeSingle();
  if (existingPayment) {
    throw appError(409, 'PAYMENT_ALREADY_EXISTS', 'Non-failed payment already exists for this application');
  }

  // create razorpay order
  let razorpayOrder;
  try {
    razorpayOrder = await razorpay.orders.create({ amount: amount_paise, currency: 'INR', receipt: idempotency_key });
  } catch (err) {
    throw appError(502, 'GATEWAY_ERROR', 'Razorpay order creation failed', err.message);
  }

  // insert payment row
  const payload = {
    application_id,
    student_id,
    company_id,
    amount: amount_paise,
    currency: 'INR',
    status: 'created',
    razorpay_order_id: razorpayOrder.id,
    idempotency_key,
    metadata: {}
  };

  const { data: inserted, error: insErr } = await supabase.from('payments').insert(payload).select().single();
  if (insErr) {
    throw appError(500, 'DB_ERROR', 'Failed to insert payment', insErr.message);
  }

  return { payment: inserted, razorpay_order: razorpayOrder };
}

async function verifyPayment({ payment_id, razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  const { data: payment, error } = await supabase.from('payments').select('*').eq('id', payment_id).single();
  if (error || !payment) throw appError(404, 'PAYMENT_NOT_FOUND', 'Payment not found');

  const expected = crypto.createHmac('sha256', env.RAZORPAY_KEY_SECRET).update(razorpay_order_id + '|' + razorpay_payment_id).digest('hex');
  if (expected !== razorpay_signature) {
    await supabase.from('payments').update({ status: 'failed', failure_reason: 'SIGNATURE_MISMATCH', razorpay_payment_id, razorpay_signature }).eq('id', payment_id);
    throw appError(400, 'INVALID_SIGNATURE', 'Invalid signature');
  }

  const { data: updated, error: updErr } = await supabase.from('payments').update({ status: 'captured', razorpay_payment_id, razorpay_signature }).eq('id', payment_id).select().single();
  if (updErr) throw appError(500, 'DB_ERROR', 'Failed to update payment', updErr.message);
  return updated;
}

async function getPayment(paymentId) {
  const { data, error } = await supabase
    .from('payments')
    .select('*, applications(*), students(*), companies(*)')
    .eq('id', paymentId)
    .single();
  if (error || !data) throw appError(404, 'PAYMENT_NOT_FOUND', 'Payment not found');
  return data;
}

module.exports = { createOrder, verifyPayment, getPayment };
