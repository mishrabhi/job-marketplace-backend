import express from 'express';
const router = express.Router();
import * as incidentController from '../controllers/incident.controller.js';

router.post('/incidents/trigger', incidentController.triggerIncident);
router.post('/incidents/postmortem', incidentController.resolvePostmortem);
router.post('/defects/ingest', incidentController.ingestDefect);
router.post('/backlog/commit', incidentController.commitBacklogTask);

export default router;