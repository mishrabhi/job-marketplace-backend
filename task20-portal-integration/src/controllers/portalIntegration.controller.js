import * as portalIntegrationService from '../services/portalIntegration.service.js';
import { executePortalDryRunSchema } from '../validators/portalIntegration.validator.js';

export const triggerPortalEcosystemDryRun = async (req, res, next) => {
  try {
    const validatedBody = executePortalDryRunSchema.parse(req.body);
    const dryRunReport = await portalIntegrationService.runSystemPortalDryRun(validatedBody);
    return res.status(200).json({ success: true, data: dryRunReport });
  } catch (err) {
    next(err);
  }
};