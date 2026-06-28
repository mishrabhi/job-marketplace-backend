import supabase from ('../config/db');
import logger from ('../config/logger');
import razorpay from ('../config/razorpay');
import appError from ('../middlewares/errorHandler');
import env from ('../config/env');

export default logPaymentFailure = async (paymentId, failureType, errorCode, errorMessage, context = {}) => {
  try {
    logger.failure(paymentId, failureType, { message: errorMessage }, context);

    const { data: existingLog } = await supabase
      .from('payment_failure_log')
      .select('id')
      .eq('failure_type', failureType)
      .eq('resolved', false)
      .eq(paymentId ? 'payment_id' : 'id', paymentId || '00000000-0000-0000-0000-000000000000') 
      .maybeSingle();

    if (existingLog && paymentId) {
      await supabase
        .from('payment_failure_log')
        .update({
          error_code: errorCode,
          error_message: errorMessage,
          context,
          logged_at: new Date().toISOString()
        })
        .eq('id', existingLog.id);
    } else {
      await supabase
        .from('payment_failure_log')
        .insert([{
          payment_id: paymentId,
          failure_type: failureType,
          error_code: errorCode,
          error_message: errorMessage,
          context,
          resolved: false
        }]);
    }
  } catch (err) {
    logger.error('Failed logging payment failure entry to DB', { error: err.message });
  }
};

export default detectStuckPayments = async () => {
  const createdThreshold = new Date(Date.now() - env.STUCK_PAYMENT_THRESHOLD_MINUTES * 60 * 1000).toISOString();
  const authorizedThreshold = new Date(Date.now() - env.STUCK_AUTHORIZED_THRESHOLD_MINUTES * 60 * 1000).toISOString();

  const { data: createdPayments, error: err1 } = await supabase
    .from('payments')
    .select('id, status, razorpay_order_id, amount, student_id, application_id, created_at, updated_at')
    .eq('status', 'created')
    .lt('created_at', createdThreshold);

  const { data: authorizedPayments, error: err2 } = await supabase
    .from('payments')
    .select('id, status, razorpay_order_id, amount, student_id, application_id, created_at, updated_at')
    .eq('status', 'authorized')
    .lt('updated_at', authorizedThreshold);

  if (err1 || err2) {
    throw appError(500, 'DB_ERROR', 'Error fetching stuck rows', err1 || err2);
  }

  const stuckPayments = [...(createdPayments || []), ...(authorizedPayments || [])];

  for (const payment of stuckPayments) {
    const ageMinutes = Math.round((Date.now() - new Date(payment.updated_at || payment.created_at).getTime()) / 60000);
    
    await logPaymentFailure(
      payment.id,
      'STUCK_PAYMENT',
      'TIMEOUT',
      `Payment stuck in '${payment.status}' for over ${ageMinutes} minutes`,
      { razorpay_order_id: payment.razorpay_order_id, age_minutes: ageMinutes, student_id: payment.student_id }
    );
  }

  return { stuck: stuckPayments, count: stuckPayments.length };
};

