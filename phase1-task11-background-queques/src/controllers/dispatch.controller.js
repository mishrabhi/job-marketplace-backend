import * as dispatchService from '../services/dispatch.service.js';
import { enqueueEmailSchema } from '../validators/job.validator.js';

export const handleEnqueueEmail = async (req, res, next) => {
  try {
    const validatedBody = enqueueEmailSchema.parse(req.body);
    const receipt = await dispatchService.enqueueEmailDispatch(validatedBody);
    return res.status(202).json({ success: true, data: receipt }); // 202 Accepted[cite: 16]
  } catch (err) {
    next(err);
  }
};

export const handleGetMetrics = async (req, res, next) => {
  try {
    const metrics = await dispatchService.getQueueMetrics();
    return res.status(200).json({ success: true, data: metrics });
  } catch (err) {
    next(err);
  }
};