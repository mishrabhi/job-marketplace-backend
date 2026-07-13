import * as launchService from '../services/launch.service.js';
import { resolveBlockerSchema, executeRetentionSchema } from '../validators/launch.validator.js';

export const clearRehearsalBlocker = async (req, res, next) => {
  try {
    const validatedBody = resolveBlockerSchema.parse(req.body);
    const resultReceipt = await launchService.adjudicateLaunchBlocker(
      validatedBody.blocker_id,
      validatedBody.resolved_notes
    );
    return res.status(200).json({ success: true, data: resultReceipt });
  } catch (err) {
    next(err);
  }
};

export const triggerRetentionPolicy = async (req, res, next) => {
  try {
    const validatedBody = executeRetentionSchema.parse(req.body);
    const executionReport = await launchService.applyDataRetentionScrub(
      validatedBody.retention_policy,
      validatedBody.operator_id
    );
    return res.status(200).json({ success: true, data: executionReport });
  } catch (err) {
    next(err);
  }
};