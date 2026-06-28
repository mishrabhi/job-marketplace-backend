import express from ('express');
import router from express.Router();
import revenueController from ('../controllers/revenue.controller');

// Main Analytics & Dashboard Data Endpoints 
router.get('/metrics', revenueController.getDashboardSummary);
// Validation Report Endpoints 
router.post('/reconcile', revenueController.triggerDailyReconciliation);

export default router;