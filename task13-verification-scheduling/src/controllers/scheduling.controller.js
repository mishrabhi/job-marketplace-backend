import * as schedulingService from '../services/scheduling.service.js';
import { scheduleInterviewSchema } from '../validators/scheduling.validator.js';

export const executeSlotAllocation = async (req, res, next) => {
  try {
    const validatedBody = scheduleInterviewSchema.parse(req.body);
    const resultDetails = await schedulingService.executeInterviewBooking(validatedBody);
    return res.status(201).json({ success: true, data: resultDetails });
  } catch (err) {
    next(err);
  }
};