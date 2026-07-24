import * as flagService from '../services/flag.service.js';
import { evaluateFlagSchema, toggleKillSwitchSchema, createFlagSchema } from '../validators/flag.validator.js';

export const handleEvaluateFlag = async (req, res, next) => {
  try {
    const validatedBody = evaluateFlagSchema.parse(req.body);
    const result = await flagService.evaluateFeatureFlag(
      validatedBody.flag_key,
      validatedBody.user_id,
      validatedBody.tenant_id
    );
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const handleKillSwitch = async (req, res, next) => {
  try {
    const validatedBody = toggleKillSwitchSchema.parse(req.body);
    const updatedFlag = await flagService.updateKillSwitchState(
      validatedBody.flag_key,
      validatedBody.is_active
    );
    return res.status(200).json({ success: true, data: updatedFlag });
  } catch (err) {
    next(err);
  }
};

export const handleCreateFlag = async (req, res, next) => {
  try {
    const validatedBody = createFlagSchema.parse(req.body);
    const newFlag = await flagService.registerFeatureFlag(validatedBody);
    return res.status(201).json({ success: true, data: newFlag });
  } catch (err) {
    next(err);
  }
};