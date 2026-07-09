import * as consentService from '../services/consent.service.js';
import { recordConsentSchema, dataPurgeSchema } from '../validators/consent.validator.js';

export const updateConsentRegistry = async (req, res, next) => {
  try {
    const validatedBody = recordConsentSchema.parse(req.body);
    const registryResult = await consentService.logUserConsentState(validatedBody);
    return res.status(200).json({ success: true, data: registryResult });
  } catch (err) {
    next(err);
  }
};

export const executeSubjectPurgeRequest = async (req, res, next) => {
  try {
    const validatedParams = dataPurgeSchema.parse(req.body);
    const purgeReport = await consentService.executeDataErasurePurge(validatedParams.user_id);
    return res.status(200).json({ success: true, data: purgeReport });
  } catch (err) {
    next(err);
  }
};