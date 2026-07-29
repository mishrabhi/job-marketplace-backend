import * as govService from '../services/governance.service.js';
import { invokeGovernedModelSchema, setPolicySchema } from '../validators/governance.validator.js';

export const handleInvokeModel = async (req, res, next) => {
  try {
    const validatedBody = invokeGovernedModelSchema.parse(req.body);
    const result = await govService.invokeGovernedModelPipeline(validatedBody);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const handleSetPolicy = async (req, res, next) => {
  try {
    const validatedBody = setPolicySchema.parse(req.body);
    const updatedPolicy = await govService.updateGovernancePolicy(validatedBody);
    return res.status(200).json({ success: true, data: updatedPolicy });
  } catch (err) {
    next(err);
  }
};