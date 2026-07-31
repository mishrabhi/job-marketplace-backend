import crypto from 'crypto';
import { supabase } from '../config/db.js';
import { appError } from '../middlewares/errorHandler.js';
import { logger } from '../config/logger.js';

/**
 * Registers a new partner API key and secret[cite: 18]
 */
export const createPartnerCredentials = async (payload) => {
  const { partner_name, tenant_id, environment, rate_limit_per_min } = payload;

  const apiKey = `pk_${environment}_${crypto.randomBytes(16).toString('hex')}`;
  const webhookSecret = `whsec_${crypto.randomBytes(24).toString('hex')}`;

  const { data, error } = await supabase
    .from('partner_api_keys')
    .insert([{
      partner_name,
      tenant_id,                                              // Strict multi-tenant tracking[cite: 18]
      api_key: apiKey,
      webhook_secret: webhookSecret,
      environment,
      rate_limit_per_min
    }])
    .select()
    .single();

  if (error) throw appError(500, 'DB_ERROR', error.message);
  return data;
};

/**
 * Stage C: Dispatches signed webhook with HMAC-SHA256 signature and replay protection[cite: 18]
 */
export const dispatchSignedWebhook = async (partnerContext, webhookData) => {
  const { target_url, event_type, payload, idempotency_key } = webhookData;
  const timestamp = Math.floor(Date.now() / 1000);

  logger.info(`Preparing signed webhook dispatch for partner: ${partnerContext.partner_name} [${partnerContext.environment}]`);

  // 1. Enforce idempotency[cite: 18]
  const { data: existingLog } = await supabase
    .from('webhook_dispatch_logs')
    .select('*')
    .eq('idempotency_key', idempotency_key)
    .maybeSingle();

  if (existingLog) {
    logger.warn('Duplicate webhook dispatch trigger caught. Returning cached receipt.', { id: existingLog.id });
    return existingLog;
  }

  // 2. Generate HMAC-SHA256 cryptographic signature[cite: 18]
  const signedPayload = `${timestamp}.${JSON.stringify(payload)}`;
  const hmacSignature = crypto
    .createHmac('sha256', partnerContext.webhook_secret)
    .update(signedPayload)
    .digest('hex');

  const signatureHeader = `t=${timestamp},v1=${hmacSignature}`;

  // 3. Persist webhook dispatch log[cite: 18]
  const { data: dispatchRecord, error } = await supabase
    .from('webhook_dispatch_logs')
    .insert([{
      partner_id: partnerContext.id,
      tenant_id: partnerContext.tenant_id,                    // Multi-tenant isolation[cite: 18]
      target_url,
      event_type,
      payload,
      signature_header: signatureHeader,
      attempts_count: 1,
      delivery_status: partnerContext.environment === 'sandbox' ? 'delivered' : 'pending',
      idempotency_key
    }])
    .select()
    .single();

  if (error) throw appError(500, 'DB_ERROR', error.message);

  return {
    dispatch_receipt: dispatchRecord,
    signature_header: signatureHeader,
    replay_protection_timestamp: timestamp
  };
};

/**
 * Helper: Verifies incoming HMAC-SHA256 webhook signatures[cite: 18]
 */
export const verifyWebhookSignature = (rawPayload, signatureHeader, secret) => {
  try {
    const parts = signatureHeader.split(',');
    const timestampPart = parts.find(p => p.startsWith('t='));
    const signaturePart = parts.find(p => p.startsWith('v1='));

    if (!timestampPart || !signaturePart) return false;

    const timestamp = timestampPart.split('=')[1];
    const expectedSignature = signaturePart.split('=')[1];

    // Replay protection: Reject webhooks older than 5 minutes (300 seconds)[cite: 18]
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (Math.abs(currentTimestamp - parseInt(timestamp)) > 300) {
      logger.warn('🚨 REPLAY PROTECTION: Webhook timestamp older than 300 seconds.');
      return false;
    }

    const signedPayload = `${timestamp}.${JSON.stringify(rawPayload)}`;
    const computedSignature = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');

    return crypto.timingSafeEqual(Buffer.from(computedSignature), Buffer.from(expectedSignature));
  } catch (err) {
    return false;
  }
};