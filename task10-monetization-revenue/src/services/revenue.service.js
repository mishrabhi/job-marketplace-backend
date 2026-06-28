import supabase from ('../config/db');
import razorpay from ('../config/razorpay');
import logger from ('../config/logger');
import env from ('../config/env');
import appError from ('../middlewares/errorHandler');

/**
 * Generates aggregated monetization and system analytics metrics 
 */
export default getRevenueDashboardMetrics = async (filters) => {
  logger.info('Fetching revenue metrics summary from database', { filters });

  // Read aggregated performance analytics directly from database persistence view 
  let query = supabase.from('view_revenue_metrics_summary').select('*').single();
  
  const { data: metrics, error: mErr } = await query;
  if (mErr) throw appError(500, 'DB_ERROR', `Failed fetching analytical views: ${mErr.message}`);

  // Fetch contextual historical time series chart-data elements
  let seriesQuery = supabase
    .from('view_daily_revenue_reconciliation')
    .select('*')
    .limit(30);

  const { data: timeline, error: tErr } = await seriesQuery;
  if (tErr) throw appError(500, 'DB_ERROR', `Failed fetching timeline data: ${tErr.message}`);

  return {
    operational_mode: env.IS_REAL_MONEY_MODE ? 'LIVE_REAL_MONEY' : 'TEST_MODE',
    summary: {
      total_revenue_inr: (metrics?.total_revenue_paise || 0) / 100,
      total_refunded_inr: (metrics?.total_refunded_paise || 0) / 100,
      successful_payments: metrics?.successful_transactions_count || 0,
      failed_payments: metrics?.failed_transactions_count || 0,
      success_rate_percentage: parseFloat(metrics?.payment_success_rate || 0).toFixed(2)
    },
    historical_timeline: timeline || []
  };
};

/**
 * Runs active Daily Reconciliation balancing validations against live payment gateway state APIs 
 */
export default performGatewayReconciliation = async (targetDate) => {
  const dateStr = targetDate || new Date().toISOString().split('T')[0];
  logger.info(`Starting gateway daily balance sheet reconciliation for date: ${dateStr}`);

  // 1. Fetch internal calculations from persistent database ledger rows 
  const { data: internalLedger, error: dbErr } = await supabase
    .from('view_daily_revenue_reconciliation')
    .eq('reconciliation_date', dateStr)
    .maybeSingle();

  if (dbErr) throw appError(500, 'DB_ERROR', dbErr.message);

  // 2. Query Razorpay API endpoint states to verify external source-of-truth balances 
  let gatewayCapturedSum = 0;
  let gatewayCount = 0;

  try {
    // Note: Razorpay treats timestamps in UNIX epoch seconds format
    const fromEpoch = Math.floor(new Date(dateStr + 'T00:00:00Z').getTime() / 1000);
    const toEpoch = Math.floor(new Date(dateStr + 'T23:59:59Z').getTime() / 1000);

    const paymentOrders = await razorpay.orders.all({
      from: fromEpoch,
      to: toEpoch,
      count: 100
    });

    if (paymentOrders && paymentOrders.items) {
      paymentOrders.items.forEach(order => {
        if (order.status === 'paid') {
          gatewayCapturedSum += order.amount_paid;
          gatewayCount++;
        }
      });
    }
  } catch (err) {
    logger.error('Failed communicating query verification tasks to Razorpay SDK', { error: err.message });
    throw appError(502, 'GATEWAY_ERROR', `Verification check failed with Razorpay: ${err.message}`);
  }

  // 3. Compare data states to ensure perfect alignment 
  const internalPaise = internalLedger?.internal_captured_paise || 0;
  const isReconciled = internalPaise === gatewayCapturedSum && (internalLedger?.internal_success_count || 0) === gatewayCount;

  if (!isReconciled) {
    logger.error(`🚨 Balance sheet mismatch detected for date ${dateStr}! Internal: ${internalPaise} Paise vs Gateway: ${gatewayCapturedSum} Paise`);
  } else {
    logger.info(`✅ Daily transaction validation complete for date ${dateStr}. Financial states are cleanly matched.`);
  }

  return {
    reconciliation_date: dateStr,
    is_fully_reconciled: isReconciled,
    internal_records: {
      captured_amount_inr: internalPaise / 100,
      successful_transactions: internalLedger?.internal_success_count || 0
    },
    gateway_records: {
      captured_amount_inr: gatewayCapturedSum / 100,
      successful_transactions: gatewayCount
    },
    discrepancy_detected: !isReconciled
  };
};
    