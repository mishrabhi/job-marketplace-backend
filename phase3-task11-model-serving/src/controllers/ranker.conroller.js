import * as rankerService from '../services/ranker.service.js';
import { rankCandidatesSchema, configureDeploymentSchema } from '../validators/ranker.validator.js';

export const handleServeRankings = async (req, res, next) => {
  try {
    const validatedBody = rankCandidatesSchema.parse(req.body);
    const result = await rankerService.serveRankings(validatedBody);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const handleConfigureDeployment = async (req, res, next) => {
  try {
    const validatedBody = configureDeploymentSchema.parse(req.body);
    const configResult = await rankerService.updateDeploymentConfig(validatedBody);
    return res.status(200).json({ success: true, data: configResult });
  } catch (err) {
    next(err);
  }
};

export const handleTriggerRollback = async (req, res, next) => {
  try {
    const { model_version } = req.body;
    if (!model_version) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_PARAM', message: 'model_version is required' } });
    }
    const rollbackResult = await rankerService.rollbackCanaryModel(model_version);
    return res.status(200).json({ success: true, data: rollbackResult });
  } catch (err) {
    next(err);
  }
};