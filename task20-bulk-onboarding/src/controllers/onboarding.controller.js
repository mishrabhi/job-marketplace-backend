import * as onboardingService from '../services/onboarding.service.js';
import { bulkOnboardingSchema } from '../validators/onboarding.validator.js';

export const processCohortIngestion = async (req, res, next) => {
  try {
    const validatedBody = bulkOnboardingSchema.parse(req.body);
    const operationResult = await onboardingService.executeBulkStudentIngestion(validatedBody);
    return res.status(201).json({ success: true, data: operationResult });
  } catch (err) {
    next(err);
  }
};