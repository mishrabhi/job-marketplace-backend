import * as finopsService from '../services/finops.service.js';
import { logWorkloadCostSchema, computeUnitEconomicsSchema } from '../validators/finops.validator.js';

export const handleRecordWorkloadCost = async (req, res, next) => {
  try {
    const validatedBody = logWorkloadCostSchema.parse(req.body);
    const result = await finopsService.recordWorkloadCost(validatedBody);
    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const handleComputeUnitEconomics = async (req, res, next) => {
  try {
    const validatedBody = computeUnitEconomicsSchema.parse(req.body);
    const summary = await finopsService.computeUnitEconomicsSummary(
      validatedBody.tenant_id,
      validatedBody.batch_identifier
    );
    return res.status(200).json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
};