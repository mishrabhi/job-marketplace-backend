const crypto = require('crypto');
const supabase = require('../config/db');
const razorpay = require('../config/razorpay');
const config = require('../config/env');
const { appError } = require('../middlewares/errorHandler');

/**
 * Fetch application fee from application_fee_config
 * First tries job-specific fee, falls back to default (job_id IS NULL)
 */
async function getFeeForJob(jobId) {
  // Try job-specific fee first
  const { data: jobFee, error: jobError } = await supabase
    .from('application_fee_config')
    .select('amount_paise, currency')
    .eq('job_id', jobId)
    .eq('active', true)
    .single();

  if (jobFee) {
    return { amount_paise: jobFee.amount_paise, currency: jobFee.currency };
  }

  // Fall back to default fee
  const { data: defaultFee, error: defaultError } = await supabase
    .from('application_fee_config')
    .select('amount_paise, currency')
    .is('job_id', null)
    .eq('active', true)
    .single();

  if (!defaultFee) {
    appError(500, 'FEE_CONFIG_MISSING', 'No fee configuration found');
  }

  return { amount_paise: defaultFee.amount_paise, currency: defaultFee.currency };
}

/**
 * Get application with joined payment, job, and company data
 */
async function getApplicationStatus(applicationId, studentId) {
  const { data, error } = await supabase
    .from('applications')
    .select(
      `
      id,
      status,
      job_id,
      student_id,
      payment_id,
      created_at,
      payments (
        id,
        status,
        amount,
        currency,
        razorpay_payment_id,
        created_at
      ),
      jobs (
        id,
        title,
        description,
        companies (
          id,
          name
        )
      )
    `
    )
    .eq('id', applicationId)
    .single();

  if (error || !data) {
    appError(404, 'APPLICATION_NOT_FOUND', 'Application not found');
  }

  if (data.student_id !== studentId) {
    appError(404, 'APPLICATION_NOT_FOUND', 'Application not found');
  }

  return data;
}

/**
 * Initiate a paid application
 * Creates Razorpay order and application in pending_payment state
 */
async function initiatePaidApply({ student_id, job_id, idempotency_key }) {
  // Step 1: Check idempotency
  const { data: existingApp, error: existingError } = await supabase
    .from('applications')
    .select('*, payments(*)')
    .eq('idempotency_key', idempotency_key)
    .single();

  if (existingApp) {
    // Idempotent return
    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('id', existingApp.payment_id)
      .single();

    return {
      application: existingApp,
      payment,
      razorpay_order: {
        id: payment.razorpay_order_id,
        amount: payment.amount,
        currency: payment.currency,
      },
    };
  }

  // Step 2: Verify job exists and is published
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('*, companies(*)')
    .eq('id', job_id)
    .single();

  if (!job) {
    appError(404, 'JOB_NOT_FOUND', 'Job not found');
  }

  if (job.status !== 'published') {
    appError(400, 'JOB_NOT_PUBLISHED', 'Job is not published');
  }

  // Step 3: Check student hasn't already applied
  const { data: previousApp, error: prevError } = await supabase
    .from('applications')
    .select('*')
    .eq('student_id', student_id)
    .eq('job_id', job_id)
    .not('status', 'eq', 'withdrawn')
    .maybeSingle();

  if (previousApp) {
    appError(409, 'ALREADY_APPLIED', 'Student already has an active application for this job');
  }

  // Step 4: Get fee
  const fee = await getFeeForJob(job_id);

  // Step 5: Create Razorpay order
  let order;
  try {
    order = await razorpay.orders.create({
      amount: fee.amount_paise,
      currency: fee.currency,
      receipt: idempotency_key,
    });
  } catch (err) {
    appError(502, 'GATEWAY_ERROR', err.message);
  }

  // Step 6: Insert payment
  const { data: paymentRow, error: paymentError } = await supabase
    .from('payments')
    .insert([
      {
        student_id,
        company_id: job.company_id,
        application_id: null,
        amount: fee.amount_paise,
        currency: fee.currency,
        status: 'created',
        razorpay_order_id: order.id,
        idempotency_key,
      },
    ])
    .select()
    .single();

  if (!paymentRow) {
    appError(500, 'DB_ERROR', 'Failed to create payment record');
  }

  // Step 7: Insert application
  const { data: app, error: appError_ } = await supabase
    .from('applications')
    .insert([
      {
        student_id,
        job_id,
        status: 'pending_payment',
        idempotency_key,
        payment_id: paymentRow.id,
      },
    ])
    .select()
    .single();

  if (!app) {
    // Compensating delete: remove payment row if application insert fails
    await supabase.from('payments').delete().eq('id', paymentRow.id);
    appError(500, 'DB_ERROR', 'Failed to create application');
  }

  return {
    application: app,
    payment: paymentRow,
    razorpay_order: {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    },
  };
}

/**
 * Confirm payment and activate application
 * Verifies signature and transitions application to applied state
 */
async function confirmPayment({ application_id, razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  // Step 1: Fetch application
  const { data: application, error: appError_ } = await supabase
    .from('applications')
    .select('*')
    .eq('id', application_id)
    .single();

  if (!application) {
    appError(404, 'APPLICATION_NOT_FOUND', 'Application not found');
  }

  if (application.status !== 'pending_payment') {
    appError(400, 'PAYMENT_ALREADY_CONFIRMED', 'Application is not in pending_payment state');
  }

  // Step 2: Fetch payment
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .select('*')
    .eq('id', application.payment_id)
    .single();

  if (!payment) {
    appError(404, 'PAYMENT_NOT_FOUND', 'Payment not found');
  }

  // Step 3: Verify signature
  const expected = crypto
    .createHmac('sha256', config.razorpay.keySecret)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');

  if (expected !== razorpay_signature) {
    // Mark payment as failed on signature mismatch
    await supabase
      .from('payments')
      .update({
        status: 'failed',
        failure_reason: 'SIGNATURE_MISMATCH',
      })
      .eq('id', payment.id);

    appError(400, 'INVALID_SIGNATURE', 'Payment signature verification failed');
  }

  // Step 4: Update payment to captured
  const { data: updatedPayment, error: updatePaymentError } = await supabase
    .from('payments')
    .update({
      status: 'captured',
      razorpay_payment_id,
      razorpay_signature,
    })
    .eq('id', payment.id)
    .select()
    .single();

  if (!updatedPayment) {
    appError(500, 'DB_ERROR', 'Failed to update payment');
  }

  // Step 5: Update application to applied
  const { data: updatedApp, error: updateAppError } = await supabase
    .from('applications')
    .update({
      status: 'applied',
    })
    .eq('id', application_id)
    .select()
    .single();

  if (!updatedApp) {
    appError(500, 'DB_ERROR', 'Failed to update application');
  }

  return {
    application: updatedApp,
    payment: updatedPayment,
  };
}

module.exports = {
  initiatePaidApply,
  confirmPayment,
  getApplicationStatus,
  getFeeForJob,
};
