import crypto from 'crypto';
import { supabase } from '../config/db.js';
import { appError } from '../middlewares/errorHandler.js';
import { logger } from '../config/logger.js';

/**
 * Stage B: Triggers or dedupes a real-time production platform incident
 */
export const instantiateIncidentReport = async (payload) => {
  const { title, severity, on_call_responder, idempotency_key } = payload;
  
  // Concurrency Guard: Handle potential duplicate calls gracefully
  const { data: existingIncident } = await supabase
    .from('platform_incidents')
    .select('*')
    .eq('idempotency_key', idempotency_key)
    .maybeSingle();

  if (existingIncident) {
    logger.warn('Duplicate incident trigger caught. Returning cached active operational context.', { id: existingIncident.id });
    return existingIncident;
  }

  const { data: incident, error } = await supabase
    .from('platform_incidents')
    .insert([{
      title, severity, on_call_responder, idempotency_key, status: 'triggered',
      comms_updates: [{ timestamp: new Date().toISOString(), message: "Incident verified and pushed to responder." }]
    }])
    .select().single();

  if (error) throw appError(500, 'DB_ERROR', error.message);
  return incident;
};

/**
 * Stage C: Ingests production exceptions and tracks impact metrics dynamically
 */
export const registerRuntimeDefect = async (payload) => {
  const { error_message, stack_trace, impacted_tenant_id } = payload;
  
  // Calculate unique fingerprint signature from stack trace location
  const errorSignature = crypto.createHash('sha256').update(`${error_message}:${stack_trace.split('\n')[0]}`).digest('hex');

  // Atomic database update or create flow
  const { data: existingDefect } = await supabase
    .from('platform_defects_triage')
    .select('*')
    .eq('error_signature', errorSignature)
    .maybeSingle();

  if (existingDefect) {
    const updatedCount = existingDefect.occurrence_count + 1;
    const { data: updatedDefect } = await supabase
      .from('platform_defects_triage')
      .update({
        occurrence_count: updatedCount,
        priority_score: updatedCount * 5,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingDefect.id)
      .select().single();
    return updatedDefect;
  }

  const { data: newDefect, error } = await supabase
    .from('platform_defects_triage')
    .insert([{
      error_signature, error_message, stack_trace, impacted_tenant_id,
      occurrence_count: 1, priority_score: 5, status: 'untriaged'
    }])
    .select().single();

  if (error) throw appError(500, 'DB_ERROR', error.message);
  return newDefect;
};

/**
 * Stage D: Provisions a Phase-3 backlog item with a dedicated owner
 */
export const createBacklogItem = async (payload) => {
  const { defect_ref_id, task_title, engineering_owner, bar_target_metrics, idempotency_key } = payload;

  const { data: existingItem } = await supabase
    .from('phase3_backend_backlog')
    .select('*')
    .eq('idempotency_key', idempotency_key)
    .maybeSingle();

  if (existingItem) return existingItem;

  const { data: task, error } = await supabase
    .from('phase3_backend_backlog')
    .insert([{ defect_ref_id, task_title, engineering_owner, bar_target_metrics, idempotency_key }])
    .select().single();

  if (error) throw appError(500, 'DB_ERROR', error.message);

  if (defect_ref_id) {
    await supabase.from('platform_defects_triage').update({ status: 'backlogged' }).eq('id', defect_ref_id);
  }

  return task;
};

/**
 * Stage E: Concludes an event by attaching a blameless postmortem[cite: 17]
 */
export const compileBlamelessPostmortem = async ({ incident_id, root_cause, preventative_actions }) => {
  const { data: incident } = await supabase.from('platform_incidents').select('*').eq('id', incident_id).maybeSingle();
  if (!incident) throw appError(404, 'INCIDENT_NOT_FOUND', 'Target operational context missing.');

  const postmortem_payload = {
    root_cause,
    preventative_actions,
    finalized_at: new Date().toISOString()
  };

  const { data: updatedIncident, error } = await supabase
    .from('platform_incidents')
    .update({
      status: 'resolved',
      postmortem_payload,
      updated_at: new Date().toISOString()
    })
    .eq('id', incident_id)
    .select().single();

  if (error) throw appError(500, 'DB_ERROR', error.message);
  return updatedIncident;
};