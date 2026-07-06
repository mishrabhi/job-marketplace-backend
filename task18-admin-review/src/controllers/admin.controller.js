import * as adminService from '../services/admin.service.js';
import { createQuestionSchema, resolveProctorReviewSchema } from '../validators/admin.validator.js';

export const processNewItemBankAddition = async (req, res, next) => {
  try {
    const validatedPayload = createQuestionSchema.parse(req.body);
    const databaseItemResult = await adminService.insertAssessmentItem(validatedPayload);
    return res.status(201).json({ success: true, data: databaseItemResult });
  } catch (err) {
    next(err);
  }
};

export const executeProctorAdjudication = async (req, res, next) => {
  try {
    const validatedBody = resolveProctorReviewSchema.parse(req.body);
    const adjudicationRecord = await adminService.adjudicateProctorSession(validatedBody);
    return res.status(200).json({ success: true, data: adjudicationRecord });
  } catch (err) {
    next(err);
  }
};