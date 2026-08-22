import { applicationRepository } from '../repositories/application.repository.js';
import * as cacheInvalidator from './cacheInvalidation.service.js';
import { appError } from '../middlewares/errorHandler.js';

export const getApplicationsByJob = async (jobId) => {
  const cacheKey = `placemux:job:${jobId}:applications`;

  // 1. Attempt Cache Read[cite: 18]
  const cached = await cacheInvalidator.getCached(cacheKey);
  if (cached) {
    return { data: cached, source: 'REDIS_CACHE_HIT' };
  }

  // 2. Fetch from DB[cite: 18]
  const data = await applicationRepository.getJobApplicationsFromDB(jobId);

  // 3. Cache with Tagging[cite: 18]
  await cacheInvalidator.setCachedWithTags(cacheKey, data, [`job:${jobId}:apps`], 300);

  return { data, source: 'DATABASE_FETCH' };
};

export const getApplicationById = async (appId) => {
  const cacheKey = `placemux:application:${appId}`;

  const cached = await cacheInvalidator.getCached(cacheKey);
  if (cached) {
    return { data: cached, source: 'REDIS_CACHE_HIT' };
  }

  const data = await applicationRepository.getApplicationByIdFromDB(appId);
  if (!data) {
    throw appError(404, 'APPLICATION_NOT_FOUND', `Application with ID '${appId}' does not exist.`);
  }

  await cacheInvalidator.setCachedWithTags(cacheKey, data, [`app:${appId}`, `job:${data.job_id}:apps`, `student:${data.student_id}:apps`], 300);

  return { data, source: 'DATABASE_FETCH' };
};

export const updateStatusAndInvalidate = async (appId, newStatus) => {
  const existing = await applicationRepository.getApplicationByIdFromDB(appId);
  if (!existing) {
    throw appError(404, 'APPLICATION_NOT_FOUND', `Application '${appId}' not found.`);
  }

  // 1. Perform DB Write[cite: 18]
  const updated = await applicationRepository.updateApplicationStatusInDB(appId, newStatus);

  // 2. Write-Path Hook: Evict only exact affected keys via tags[cite: 18]
  await cacheInvalidator.invalidateTags([
    `app:${appId}`,
    `job:${existing.job_id}:apps`,
    `student:${existing.student_id}:apps`,
    `drive:${existing.drive_id}:stats`
  ]);

  return updated;
};

export const createApplicationAndInvalidate = async (payload) => {
  const created = await applicationRepository.createApplicationInDB(payload);

  // Write-Path Hook: Evict parent job list[cite: 18]
  await cacheInvalidator.invalidateTags([
    `job:${payload.job_id}:apps`,
    `student:${payload.student_id}:apps`
  ]);

  return created;
};