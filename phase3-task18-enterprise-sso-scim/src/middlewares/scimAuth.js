import { supabase } from '../config/db.js';
import { appError } from './errorHandler.js';

/**
 * Validates SCIM 2.0 Bearer tokens and attaches tenant context[cite: 18]
 */
export const authenticateSCIMBearer = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(appError(401, 'UNAUTHORIZED', 'Missing or malformed SCIM Bearer token authorization header.'));
    }

    const token = authHeader.split(' ')[1];

    const { data: tokenRecord, error } = await supabase
      .from('scim_bearer_tokens')
      .select('tenant_id')
      .eq('scim_token', token)
      .maybeSingle();

    if (error || !tokenRecord) {
      return next(appError(401, 'INVALID_SCIM_TOKEN', 'The provided SCIM bearer token is invalid or unassigned.'));
    }

    req.scimContext = { tenantId: tokenRecord.tenant_id };
    next();
  } catch (err) {
    next(err);
  }
};