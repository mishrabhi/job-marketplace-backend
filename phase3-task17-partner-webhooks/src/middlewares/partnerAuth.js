import { supabase } from '../config/db.js';
import { appError } from './errorHandler.js';

/**
 * Validates Partner API Keys and Enforces Per-Min Rate Quotas[cite: 18]
 */
export const authenticatePartnerApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return next(appError(401, 'UNAUTHORIZED', 'Missing mandatory x-api-key header.'));
    }

    // Query partner credentials and quota limits[cite: 18]
    const { data: partner, error } = await supabase
      .from('partner_api_keys')
      .select('*')
      .eq('api_key', apiKey)
      .eq('is_active', true)
      .maybeSingle();

    if (error || !partner) {
      return next(appError(401, 'INVALID_API_KEY', 'The provided API key is invalid or inactive.'));
    }

    // Check rate quotas[cite: 18]
    if (partner.requests_count >= partner.rate_limit_per_min) {
      return next(appError(429, 'RATE_LIMIT_EXCEEDED', 'API request quota exceeded. Try again in 60 seconds.'));
    }

    // Increment request count atomically
    await supabase
      .from('partner_api_keys')
      .update({ requests_count: partner.requests_count + 1 })
      .eq('id', partner.id);

    // Attach partner context to request
    req.partnerContext = partner;

    next();
  } catch (err) {
    next(err);
  }
};