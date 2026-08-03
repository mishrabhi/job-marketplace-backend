import * as configService from '../services/config.service.js';
import { updateTenantConfigSchema, rollbackConfigSchema } from '../validators/config.validator.js';

export const handleUpdateConfig = async (req, res, next) => {
  try {
    const validatedBody = updateTenantConfigSchema.parse(req.body);
    const result = await configService.updateTenantConfiguration(validatedBody);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const handleRollbackConfig = async (req, res, next) => {
  try {
    const validatedBody = rollbackConfigSchema.parse(req.body);
    const rollbackResult = await configService.rollbackTenantConfiguration(validatedBody);
    return res.status(200).json({ success: true, data: rollbackResult });
  } catch (err) {
    next(err);
  }
};

export const handleGetConfig = async (req, res, next) => {
  try {
    const { tenant_id } = req.query;
    if (!tenant_id) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_PARAM', message: 'tenant_id query parameter is required' } });
    }
    const config = await configService.getTenantConfiguration(tenant_id);
    return res.status(200).json({ success: true, data: config });
  } catch (err) {
    next(err);
  }
};