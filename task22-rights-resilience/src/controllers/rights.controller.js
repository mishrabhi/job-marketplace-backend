import * as rightsService from '../services/rights.service.js';
import { dataExportSchema, requestErasureSchema } from '../validators/rights.validator.js';

export const processDataSubjectExport = async (req, res, next) => {
  try {
    const validatedBody = dataExportSchema.parse(req.body);
    const archiveResult = await rightsService.compilePortabilityExport(
      validatedBody.user_id,
      validatedBody.idempotency_key
    );
    return res.status(200).json({ success: true, data: archiveResult });
  } catch (err) {
    next(err);
  }
};

export const processDataSubjectErasure = async (req, res, next) => {
  try {
    const validatedBody = requestErasureSchema.parse(req.body);
    const purgeResult = await rightsService.executeDataErasureCascade(
      validatedBody.user_id,
      validatedBody.idempotency_key
    );
    return res.status(200).json({ success: true, data: purgeResult });
  } catch (err) {
    next(err);
  }
};