import * as activationService from '../services/activation.service.js';
import { fastSignupSchema, onboardingProfileSchema } from '../validators/activation.validator.js';

export const handleFastSignup = async (req, res, next) => {
  try {
    const validatedBody = fastSignupSchema.parse(req.body);
    const signupResult = await activationService.executeFastSignup(validatedBody);
    return res.status(201).json({ success: true, data: signupResult });
  } catch (err) {
    next(err);
  }
};

export const handleProfileCompletion = async (req, res, next) => {
  try {
    const validatedBody = onboardingProfileSchema.parse(req.body);
    const profileResult = await activationService.completeOnboardingProfile(validatedBody);
    return res.status(200).json({ success: true, data: profileResult });
  } catch (err) {
    next(err);
  }
};

export const getActivationFunnelTelemetry = async (req, res, next) => {
  try {
    const tenantId = req.query.tenant_id;
    if (!tenantId) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_PARAM', message: 'tenant_id query param is required' } });
    }
    const metrics = await activationService.calculateActivationMetrics(tenantId);
    return res.status(200).json({ success: true, data: metrics });
  } catch (err) {
    next(err);
  }
};