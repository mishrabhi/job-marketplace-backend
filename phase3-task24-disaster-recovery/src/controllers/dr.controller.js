import * as drService from '../services/dr.service.js';
import { createSnapshotSchema, executeRestoreSchema, logChaosSchema } from '../validators/dr.validator.js';

export const handleCreateSnapshot = async (req, res, next) => {
  try {
    const validatedBody = createSnapshotSchema.parse(req.body);
    const result = await drService.registerBackupSnapshot(validatedBody);
    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const handleExecuteRestore = async (req, res, next) => {
  try {
    const validatedBody = executeRestoreSchema.parse(req.body);
    const restoreResult = await drService.executeRestoreDrillPipeline(validatedBody);
    return res.status(200).json({ success: true, data: restoreResult });
  } catch (err) {
    next(err);
  }
};

export const handleLogChaos = async (req, res, next) => {
  try {
    const validatedBody = logChaosSchema.parse(req.body);
    const chaosResult = await drService.logChaosSimulationScenario(validatedBody);
    return res.status(201).json({ success: true, data: chaosResult });
  } catch (err) {
    next(err);
  }
};

export const handleGetDRSummary = async (req, res, next) => {
  try {
    const { tenant_id } = req.query;
    if (!tenant_id) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_PARAM', message: 'tenant_id query parameter is required' } });
    }
    const summary = await drService.getDRRunbookSummary(tenant_id);
    return res.status(200).json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
};