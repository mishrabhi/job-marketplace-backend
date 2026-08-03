import * as pilotService from '../services/pilot.service.js';
import { provisionPilotTenantSchema, runPilotJourneySchema, logRemediationItemSchema } from '../validators/pilot.validator.js';

export const handleProvisionPilot = async (req, res, next) => {
  try {
    const validatedBody = provisionPilotTenantSchema.parse(req.body);
    const result = await pilotService.provisionEnterprisePilot(validatedBody);
    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const handleExecuteJourneyStep = async (req, res, next) => {
  try {
    const validatedBody = runPilotJourneySchema.parse(req.body);
    const stepResult = await pilotService.executeEnterpriseJourneyStep(validatedBody);
    return res.status(200).json({ success: true, data: stepResult });
  } catch (err) {
    next(err);
  }
};

export const handleLogRemediationItem = async (req, res, next) => {
  try {
    const validatedBody = logRemediationItemSchema.parse(req.body);
    const result = await pilotService.recordRemediationGap(validatedBody);
    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const handleGetRemediationSummary = async (req, res, next) => {
  try {
    const { tenant_id } = req.query;
    if (!tenant_id) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_PARAM', message: 'tenant_id query param is required' } });
    }
    const summary = await pilotService.getPilotRemediationSummary(tenant_id);
    return res.status(200).json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
};