import * as certService from '../services/certification.service.js';
import { generateCertificationPackSchema, executeCutoverStageSchema, recordBacklogItemSchema } from '../validators/certification.validator.js';

export const handleGenerateCertPack = async (req, res, next) => {
  try {
    const validatedBody = generateCertificationPackSchema.parse(req.body);
    const result = await certService.generateCertificationPack(validatedBody);
    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const handleExecuteCutover = async (req, res, next) => {
  try {
    const validatedBody = executeCutoverStageSchema.parse(req.body);
    const cutoverResult = await certService.executeStagedCutoverStage(validatedBody);
    return res.status(200).json({ success: true, data: cutoverResult });
  } catch (err) {
    next(err);
  }
};

export const handleRecordBacklog = async (req, res, next) => {
  try {
    const validatedBody = recordBacklogItemSchema.parse(req.body);
    const result = await certService.recordPostLaunchBacklogItem(validatedBody);
    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const handleGetCertStatus = async (req, res, next) => {
  try {
    const { tenant_id } = req.query;
    if (!tenant_id) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_PARAM', message: 'tenant_id query parameter is required' } });
    }
    const status = await certService.getFullCertificationStatus(tenant_id);
    return res.status(200).json({ success: true, data: status });
  } catch (err) {
    next(err);
  }
};