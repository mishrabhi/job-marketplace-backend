import { driveRepository } from '../repositories/drive.repository.js';
import * as cacheService from '../services/cache.service.js';
import { env } from '../config/env.js';

export const handleGetHotDrives = async (req, res, next) => {
  try {
    const start = process.hrtime();
    const cacheKey = 'placemux:drives:hot_feed';
    const ttl = env.DEFAULT_CACHE_TTL_SEC; // 120s[cite: 17]

    const { data, source } = await cacheService.getOrSetWithStampedeProtection(
      cacheKey,
      ttl,
      () => driveRepository.findHotDrivesFromDB()
    );

    const diff = process.hrtime(start);
    const responseTimeMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);

    return res.status(200).json({
      success: true,
      source,
      response_time: `${responseTimeMs}ms`,
      data
    });
  } catch (err) {
    next(err);
  }
};

export const handleGetDriveById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const start = process.hrtime();
    const cacheKey = `placemux:drive:${id}`;
    const ttl = 300; // 5 mins[cite: 17]

    const { data, source } = await cacheService.getOrSetWithStampedeProtection(
      cacheKey,
      ttl,
      () => driveRepository.findDriveByIdFromDB(id)
    );

    const diff = process.hrtime(start);
    const responseTimeMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);

    if (!data) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Drive not found' } });
    }

    return res.status(200).json({
      success: true,
      source,
      response_time: `${responseTimeMs}ms`,
      data
    });
  } catch (err) {
    next(err);
  }
};

export const handleUpdateDriveStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await driveRepository.updateDriveStatusInDB(id, status);

    // Invalidate individual key and collection cache[cite: 17]
    await cacheService.invalidateCache(`placemux:drive:${id}`);
    await cacheService.invalidateCache('placemux:drives:hot_feed');

    return res.status(200).json({
      success: true,
      message: 'Drive updated and related Redis cache keys invalidated successfully',
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

export const handleGetCacheMetrics = (req, res) => {
  return res.status(200).json({
    success: true,
    data: cacheService.metrics.getSummary()
  });
};