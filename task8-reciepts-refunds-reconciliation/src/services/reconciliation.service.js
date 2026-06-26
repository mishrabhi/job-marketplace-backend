import supabase from '../config/db';
import razorpay from '../config/razorpay';
import appError from '../middlewares/errorHandler';

/**
 * Build start and end of a given YYYY-MM-DD date in ISO format.
 */
export default dayBounds = (dateStr) => {
  const start = new Date(`${dateStr}T00:00:00.000Z`);
  const end = new Date(`${dateStr}T23:59:59.999Z`);
  return { start: start.toISOString(), end: end.toISOString() };
};

/**
 * Generate a daily reconciliation report.
 *
 * Compares:
 *   - Our DB: sum of captured payments for the date
 *   - Razorpay API: sum of payments fetched for the same date range
 *
 * Upserts into reconciliation_reports (one row per date).
 * Returns the report.
 */
export default generateReconciliationReport = async (dateStr) => {
  const targetDate = dateStr || new Date().toISOString().slice(0, 10); // default: today
  const { start, end } = dayBounds(targetDate);

  // ── Step 1: Fetch our captured payments for the date ──────────────
  const { data: capturedPayments, error: capErr } = await supabase
    .from('payments')
    .select('id, amount, razorpay_payment_id, status')
    .eq('status', 'captured')
    .gte('created_at', start)
    .lte('created_at', end);

  if (capErr) throw appError(500, 'DB_ERROR', capErr.message);

  // ── Step 2: Fetch our failed payments for the date ────────────────
  const { data: failedPayments, error: failErr } = await supabase
    .from('payments')
    .select('id')
    .eq('status', 'failed')
    .gte('created_at', start)
    .lte('created_at', end);

  if (failErr) throw appError(500, 'DB_ERROR', failErr.message);

  // ── Step 3: Fetch our refunds for the date ────────────────────────
  const { data: refundedPayments, error: refErr } = await supabase
    .from('payments')
    .select('id, amount')
    .eq('status', 'refunded')
    .gte('created_at', start)
    .lte('created_at', end);

  if (refErr) throw appError(500, 'DB_ERROR', refErr.message);

  // ── Step 4: Fetch all payment orders for the date ─────────────────
  const { data: allOrders, error: orderErr } = await supabase
    .from('payments')
    .select('id')
    .gte('created_at', start)
    .lte('created_at', end);

  if (orderErr) throw appError(500, 'DB_ERROR', orderErr.message);

  // Our totals
  const our_captured_paise = (capturedPayments || []).reduce((sum, p) => sum + p.amount, 0);
  const our_refunded_paise = (refundedPayments || []).reduce((sum, p) => sum + p.amount, 0);
  const our_net_paise = our_captured_paise - our_refunded_paise;

  // ── Step 5: Fetch Razorpay payments for the date ──────────────────
  let gateway_captured_paise = 0;
  let gateway_refunded_paise = 0;
  const discrepancies = [];

  try {
    // Razorpay expects Unix timestamps
    const fromTs = Math.floor(new Date(start).getTime() / 1000);
    const toTs = Math.floor(new Date(end).getTime() / 1000);

    const rzpResponse = await razorpay.payments.all({
      from: fromTs,
      to: toTs,
      count: 100, // max per call; for production add pagination
    });

    const rzpPayments = rzpResponse.items || [];

    // Sum captured from Razorpay
    const rzpCaptured = rzpPayments.filter((p) => p.status === 'captured');
    gateway_captured_paise = rzpCaptured.reduce((sum, p) => sum + p.amount, 0);

    // Sum refunded from Razorpay (refund_status = 'full')
    const rzpRefunded = rzpPayments.filter((p) => p.refund_status === 'full');
    gateway_refunded_paise = rzpRefunded.reduce((sum, p) => sum + p.amount_refunded, 0);

    // ── Step 6: Cross-check — find payments in our DB but not in Razorpay ──
    const rzpPaymentIds = new Set(rzpPayments.map((p) => p.id));
    for (const p of capturedPayments || []) {
      if (p.razorpay_payment_id && !rzpPaymentIds.has(p.razorpay_payment_id)) {
        discrepancies.push({
          type: 'IN_DB_NOT_IN_GATEWAY',
          payment_id: p.id,
          razorpay_payment_id: p.razorpay_payment_id,
          amount_paise: p.amount,
        });
      }
    }

    // Find payments in Razorpay (captured) not matched in our DB
    const ourRzpIds = new Set(
      (capturedPayments || []).map((p) => p.razorpay_payment_id).filter(Boolean)
    );
    for (const p of rzpCaptured) {
      if (!ourRzpIds.has(p.id)) {
        discrepancies.push({
          type: 'IN_GATEWAY_NOT_IN_DB',
          razorpay_payment_id: p.id,
          amount_paise: p.amount,
        });
      }
    }
  } catch (rzpErr) {
    // Razorpay API unavailable — still save our side, note the issue
    discrepancies.push({
      type: 'GATEWAY_FETCH_FAILED',
      reason: rzpErr.message,
    });
  }

  const matched =
    discrepancies.length === 0 && our_captured_paise === gateway_captured_paise;

  // ── Step 7: Upsert the report ──────────────────────────────────────
  const { data: report, error: upsertErr } = await supabase
    .from('reconciliation_reports')
    .upsert(
      {
        report_date: targetDate,
        total_orders: (allOrders || []).length,
        total_captured: (capturedPayments || []).length,
        total_failed: (failedPayments || []).length,
        total_refunded: (refundedPayments || []).length,
        our_captured_paise,
        our_refunded_paise,
        our_net_paise,
        gateway_captured_paise,
        gateway_refunded_paise,
        matched,
        discrepancies,
        generated_at: new Date().toISOString(),
      },
      { onConflict: 'report_date' }
    )
    .select()
    .single();

  if (upsertErr) throw appError(500, 'DB_ERROR', upsertErr.message);

  return report;
};

/**
 * Get an existing reconciliation report by date.
 * Does NOT re-generate — call generateReconciliationReport to refresh.
 */
export default getReconciliationReport = async (dateStr) => {
  const targetDate = dateStr || new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('reconciliation_reports')
    .select('*')
    .eq('report_date', targetDate)
    .single();

  if (error || !data) {
    throw appError(404, 'REPORT_NOT_FOUND',
      `No reconciliation report for ${targetDate}. POST to /reconciliation/generate first.`
    );
  }
  return data;
};

/**
 * List recent reconciliation reports.
 */
export default listReconciliationReports = async ({ page = 1, limit = 30 } = {}) => {
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('reconciliation_reports')
    .select('*', { count: 'exact' })
    .order('report_date', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw appError(500, 'DB_ERROR', error.message);

  return {
    data: data || [],
    meta: { page, limit, total: count || 0 },
  };
};
