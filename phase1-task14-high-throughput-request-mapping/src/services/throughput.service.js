import { throughputRepository } from '../repositories/throughput.repository.js';
import { getSystemTelemetry } from '../middlewares/loadShedding.middleware.js';

export const getHighThroughputFeed = async (limit) => {
  const feed = await throughputRepository.getBatchFeedOptimized(limit);
  return {
    count: feed.length,
    feed,
    telemetry: getSystemTelemetry()
  };
};

export const getLiveHealthTelemetry = () => {
  return getSystemTelemetry();
};