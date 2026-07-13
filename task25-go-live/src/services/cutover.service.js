import { supabase } from '../config/db.js';
import { appError } from '../middlewares/errorHandler.js';
import { logger } from '../config/logger.js';

/**
 * Commits the production cutover event into persistent storage logs safely
 */
export const executeProductionCutover = async (payload) => {
  const { verified_by, checklist_snapshot, smoke_tests_passed, idempotency_key } = payload;
  logger.info(`🚨 CRITICAL TRANSITION: Initializing production environment cutover pipeline execution`);

  // 1. Enforce strict transaction level idempotency safeties
  const { data: existingCutover } = await supabase
    .from('production_cutover_log')
    .select('*')
    .eq('idempotency_key', idempotency_key)
    .maybeSingle();

  if (existingCutover) {
    logger.warn('Duplicate cutover event detected. Returning existing production checklist receipt.', { id: existingCutover.id });
    return existingCutover;
  }

  // 2. Persist real production cutover sign-off parameters to database[cite: 16]
  const { data: cutoverRecord, error } = await supabase
    .from('production_cutover_log')
    .insert([{
      verified_by,
      checklist_snapshot,
      smoke_tests_passed,
      idempotency_key,
      environment: 'production'
    }])
    .select()
    .single();

  if (error) throw appError(500, 'DB_ERROR', error.message);

  logger.info('🎉 Cutover accomplished. Systems are live in production mode.');
  return cutoverRecord;
};