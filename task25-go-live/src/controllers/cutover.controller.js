import * as cutoverService from '../services/cutover.service.js';
import { triggerCutoverSchema } from '../validators/cutover.validator.js';

export const processProductionCutover = async (req, res, next) => {
  try {
    const validatedBody = triggerCutoverSchema.parse(req.body);
    const cutoverReceipt = await cutoverService.executeProductionCutover(validatedBody);
    return res.status(200).json({ success: true, data: cutoverReceipt });
  } catch (err) {
    next(err);
  }
};