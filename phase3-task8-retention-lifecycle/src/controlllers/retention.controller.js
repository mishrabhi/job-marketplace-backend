import * as retentionService from '../services/retention.service.js';
import { updateLifecycleSchema, triggerReengagementSchema } from '../validators/retention.validator.js';

export const handleStateUpdate = async (req, res, next) => {
  try {
    const validatedBody = updateLifecycleSchema.parse(req.body);
    const result = await retentionService.updateEngagementState(validatedBody);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const handleReengagementTrigger = async (req, res, next) => {
  try {
    const validatedBody = triggerReengagementSchema.parse(req.body);
    const dispatchResult = await retentionService.dispatchReengagementNotification(validatedBody);
    return res.status(200).json({ success: true, data: dispatchResult });
  } catch (err) {
    next(err);
  }
};

export const handleGetLifecycleState = async (req, res, next) => {
  try {
    const { user_id, tenant_id } = req.query;
    if (!user_id || !tenant_id) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_PARAMS', message: 'user_id and tenant_id query params required' } });
    }
    const state = await retentionService.getUserLifecycleState(user_id, tenant_id);
    return res.status(200).json({ success: true, data: state });
  } catch (err) {
    next(err);
  }
};