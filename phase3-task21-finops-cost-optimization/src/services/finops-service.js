import { supabase } from '../config/db.js';
import { appError } from '../middlewares/errorHandler.js';
import { logger } from '../config/logger.js';

/**
 * Calculates estimated infrastructure cost based on compute time and egress bytes[cite: 17]
 */
const calculateInfrastructureCost = (payloadBytes, queryTimeMs, isOptimized) => {
  const baseComputeRatePerMs = 0.0001;                       // Base INR cost per ms query compute time
  const baseEgressRatePerByte = 0.000002;                     // Base INR cost per byte payload egress

  let computeCost = queryTimeMs * baseComputeRatePerMs;
  let egressCost = payloadBytes * baseEgressRatePerByte;

  if (isOptimized) {
    // Optimization applies payload compression (60% egress reduction) and query index caching (50% compute reduction)[cite: 17]
    computeCost *= 0.50;
    egressCost *= 0.40;
  }

  return parseFloat((computeCost + egressCost).toFixed(6));
};

/**
 * Stage B & C: Attributes and records granular backend workload transaction cost[cite: 17]
 */
export const recordWorkloadCost = async (payload) => {
  const { tenant_id, operation_type, payload_bytes, db_query_time_ms, is_optimized, idempotency_key } = payload;

  logger.info(`Recording workload cost for tenant ${tenant_id} [Operation: ${operation_type}, Optimized: ${is_optimized}]`);

  // 1. Idempotency assertion[cite: 17]
  const { data: existingEntry } = await supabase
    .from('finops_workload_costs')
    .select('*')
    .eq('idempotency_key', idempotency_key)
    .maybeSingle();

  if (existingEntry) {
    logger.warn('Duplicate workload cost entry caught. Returning cached record.');
    return existingEntry;
  }

  // 2. Compute cost attribution[cite: 17]
  const estimatedCost = calculateInfrastructureCost(payload_bytes, db_query_time_ms, is_optimized);

  const { data: costRecord, error } = await supabase
    .from('finops_workload_costs')
    .insert([{
      tenant_id,                                              // Multi-tenant boundary isolation[cite: 17]
      operation_type,
      payload_bytes: is_optimized ? Math.floor(payload_bytes * 0.4) : payload_bytes, // Payload size reduction[cite: 17]
      db_query_time_ms: is_optimized ? Math.floor(db_query_time_ms * 0.5) : db_query_time_ms, // Query cost reduction[cite: 17]
      estimated_cost_inr: estimatedCost,
      is_optimized,
      idempotency_key
    }])
    .select()
    .single();

  if (error) throw appError(500, 'DB_ERROR', error.message);
  return costRecord;
};

/**
 * Stage D: Computes before/after unit economics metrics per 1,000 transactions[cite: 17]
 */
export const computeUnitEconomicsSummary = async (tenantId, batchIdentifier) => {
  logger.info(`Computing unit economics summary for tenant ${tenantId}, batch: ${batchIdentifier}`);

  const { data: records, error } = await supabase
    .from('finops_workload_costs')
    .select('*')
    .eq('tenant_id', tenantId);                               // Strict tenant isolation check[cite: 17]

  if (error) throw appError(500, 'DB_ERROR', error.message);

  const totalCount = records?.length || 0;
  if (totalCount === 0) {
    throw appError(404, 'NO_DATA', 'No workload cost records found for unit economics evaluation.');
  }

  const totalCostINR = records.reduce((sum, r) => sum + parseFloat(r.estimated_cost_inr), 0);
  const avgLatency = records.reduce((sum, r) => sum + r.db_query_time_ms, 0) / totalCount;
  const costPer1kINR = parseFloat(((totalCostINR / totalCount) * 1000).toFixed(2));

  // Persist summary ledger[cite: 17]
  const { data: summaryRecord, error: summaryErr } = await supabase
    .from('finops_unit_economics')
    .insert([{
      tenant_id: tenantId,
      batch_identifier: batchIdentifier,
      transaction_count: totalCount,
      total_cost_inr: parseFloat(totalCostINR.toFixed(2)),
      cost_per_1k_inr: costPer1kINR,
      avg_latency_ms: parseFloat(avgLatency.toFixed(2))
    }])
    .select()
    .single();

  if (summaryErr) throw appError(500, 'DB_ERROR', summaryErr.message);

  return summaryRecord;
};