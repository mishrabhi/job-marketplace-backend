import supabase from '../config/db';
const razorpay = require('../config/razorpay');
const { appError } = require('../middlewares/errorHandler');

/**
 * Initiate a refund for a captured payment.
 *
 * Rules:
 * - Payment must be in 'captured' status
 * - Only one successful refund per payment (no partial refunds in v1)
 * - Idempotency key prevents double-refund on retry
 */
export default initiateRefund = async ({ payment_id, student_id, reason, idempotency_key }) => {
  // 1. Idempotency — return existing refund if key already used
  const { data: existing } = await supabase
    .from('refunds')
    .select('*')
    .eq('idempotency_key', idempotency_key)
    .single();

  if (existing) return existing;

  // 2. Fetch and validate payment
  const { data: payment, error: payErr } = await supabase
    .from('payments')
    .select('id, status, amount, currency, student_id, razorpay_payment_id')
    .eq('id', payment_id)
    .single();

  if (payErr || !payment) {
    throw appError(404, 'PAYMENT_NOT_FOUND', `Payment ${payment_id} not found`);
  }
  if (payment.student_id !== student_id) {
    throw appError(403, 'FORBIDDEN', 'Payment does not belong to this student');
  }
  if (payment.status !== 'captured') {
    throw appError(400, 'REFUND_NOT_ALLOWED',
      `Cannot refund a payment with status '${payment.status}'. Only captured payments can be refunded.`
    );
  }
  if (!payment.razorpay_payment_id) {
    throw appError(400, 'REFUND_NOT_ALLOWED', 'Payment has no Razorpay payment ID — cannot initiate refund');
  }

  // 3. Check no existing processed refund for this payment
  const { data: existingRefund } = await supabase
    .from('refunds')
    .select('id, status')
    .eq('payment_id', payment_id)
    .in('status', ['initiated', 'processed'])
    .single();

  if (existingRefund) {
    throw appError(409, 'REFUND_ALREADY_EXISTS',
      `A refund for payment ${payment_id} already exists with status '${existingRefund.status}'`
    );
  }

  // 4. Create refund row first (status: initiated)
  const { data: refund, error: refErr } = await supabase
    .from('refunds')
    .insert({
      payment_id,
      student_id,
      amount_paise: payment.amount,
      currency: payment.currency,
      reason,
      idempotency_key,
      status: 'initiated',
    })
    .select()
    .single();

  if (refErr) throw appError(500, 'DB_ERROR', refErr.message);

  // 5. Call Razorpay refund API
  let razorpayRefund;
  try {
    razorpayRefund = await razorpay.payments.refund(payment.razorpay_payment_id, {
      amount: payment.amount, // full refund
      notes: { reason, refund_id: refund.id },
    });
  } catch (rzpErr) {
    // Razorpay call failed — mark refund as failed, don't throw (return failed refund)
    await supabase
      .from('refunds')
      .update({ status: 'failed', failure_reason: rzpErr.message || 'Razorpay API error' })
      .eq('id', refund.id);

    throw appError(502, 'GATEWAY_ERROR', `Razorpay refund failed: ${rzpErr.message}`);
  }

  // 6. Update refund with Razorpay refund ID and mark processed
  const { data: updatedRefund, error: updErr } = await supabase
    .from('refunds')
    .update({
      status: 'processed',
      razorpay_refund_id: razorpayRefund.id,
      processed_at: new Date().toISOString(),
    })
    .eq('id', refund.id)
    .select()
    .single();

  if (updErr) throw appError(500, 'DB_ERROR', updErr.message);

  // 7. Update payment status to refunded
  await supabase
    .from('payments')
    .update({ status: 'refunded' })
    .eq('id', payment_id);

  // 8. Update linked application to withdrawn
  await supabase
    .from('applications')
    .update({ status: 'withdrawn' })
    .eq('payment_id', payment_id);

  return updatedRefund;
};

/**
 * Get a refund by ID.
 */
export default getRefund = async (refundId) => {
  const { data, error } = await supabase
    .from('refunds')
    .select('*, payments ( id, amount, currency, razorpay_payment_id, status )')
    .eq('id', refundId)
    .single();

  if (error || !data) {
    throw appError(404, 'REFUND_NOT_FOUND', `Refund ${refundId} not found`);
  }
  return data;
};

/**
 * List all refunds for a student.
 */
export default listStudentRefunds = async (studentId, { page = 1, limit = 20 } = {}) => {
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('refunds')
    .select('*, payments ( id, amount, razorpay_payment_id )', { count: 'exact' })
    .eq('student_id', studentId)
    .order('initiated_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw appError(500, 'DB_ERROR', error.message);

  return {
    data: data || [],
    meta: { page, limit, total: count || 0, total_pages: Math.ceil((count || 0) / limit) },
  };
};
