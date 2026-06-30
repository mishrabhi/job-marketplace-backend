import crypto from 'crypto';
import { supabase } from '../config/db.js';
import { appError } from '../middlewares/errorHandler.js';
import { env } from '../config/env.js';

/**
 * Handles open, public document integrity verification matching [cite: 370, 373]
 */
export const verifyOfferPublicly = async (offerId, providedChecksum) => {
  const [offerResult, sigResult] = await Promise.all([
    supabase.from('hr_offers').select('*').eq('id', offerId).maybeSingle(),
    supabase.from('hr_offer_signatures').select('*').eq('offer_id', offerId).maybeSingle()
  ]);

  if (offerResult.error || sigResult.error) {
    throw appError(500, 'DB_ERROR', 'Failed to retrieve record parameters for public verification lookup');
  }

  const offer = offerResult.data;
  const signature = sigResult.data;

  if (!offer || !signature) {
    throw appError(404, 'RECORD_NOT_FOUND', 'The target agreement record or signature metadata does not exist');
  }

  // Recalculate signature fingerprints dynamically to verify no silent database tampering has happened [cite: 395, 474]
  const targetPayloadString = `${offer.id}:${offer.application_id}:${offer.ctc_paise}:${offer.role_title}`;
  const computedPayloadHash = crypto.createHash('sha256').update(targetPayloadString).digest('hex');

  const targetSealingString = `${computedPayloadHash}:${signature.candidate_ip}:${signature.signed_by_student_id}:${env.CRYPTOGRAPHIC_INTEGRITY_SALT}`;
  const computedValidationChecksum = crypto.createHash('sha256').update(targetSealingString).digest('hex');

  // Verify alignment parameters cleanly [cite: 461, 474]
  const isTampered = computedValidationChecksum !== signature.tamper_checksum || signature.tamper_checksum !== providedChecksum;

  return {
    verified: !isTampered,
    metadata: !isTampered ? {
      company_name: offer.company_name,
      role_title: offer.role_title,
      signed_at_timestamp: signature.signed_at
    } : null,
    verdict: !isTampered ? 'DOCUMENT_AUTHENTIC' : 'INTEGRITY_COMPROMISED_TAMPER_DETECTED'
  };
};