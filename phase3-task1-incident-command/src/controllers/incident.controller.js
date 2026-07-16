import * as incidentService from '../services/incident.service.js';
import { triggerIncidentSchema, reportDefectSchema, createBacklogTaskSchema, finalizePostmortemSchema } from '../validators/incident.validator.js';

export const triggerIncident = async (req, res, next) => {
  try {
    const validated = triggerIncidentSchema.parse(req.body);
    const result = await incidentService.instantiateIncidentReport(validated);
    return res.status(201).json({ success: true, data: result });
  } catch (err) { next(err); }
};

export const ingestDefect = async (req, res, next) => {
  try {
    const validated = reportDefectSchema.parse(req.body);
    const result = await incidentService.registerRuntimeDefect(validated);
    return res.status(200).json({ success: true, data: result });
  } catch (err) { next(err); }
};

export const commitBacklogTask = async (req, res, next) => {
  try {
    const validated = createBacklogTaskSchema.parse(req.body);
    const result = await incidentService.createBacklogItem(validated);
    return res.status(201).json({ success: true, data: result });
  } catch (err) { next(err); }
};

export const resolvePostmortem = async (req, res, next) => {
  try {
    const validated = finalizePostmortemSchema.parse(req.body);
    const result = await incidentService.compileBlamelessPostmortem(validated);
    return res.status(200).json({ success: true, data: result });
  } catch (err) { next(err); }
};