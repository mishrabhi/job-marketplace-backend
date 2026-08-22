import * as throughputService from '../services/throughput.service.js';

export const handleGetBatchFeed = async (req, res, next) => {
  try {
    const limit = Math.min(100, parseInt(req.query.limit, 10) || 50);
    const result = await throughputService.getHighThroughputFeed(limit);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const handleGetTelemetry = (req, res) => {
  const telemetry = throughputService.getLiveHealthTelemetry();
  return res.status(200).json({ success: true, data: telemetry });
};