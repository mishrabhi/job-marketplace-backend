import * as scaleService from '../services/scale.service.js';
import { logLoadTestSchema, logBreakingPointSchema } from '../validators/scale.validator.js';

export const saveLoadTestRun = async (req, res, next) => {
  try {
    const validatedBody = logLoadTestSchema.parse(req.body);
    const databaseLog = await scaleService.registerLoadExecution(validatedBody);
    return res.status(201).json({ success: true, data: databaseLog });
  } catch (err) {
    next(err);
  }
};

export const saveBreakingPointMetric = async (req, res, next) => {
  try {
    const validatedBody = logBreakingPointSchema.parse(req.body);
    const breakingPointReceipt = await scaleService.recordSystemBreakingThreshold(validatedBody);
    return res.status(201).json({ success: true, data: breakingPointReceipt });
  } catch (err) {
    next(err);
  }
};

export const triggerSimulatedGatewayTransaction = async (req, res, next) => {
  try {
    const forceOutage = req.query.force_outage === 'true';
    const transactionSummary = await scaleService.simulateOutboundCallWithTimeout(forceOutage);
    return res.status(200).json({ success: true, data: transactionSummary });
  } catch (err) {
    await scaleService.recordDependencyFailure();
    next(err);
  }
};