import * as profService from '../services/profiling.service.js';
import { logProfileSchema, commitBenchmarkSchema } from '../validators/profiling.validator.js';

export const addProfilingMetric = async (req, res, next) => {
  try {
    const validatedBody = logProfileSchema.parse(req.body);
    const resultLog = await profService.insertPerformanceProfile(validatedBody);
    return res.status(201).json({ success: true, data: resultLog });
  } catch (err) {
    next(err);
  }
};

export const saveLatencyBenchmark = async (req, res, next) => {
  try {
    const validatedBody = commitBenchmarkSchema.parse(req.body);
    const benchmarkReceipt = await profService.registerOptimizedBenchmark(validatedBody);
    return res.status(200).json({ success: true, data: benchmarkReceipt });
  } catch (err) {
    next(err);
  }
};