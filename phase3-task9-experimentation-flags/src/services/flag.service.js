import crypto from 'crypto';
import { supabase } from '../config/db.js';
import { appError } from '../middlewares/errorHandler.js';
import { logger } from '../config/logger.js';

/**
 * Deterministic hash algorithm for sticky variant assignment[cite: 19]
 */
const calculateStickyVariant = (userId, flagKey, variants) => {
  const hashInput = `${userId}:${flagKey}`;
  const hash = crypto.createHash('md5').update(hashInput).digest('hex');
  const numericValue = parseInt(hash.substring(0, 8), 16);
  const index = numericValue % variants.length;
  return variants[index];
};

/**
 * Stage B & C: Evaluates flag assignment deterministically and logs exposure[cite: 19]
 */
export const evaluateFeatureFlag = async (flagKey, userId, tenantId) => {
  logger.info(`Evaluating flag assignment: ${flagKey} for user: ${userId}`);

  // 1. Fetch flag configuration
  const { data: flag, error } = await supabase
    .from('feature_flags')
    .select('*')
    .eq('flag_key', flagKey)
    .maybeSingle();

  if (error) throw appError(500, 'DB_ERROR', error.message);

  // Fallback if flag does not exist or Kill Switch is flipped[cite: 19]
  if (!flag || !flag.is_active) {
    logger.warn(`🚩 Kill switch ACTIVE or flag missing for key: ${flagKey}. Serving fallback 'control'.`);
    return {
      flag_key: flagKey,
      variant: 'control',
      is_kill_switch_active: !flag || !flag.is_active,
      reason: !flag ? 'FLAG_NOT_FOUND' : 'KILL_SWITCH_ENGAGED'
    };
  }

  // 2. Deterministic sticky variant calculation[cite: 19]
  const assignedVariant = calculateStickyVariant(userId, flagKey, flag.variants);

  // 3. Log exposure asynchronously for analytical tracking[cite: 19]
  await supabase.from('experiment_exposures').insert([{
    flag_key: flagKey,
    user_id: userId,
    tenant_id: tenantId,                                     // Strict multi-tenant tracking[cite: 19]
    assigned_variant: assignedVariant
  }]);

  return {
    flag_key: flagKey,
    variant: assignedVariant,
    is_kill_switch_active: false,
    reason: 'STICKY_ASSIGNMENT_MATCH'
  };
};

/**
 * Stage D: Instant kill switch execution to disable a flag[cite: 19]
 */
export const updateKillSwitchState = async (flagKey, isActive) => {
  logger.info(`🚨 KILL SWITCH UPDATE: Setting active state for flag ${flagKey} to ${isActive}`);

  const { data: updatedFlag, error } = await supabase
    .from('feature_flags')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('flag_key', flagKey)
    .select()
    .single();

  if (error) throw appError(500, 'DB_ERROR', error.message);
  if (!updatedFlag) throw appError(404, 'NOT_FOUND', 'Target feature flag key not found.');

  return updatedFlag;
};

/**
 * Registers a new feature flag/experiment
 */
export const registerFeatureFlag = async (payload) => {
  const { flag_key, description, variants, traffic_allocation, owner_email, expires_at } = payload;

  const { data: newFlag, error } = await supabase
    .from('feature_flags')
    .insert([{
      flag_key,
      description,
      variants,
      traffic_allocation,
      owner_email,
      expires_at: expires_at || null
    }])
    .select()
    .single();

  if (error) throw appError(500, 'DB_ERROR', error.message);
  return newFlag;
};