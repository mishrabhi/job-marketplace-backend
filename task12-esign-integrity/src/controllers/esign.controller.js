import * as esignService from '../services/esign.service.js';
import { executeSignatureSchema, verifyIntegritySchema } from '../validators/esign.validator.js';

export const processDigitalSignature = async (req, res, next) => {
  try {
    const validatedBody = executeSignatureSchema.parse(req.body);
    const result = await esignService.signOfferDocument(validatedBody);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const runIndependentAuditVerification = async (req, res, next) => {
  try {
    const validatedQuery = verifyIntegritySchema.parse(req.query);
    const auditReport = await esignService.verifyOfferAuthenticity(
      validatedQuery.offer_id,
      validatedQuery.provided_checksum
    );
    return res.status(200).json({ success: true, data: auditReport });
  } catch (err) {
    next(err);
  }
};