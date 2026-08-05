import * as securityService from '../services/security.service.js';
import { logStrideThreatSchema, testIdorDefenseSchema, auditSupplyChainSchema } from '../validators/security.validator.js';

export const handleLogStrideThreat = async (req, res, next) => {
  try {
    const validatedBody = logStrideThreatSchema.parse(req.body);
    const result = await securityService.recordStrideThreat(validatedBody);
    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const handleTestIdorDefense = async (req, res, next) => {
  try {
    const validatedBody = testIdorDefenseSchema.parse(req.body);
    const testReport = await securityService.verifyIdorDefense(
      validatedBody.requesting_tenant_id,
      validatedBody.target_resource_id,
      validatedBody.resource_owner_tenant_id
    );
    return res.status(200).json({ success: true, data: testReport });
  } catch (err) {
    next(err);
  }
};

export const handleAuditSupplyChain = async (req, res, next) => {
  try {
    const validatedBody = auditSupplyChainSchema.parse(req.body);
    const auditReport = await securityService.auditSupplyChainDependencies(
      validatedBody.tenant_id,
      validatedBody.package_manifest
    );
    return res.status(200).json({ success: true, data: auditReport });
  } catch (err) {
    next(err);
  }
};