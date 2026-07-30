import * as rbacService from '../services/rbac.service.js';
import { createDossierSchema, assignRoleSchema } from '../validators/rbac.validator.js';

export const handleCreateDossier = async (req, res, next) => {
  try {
    const validatedBody = createDossierSchema.parse(req.body);
    const tenantId = req.userContext.tenantId;
    const dossier = await rbacService.createCandidateDossier(
      tenantId,
      validatedBody.candidate_id,
      validatedBody.confidential_notes
    );
    return res.status(201).json({ success: true, data: dossier });
  } catch (err) {
    next(err);
  }
};

export const handleGetDossiers = async (req, res, next) => {
  try {
    const tenantId = req.userContext.tenantId;
    const dossiers = await rbacService.getTenantDossiers(tenantId);
    return res.status(200).json({ success: true, data: dossiers });
  } catch (err) {
    next(err);
  }
};

export const handleSimulateAttack = async (req, res, next) => {
  try {
    const requestingTenantId = req.userContext.tenantId;
    const targetTenantId = req.query.target_tenant_id;
    
    if (!targetTenantId) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_PARAM', message: 'target_tenant_id query param required' } });
    }

    const testReport = await rbacService.simulateCrossTenantAttack(requestingTenantId, targetTenantId);
    return res.status(200).json({ success: true, data: testReport });
  } catch (err) {
    next(err);
  }
};

export const handleAssignRole = async (req, res, next) => {
  try {
    const validatedBody = assignRoleSchema.parse(req.body);
    const assignment = await rbacService.assignUserRole(
      validatedBody.user_id,
      validatedBody.tenant_id,
      validatedBody.role_name
    );
    return res.status(200).json({ success: true, data: assignment });
  } catch (err) {
    next(err);
  }
};