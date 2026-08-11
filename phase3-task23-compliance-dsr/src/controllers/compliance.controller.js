import * as complianceService from '../services/compliance.service.js';
import { submitDsrRequestSchema, processDsrSchema } from '../validators/compliance.validator.js';

export const handleSubmitDSR = async (req, res, next) => {
  try {
    const validatedBody = submitDsrRequestSchema.parse(req.body);
    const result = await complianceService.submitDSRRequest(validatedBody);
    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const handleExecutePurge = async (req, res, next) => {
  try {
    const validatedBody = processDsrSchema.parse(req.body);
    const purgeReport = await complianceService.executeRightToBeForgotten(
      validatedBody.dsr_request_id,
      validatedBody.tenant_id,
      validatedBody.actor_id
    );
    return res.status(200).json({ success: true, data: purgeReport });
  } catch (err) {
    next(err);
  }
};

export const handleExportData = async (req, res, next) => {
  try {
    const { dsr_request_id, tenant_id } = req.query;
    if (!dsr_request_id || !tenant_id) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_PARAMS', message: 'dsr_request_id and tenant_id are required' } });
    }
    const exportData = await complianceService.exportDataSubjectData(dsr_request_id, tenant_id);
    return res.status(200).json({ success: true, data: exportData });
  } catch (err) {
    next(err);
  }
};