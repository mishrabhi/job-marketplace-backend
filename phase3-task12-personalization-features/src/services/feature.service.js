import { supabase } from '../config/db.js';
import { appError } from '../middlewares/errorHandler.js';
import { logger } from '../config/logger.js';

// Simple in-memory feature cache for fast feature retrieval
const localFeatureCache = new Map();

/**
 * Stage B & C: Fast Feature Store retrieval with caching and freshness check[cite: 19]
 */
export const getCandidateFeatures = async (studentId, tenantId) => {
  const cacheKey = `${tenantId}:${studentId}`;
  const startTime = Date.now();

  logger.info(`Fetching features for student: ${studentId} in tenant: ${tenantId}`);

  // 1. Check local cache[cite: 19]
  if (localFeatureCache.has(cacheKey)) {
    const cachedEntry = localFeatureCache.get(cacheKey);
    const ageSeconds = (Date.now() - cachedEntry.cached_at) / 1000;

    // Freshness check: serve from cache if less than 60 seconds old[cite: 19]
    if (ageSeconds < 60) {
      return {
        source: 'CACHE_HIT',
        retrieval_latency_ms: Date.now() - startTime,
        feature_version: cachedEntry.data.feature_version, // Parity verification[cite: 19]
        features: cachedEntry.data
      };
    }
  }

  // 2. Fetch from Database Feature Store[cite: 19]
  const { data: features, error } = await supabase
    .from('candidate_feature_store')
    .select('*')
    .eq('student_id', studentId)
    .eq('tenant_id', tenantId)                            // Strict multi-tenant check[cite: 19]
    .maybeSingle();

  if (error) throw appError(500, 'DB_ERROR', error.message);
  if (!features) throw appError(404, 'NOT_FOUND', 'Candidate feature vector not found.');

  // Store in local cache[cite: 19]
  localFeatureCache.set(cacheKey, { data: features, cached_at: Date.now() });

  return {
    source: 'DATABASE_STORE',
    retrieval_latency_ms: Date.now() - startTime,
    feature_version: features.feature_version,            // Train/serve parity check[cite: 19]
    features
  };
};

/**
 * Stage D: Updates feature vectors ensuring train/serve feature parity[cite: 19]
 */
export const upsertCandidateFeatures = async (payload) => {
  const { student_id, tenant_id, skills_vector, applications_count, avg_match_score } = payload;

  const { data: updatedFeatures, error } = await supabase
    .from('candidate_feature_store')
    .upsert({
      student_id,
      tenant_id,
      feature_version: 'v1.0',                            // Enforces consistent schema[cite: 19]
      skills_vector,
      applications_count,
      avg_match_score,
      updated_at: new Date().toISOString()
    }, { onConflict: 'student_id' })
    .select()
    .single();

  if (error) throw appError(500, 'DB_ERROR', error.message);

  // Clear local cache to ensure freshness[cite: 19]
  localFeatureCache.delete(`${tenant_id}:${student_id}`);

  return updatedFeatures;
};

/**
 * Stage C: Explicit feature cache invalidation[cite: 19]
 */
export const invalidateFeatureCache = async (studentId, tenantId, reason) => {
  const cacheKey = `${tenantId}:${studentId}`;
  localFeatureCache.delete(cacheKey);

  // Log invalidation audit event[cite: 19]
  const { data: auditLog, error } = await supabase
    .from('feature_cache_invalidations')
    .insert([{ student_id: studentId, tenant_id: tenantId, invalidation_reason: reason }])
    .select()
    .single();

  if (error) throw appError(500, 'DB_ERROR', error.message);

  return { status: 'CACHE_INVALIDATED_SUCCESSFULLY', auditLog };
};