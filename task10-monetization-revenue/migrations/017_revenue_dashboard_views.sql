-- 1. REVENUE METRICS SUMMARY VIEW
-- Materializes key monetization performance indicators safely
CREATE OR REPLACE VIEW view_revenue_metrics_summary AS
SELECT
  COALESCE(SUM(amount) FILTER (WHERE status = 'captured'), 0) AS total_revenue_paise,
  COUNT(id) FILTER (WHERE status = 'captured') AS successful_transactions_count,
  COUNT(id) FILTER (WHERE status = 'failed') AS failed_transactions_count,
  COALESCE(SUM(amount) FILTER (WHERE status = 'refunded'), 0) AS total_refunded_paise,
  CASE 
    WHEN COUNT(id) FILTER (WHERE status IN ('captured', 'failed')) = 0 THEN 0
    ELSE (COUNT(id) FILTER (WHERE status = 'captured')::NUMERIC / COUNT(id) FILTER (WHERE status IN ('captured', 'failed'))::NUMERIC) * 100
  END AS payment_success_rate
FROM payments;

-- 2. DAILY REVENUE RECONCILIATION REPORT VIEW
-- Helps verify on a daily cadence that internal balances match what the gateway states 
CREATE OR REPLACE VIEW view_daily_revenue_reconciliation AS
SELECT
  created_at::DATE AS reconciliation_date,
  COUNT(id) FILTER (WHERE status = 'captured') AS internal_success_count,
  COALESCE(SUM(amount) FILTER (WHERE status = 'captured'), 0) AS internal_captured_paise,
  COUNT(id) FILTER (WHERE status = 'refunded') AS internal_refund_count,
  COALESCE(SUM(amount) FILTER (WHERE status = 'refunded'), 0) AS internal_refunded_paise
FROM payments
GROUP BY created_at::DATE
ORDER BY reconciliation_date DESC;