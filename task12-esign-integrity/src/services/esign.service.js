export const verifyOfferAuthenticity = async (offerId, providedChecksum) => {
  logger.info(`Independent Audit Request initiated for verifying signature block: ${offerId}`);

  const [offerResult, sigResult] = await Promise.all([
    supabase.from('hr_offers').select('*').eq('id', offerId).maybeSingle(),
    supabase.from('hr_offer_signatures').select('*').eq('offer_id', offerId).maybeSingle()
  ]);

  if (offerResult.error || sigResult.error) {
    throw appError(500, 'DB_ERROR', 'Audit data aggregation exception failure');
  }

  const offer = offerResult.data;
  const signature = sigResult.data;

  if (!offer || !signature) {
    throw appError(404, 'RECORD_NOT_FOUND', 'Offer or corresponding signature record missing');
  }

  // Recalculate signature fingerprints dynamically using active database states
  const recompiledPayloadString = `${offer.id}:${offer.application_id}:${offer.ctc_paise}:${offer.role_title}`;
  const recompiledPayloadHash = crypto.createHash('sha256').update(recompiledPayloadString).digest('hex');

  const recompiledSealingString = `${recompiledPayloadHash}:${signature.candidate_ip}:${signature.signed_by_student_id}:${env.CRYPTOGRAPHIC_INTEGRITY_SALT}`;
  const computedValidationChecksum = crypto.createHash('sha256').update(recompiledSealingString).digest('hex');

  // Assert absolute correlation matching criteria 
  const dataHasBeenModified = computedValidationChecksum !== signature.tamper_checksum || signature.tamper_checksum !== providedChecksum;

  return {
    offer_id: offerId,
    authentic: !dataHasBeenModified,
    audit_verdict: !dataHasBeenModified ? 'VERIFIED_AUTHENTIC' : 'DOCUMENT_TAMPERED_ANOMALY_DETECTION', // [cite: 340, 350]
    computed_checksum: computedValidationChecksum,
    stored_checksum: signature.tamper_checksum
  };
};