export default recoverPayment = async (paymentId, { action, resolution_note }) => {
  const { data: payment, error: pErr } = await supabase
    .from('payments')
    .select('*')
    .eq('id', paymentId)
    .maybeSingle();

  if (pErr) throw appError(500, 'DB_ERROR', pErr.message);
  if (!payment) throw appError(404, 'PAYMENT_NOT_FOUND', 'Payment record does not exist');

  // Guard Rails against unauthorized state machine mutations
  if (action === 'mark_failed' && !['created', 'authorized'].includes(payment.status)) {
    throw appError(400, 'INVALID_RECOVERY_ACTION', `Cannot set payment status from ${payment.status} to failed.`);
  }
  if (action === 'mark_captured' && payment.status !== 'authorized') {
    throw appError(400, 'INVALID_RECOVERY_ACTION', `Cannot capture payment from status ${payment.status}`);
  }
  if (action === 'trigger_refund' && payment.status !== 'captured') {
    throw appError(400, 'INVALID_RECOVERY_ACTION', `Cannot refund uncaptured payment line items`);
  }

  let updatedPayment = { ...payment };

  if (action === 'mark_failed') {
    const { data: payUp, error: payErr } = await supabase.from('payments').update({ status: 'failed', failure_reason: 'MANUALLY_FAILED_BY_RECOVERY' }).eq('id', paymentId).select().single();
    if (payErr) throw appError(500, 'DB_ERROR', payErr.message);
    
    const { error: appErrObj } = await supabase.from('applications').update({ status: 'pending_payment' }).eq('id', payment.application_id);
    if (appErrObj) throw appError(500, 'DB_ERROR', appErrObj.message);
    
    logger.payment(paymentId, 'Recovery: marked failed', { action, resolution_note });
    updatedPayment = payUp;
  }

  else if (action === 'mark_captured') {
    const { data: payUp, error: payErr } = await supabase.from('payments').update({ status: 'captured' }).eq('id', paymentId).select().single();
    if (payErr) throw appError(500, 'DB_ERROR', payErr.message);
    
    const { error: appErrObj } = await supabase.from('applications').update({ status: 'applied' }).eq('id', payment.application_id);
    if (appErrObj) throw appError(500, 'DB_ERROR', appErrObj.message);
    
    logger.payment(paymentId, 'Recovery: marked captured', { action, resolution_note });
    updatedPayment = payUp;
  }

  else if (action === 'trigger_refund') {
    try {
      if(!payment.razorpay_payment_id) {
         throw new Error("Missing razorpay_payment_id mapping line item details");
      }
      const rzpRefund = await razorpay.payments.refund(payment.razorpay_payment_id, { amount: payment.amount });
      
      const { error: refErr } = await supabase.from('refunds').insert([{
        payment_id: paymentId,
        student_id: payment.student_id,
        amount_paise: payment.amount,
        reason: resolution_note || 'Recovery refund',
        idempotency_key: 'recovery-' + paymentId,
        status: 'processed',
        razorpay_refund_id: rzpRefund.id
      }]);
      if (refErr) throw appError(500, 'DB_ERROR', refErr.message);

      const { data: payUp, error: payErr } = await supabase.from('payments').update({ status: 'refunded' }).eq('id', paymentId).select().single();
      if (payErr) throw appError(500, 'DB_ERROR', payErr.message);
      
      const { error: appErrObj } = await supabase.from('applications').update({ status: 'withdrawn' }).eq('id', payment.application_id);
      if (appErrObj) throw appError(500, 'DB_ERROR', appErrObj.message);

      updatedPayment = payUp;
    } catch (err) {
      throw appError(502, 'GATEWAY_ERROR', `Razorpay refund failed: ${err.message}`);
    }
  }

  await supabase
    .from('payment_failure_log')
    .update({ resolved: true, resolved_at: new Date().toISOString(), resolution_note })
    .eq('payment_id', paymentId)
    .eq('resolved', false);

  logger.payment(paymentId, 'Payment recovered', { action });
  return { payment: updatedPayment, action_taken: action };
};

export default getFailureSummary = async () => {
  const createdThreshold = new Date(Date.now() - env.STUCK_PAYMENT_THRESHOLD_MINUTES * 60 * 1000).toISOString();
  const authorizedThreshold = new Date(Date.now() - env.STUCK_AUTHORIZED_THRESHOLD_MINUTES * 60 * 1000).toISOString();

  const [
    failedPayments,
    stuckCreated,
    stuckAuthorized,
    unresolvedLogs,
    pendingRetries,
    dlqEntries,
    failedRefunds
  ] = await Promise.all([
    supabase.from('payments').select('id', { count: 'exact', head: true }).eq('status', 'failed'),
    supabase.from('payments').select('id', { count: 'exact', head: true }).eq('status', 'created').lt('created_at', createdThreshold),
    supabase.from('payments').select('id', { count: 'exact', head: true }).eq('status', 'authorized').lt('updated_at', authorizedThreshold),
    supabase.from('payment_failure_log').select('id', { count: 'exact', head: true }).eq('resolved', false),
    supabase.from('webhook_retry_queue').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('webhook_dlq').select('id', { count: 'exact', head: true }),
    supabase.from('refunds').select('id', { count: 'exact', head: true }).eq('status', 'failed')
  ]);

  const counts = {
    failed_payments: failedPayments.count || 0,
    stuck_payments: (stuckCreated.count || 0) + (stuckAuthorized.count || 0),
    unresolved_failures: unresolvedLogs.count || 0,
    pending_webhook_retries: pendingRetries.count || 0,
    dead_letter_queue_count: dlqEntries.count || 0,
    failed_refunds: failedRefunds.count || 0
  };

  const isHealthy = Object.values(counts).every(c => c === 0);

  return { summary: counts, healthy: isHealthy };
};

