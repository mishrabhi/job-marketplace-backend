import * as trustService from '../services/trust.service.js';
import { dryRunExecutionSchema } from '../validators/trust.validator.js';

export const triggerStabilizationDryRun = async (req, res, next) => {
  try {
    const validatedBody = dryRunExecutionSchema.parse(req.body);
    const dryRunReport = await trustService.executeEndToEndDryRun(validatedBody);
    return res.status(200).json({ success: true, data: dryRunReport });
  } catch (err) {
    next(err);
  }
};