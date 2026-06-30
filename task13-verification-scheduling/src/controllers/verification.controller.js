import * as verificationService from '../services/verification.service.js';
import { publicVerifyQuerySchema } from '../validators/verification.validator.js';

export const runPublicLookup = async (req, res, next) => {
  try {
    const validatedParams = publicVerifyQuerySchema.parse(req.query);
    const auditReport = await verificationService.verifyOfferPublicly(
      validatedParams.offer_id,
      validatedParams.checksum
    );
    return res.status(200).json({ success: true, data: auditReport });
  } catch (err) {
    next(err);
  }
};