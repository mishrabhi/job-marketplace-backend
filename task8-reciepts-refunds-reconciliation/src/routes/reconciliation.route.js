import Router from 'express';
import ctrl from '../controllers/reconciliation.controller';

const router = Router();

// POST /api/v1/reconciliation/generate?date=YYYY-MM-DD — generate/refresh a report
router.post('/generate', ctrl.generateReport);

// GET /api/v1/reconciliation?date=YYYY-MM-DD — get existing report for a date
router.get('/', ctrl.getReport);

// GET /api/v1/reconciliation/history — list all reports
router.get('/history', ctrl.listReports);

export default router;