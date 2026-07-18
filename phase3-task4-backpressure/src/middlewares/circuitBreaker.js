import { env } from '../config/env.js';
import { appError } from './errorHandler.js';
import { supabase } from '../config/db.js';
import { logger } from '../config/logger.js';

/**
 * Resilient Multi-Tenant Circuit Breaker Middleware to prevent cascading failures[cite: 20]
 */
export const paymentGatewayBreaker = async (req, res, next) => {
  const dependency = 'RAZORPAY_GATEWAY';
  
  // 1. Fetch current runtime state of the breaker directly from the persistent data layer
  let { data: stateProfile } = await supabase
    .from('circuit_breaker_states')
    .select('*')
    .eq('dependency_name', dependency)
    .maybeSingle();

  if (!stateProfile) {
    // Seed standard profile if missing
    const { data: seeded } = await supabase
      .from('circuit_breaker_states')
      .insert([{ dependency_name: dependency, current_state: 'CLOSED', failure_count: 0 }])
      .select().single();
    stateProfile = seeded;
  }

  if (stateProfile.current_state === 'OPEN') {
    const timeElapsedTime = Date.now() - new Date(stateProfile.last_tripped_at).getTime();
    
    if (timeElapsedTime > env.BREAKER_COOLDOWN_MS) {
      // Transition to HALF_OPEN to sample a test transaction
      await supabase
        .from('circuit_breaker_states')
        .update({ current_state: 'HALF_OPEN', updated_at: new Date().toISOString() })
        .eq('dependency_name', dependency);
      logger.warn(`🔄 Circuit Breaker entering HALF_OPEN status for dependency: ${dependency}`);
    } else {
      // Shed load instantly rather than cascading into total collapse[cite: 20]
      return next(appError(503, 'SERVICE_UNAVAILABLE', 'Backpressure limit reached: Circuit breaker is currently OPEN. Traffic shed safely.'));
    }
  }

  next();
};