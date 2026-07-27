import * as featureService from '../services/feature.service.js';
import { getFeaturesSchema, updateFeaturesSchema, invalidateCacheSchema } from '../validators/feature.validator.js';

export const handleGetFeatures = async (req, res, next) => {
  try {
    const validatedQueries = getFeaturesSchema.parse(req.query);
    const result = await featureService.getCandidateFeatures(
      validatedQueries.student_id,
      validatedQueries.tenant_id
    );
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const handleUpsertFeatures = async (req, res, next) => {
  try {
    const validatedBody = updateFeaturesSchema.parse(req.body);
    const updated = await featureService.upsertCandidateFeatures(validatedBody);
    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

export const handleInvalidateCache = async (req, res, next) => {
  try {
    const validatedBody = invalidateCacheSchema.parse(req.body);
    const report = await featureService.invalidateFeatureCache(
      validatedBody.student_id,
      validatedBody.tenant_id,
      validatedBody.reason
    );
    return res.status(200).json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};