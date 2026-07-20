import * as reliabilityService from '../services/reliability.service.js';
import { executeConcurrencyTestSchema, commitSignoffSchema } from '../validators/reliability.validator.js';

export const runConcurrencyValidation = async (req, res, next) => {
  try {
    const validatedBody = executeConcurrencyTestSchema.parse(req.body);
    const testReport = await reliabilityService.runConcurrencyAssertionTest(validatedBody);
    return res.status(200).json({ success: true, data: testReport });
  } catch (err) {
    next(err);
  }
};

export const executeScaleSignoff = async (req, res, next) => {
  try {
    const validatedBody = commitSignoffSchema.parse(req.body);
    const signoffReceipt = await reliabilityService.registerScaleSignoff(validatedBody);
    return res.status(201).json({ success: true, data: signoffReceipt });
  } catch (err) {
    next(err);
  }
};