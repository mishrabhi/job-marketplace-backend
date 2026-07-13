import { supabase } from '../config/db.js';
import { appError } from '../middlewares/errorHandler.js';
import { logger } from '../config/logger.js';

/**
 * Updates a bug bash blocker row to confirmed cleared status
 */
export const adjudicateLaunchBlocker = async (blockerId, notes) => {
  logger.info(`Clearing launch blocker item from rehearsal registry: ${blockerId}`);

  const { data: updatedBlocker, error } = await supabase
    .from('launch_blockers_log')
    .update({
      is_cleared: true,
      cleared_at: new Date().toISOString(),
      resolved_notes: notes
    })
    .eq('id', blockerId)
    .select()
    .single();

  if (error) throw appError(500, 'DB_ERROR', error.message);
  return updatedBlocker;
};

/**
 * Automates data retention purging policies to clear unneeded expired table lines
 */
export const applyDataRetentionScrub = async (policy, operatorId) => {
  logger.info(`🚨 CRITICAL COMPLIANCE: Triggering data retention pruning routine: ${policy}`);
  let deletedRowsCount = 0;

  if (policy === 'PRUNE_EXPIRED_DRAFT_OFFERS') {
    // Delete draft offers that have passed their validation window duration
    const { count, error } = await supabase
      .from('hr_offers')
      .delete({ count: 'exact' })
      .eq('status', 'draft')
      .lt('valid_until', new Date().toISOString());

    if (error) throw appError(500, 'RETENTION_PURGE_FAILED', error.message);
    deletedRowsCount = count || 0;
  } 
  
  else if (policy === 'PURGE_OLD_RETRY_LOGS') {
    // Clean up successful webhook rows over 30 days old to optimize processing overheads
    const staticCutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { count, error } = await supabase
      .from('webhook_retry_queue')
      .delete({ count: 'exact' })
      .eq('status', 'succeeded')
      .lt('created_at', staticCutoff);

    if (error) throw appError(500, 'RETENTION_PURGE_FAILED', error.message);
    deletedRowsCount = count || 0;
  }

  // Record history run metadata into persistent database ledger
  const { data: logReceipt, error: logErr } = await supabase
    .from('data_retention_runs')
    .insert([{
      policy_applied: policy,
      records_affected: deletedRowsCount,
      executed_by: operatorId
    }])
    .select()
    .single();

  if (logErr) throw appError(500, 'DB_ERROR', logErr.message);

  return logReceipt;
};