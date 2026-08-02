import * as identityService from '../services/identity.service.js';
import { configureSSOSchema, scimUserProvisionSchema, scimUserDeprovisionSchema } from '../validators/identity.validator.js';

export const handleConfigureSSO = async (req, res, next) => {
  try {
    const validatedBody = configureSSOSchema.parse(req.body);
    const result = await identityService.upsertSSOConfiguration(validatedBody);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const handleSCIMProvision = async (req, res, next) => {
  try {
    const validatedBody = scimUserProvisionSchema.parse(req.body);
    const tenantId = req.scimContext.tenantId;
    const result = await identityService.provisionSCIMUser(tenantId, validatedBody);
    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const handleSCIMDeprovision = async (req, res, next) => {
  try {
    const validatedBody = scimUserDeprovisionSchema.parse(req.body);
    const tenantId = req.scimContext.tenantId;
    const result = await identityService.deprovisionSCIMUser(tenantId, validatedBody.external_idp_id);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const handleValidateSession = async (req, res, next) => {
  try {
    const { session_token, tenant_id } = req.query;
    if (!session_token || !tenant_id) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_PARAMS', message: 'session_token and tenant_id query params required' } });
    }
    const user = await identityService.validateActiveSession(session_token, tenant_id);
    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};