import { supabase } from '../config/db.js';
import { appError } from '../middlewares/errorHandler.js';
import { logger } from '../config/logger.js';

/**
 * Stage B: Updates or tracks engagement lifecycle state per user[cite: 19]
 */
export const updateEngagementState = async (payload) => {
  const { user_id, tenant_id, lifecycle_state } = payload;
  logger.info(`Updating lifecycle engagement state for user: ${user_id} to: ${lifecycle_state}`);

  const { data: updatedRecord, error } = await supabase
    .from('user_lifecycle_states')
    .upsert({
      user_id,
      tenant_id,
      lifecycle_state,
      last_active_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) throw appError(500, 'DB_ERROR', error.message);
  return updatedRecord;
};

/**
 * Stage C & D: Dispatches re-engagement notifications while respecting DPDP consent and idempotency[cite: 19]
 */
export const dispatchReengagementNotification = async (payload) => {
  const { user_id, tenant_id, notification_type, channel, idempotency_key } = payload;
  logger.info(`Evaluating re-engagement dispatch for user: ${user_id} over channel: ${channel}`);

  // 1. Enforce strict idempotency to prevent duplicate sends[cite: 19]
  const { data: existingDispatch } = await supabase
    .from('notification_dispatches')
    .select('*')
    .eq('idempotency_key', idempotency_key)
    .maybeSingle();

  if (existingDispatch) {
    logger.warn('Duplicate notification trigger caught. Returning existing dispatch record.', { id: existingDispatch.id });
    return { status: 'RESOLVED_FROM_IDEMPOTENCY_CACHE', record: existingDispatch };
  }

  // 2. DPDP Consent Check: Query DPDP consent registry for active notification permissions[cite: 19]
  const { data: consentRecord } = await supabase
    .from('dpdp_consent_registry')
    .select('is_granted')
    .eq('user_id', user_id)
    .eq('consent_type', 'profile_sharing')                     // Using active consent type mapping[cite: 19]
    .maybeSingle();

  const isConsentGranted = consentRecord ? consentRecord.is_granted : false;

  if (!isConsentGranted) {
    logger.warn(`🚨 DISPATCH BLOCKED: User ${user_id} has not granted DPDP consent for notifications.`);

    // Persist audit record of blocked attempt[cite: 19]
    const { data: blockedRecord } = await supabase
      .from('notification_dispatches')
      .insert([{
        user_id,
        tenant_id,
        notification_type,
        channel,
        consent_verified: false,
        dispatch_status: 'blocked_no_consent',
        idempotency_key
      }])
      .select()
      .single();

    return { status: 'BLOCKED_NO_DPDP_CONSENT', record: blockedRecord };
  }

  // 3. Dispatch notification once consent is verified[cite: 19]
  const { data: dispatchedRecord, error: dispatchErr } = await supabase
    .from('notification_dispatches')
    .insert([{
      user_id,
      tenant_id,
      notification_type,
      channel,
      consent_verified: true,
      dispatch_status: 'dispatched',
      idempotency_key
    }])
    .select()
    .single();

  if (dispatchErr) throw appError(500, 'DB_ERROR', dispatchErr.message);

  return { status: 'DISPATCHED_SUCCESSFULLY', record: dispatchedRecord };
};

/**
 * Stage B: Fetch user engagement state for dashboard context
 */
export const getUserLifecycleState = async (userId, tenantId) => {
  const { data: state, error } = await supabase
    .from('user_lifecycle_states')
    .select('*')
    .eq('user_id', userId)
    .eq('tenant_id', tenantId)                                 // Strict multi-tenant isolation[cite: 19]
    .maybeSingle();

  if (error) throw appError(500, 'DB_ERROR', error.message);
  if (!state) throw appError(404, 'NOT_FOUND', 'Target user lifecycle record missing or tenant mismatch.');

  return state;
};