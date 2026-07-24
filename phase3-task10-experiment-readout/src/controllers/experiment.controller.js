import * as expService from '../services/experiment.service.js';
import { recordOutcomeSchema, getReadoutSchema, cleanupZombieFlagsSchema } from '../validators/experiment.validator.js';

export const handleRecordOutcome = async (req, res, next) => {
  try {
    const validatedBody = recordOutcomeSchema.parse(req.body);
    const result = await expService.registerExperimentOutcome(validatedBody);
    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const handleGetReadout = async (req, res, next) => {
  try {
    const validatedQueries = getReadoutSchema.parse(req.query);
    const readout = await expService.generateExperimentReadout(
      validatedQueries.flag_key,
      validatedQueries.tenant_id
    );
    return res.status(200).json({ success: true, data: readout });
  } catch (err) {
    next(err);
  }
};

export const handleCleanupZombieFlags = async (req, res, next) => {
  try {
    const validatedBody = cleanupZombieFlagsSchema.parse(req.body);
    const report = await expService.purgeZombieFlags(validatedBody.performed_by);
    return res.status(200).json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};