import * as statusService from '../services/status.service.js';
import { updateStatusSchema, getTimelineSchema } from '../validators/status.validator.js';

export const modifyApplicationState = async (req, res, next) => {
  try {
    const validatedBody = updateStatusSchema.parse(req.body);
    const mutationResult = await statusService.advanceApplicationStatus(validatedBody);
    return res.status(200).json({ success: true, data: mutationResult });
  } catch (err) {
    next(err);
  }
};

export const retrieveCandidateTimeline = async (req, res, next) => {
  try {
    const validatedParams = getTimelineSchema.parse(req.query);
    const traceReport = await statusService.fetchApplicationJourneyTimeline(validatedParams.application_id);
    return res.status(200).json({ success: true, data: traceReport });
  } catch (err) {
    next(err);
  }
};