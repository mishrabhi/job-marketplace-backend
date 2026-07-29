import * as auditService from '../services/audit.service.js';
import { recordDecisionSchema, submitAppealSchema, adjudicateAppealSchema } from '../validators/audit.validator.js';

export const handleLogDecision = async (req, res, next) => {
  try {
    const validatedBody = recordDecisionSchema.parse(req.body);
    const result = await auditService.logAutomatedDecision(validatedBody);
    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const handleGetExplanation = async (req, res, next) => {
  try {
    const { decision_token, tenant_id } = req.query;
    if (!decision_token || !tenant_id) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_PARAMS', message: 'decision_token and tenant_id query parameters are required' } });
    }
    const explanation = await auditService.getDecisionExplanation(decision_token, tenant_id);
    return res.status(200).json({ success: true, data: explanation });
  } catch (err) {
    next(err);
  }
};

export const handleSubmitAppeal = async (req, res, next) => {
  try {
    const validatedBody = submitAppealSchema.parse(req.body);
    const result = await auditService.submitCandidateAppeal(validatedBody);
    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const handleAdjudicateAppeal = async (req, res, next) => {
  try {
    const validatedBody = adjudicateAppealSchema.parse(req.body);
    const result = await auditService.adjudicateAppeal(validatedBody);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};