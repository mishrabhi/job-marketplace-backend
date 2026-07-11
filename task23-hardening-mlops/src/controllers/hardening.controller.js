import * as hardeningService from '../services/hardening.service.js';
import { logInferenceSchema, saveLoadMetricsSchema } from '../validators/hardening.validator.js';

export const recordModelTelemetry = async (req, res, next) => {
  try {
    const validatedBody = logInferenceSchema.parse(req.body);
    const loggingOutput = await hardeningService.registerInferenceTrackingData(validatedBody);
    return res.status(201).json({ success: true, data: loggingOutput });
  } catch (err) {
    next(err);
  }
};

export const archivePerformanceMetrics = async (req, res, next) => {
  try {
    const validatedBody = saveLoadMetricsSchema.parse(req.body);
    const outputReceipt = await hardeningService.persistSystemLoadReport(validatedBody);
    return res.status(201).json({ success: true, data: outputReceipt });
  } catch (err) {
    next(err);
  }
};