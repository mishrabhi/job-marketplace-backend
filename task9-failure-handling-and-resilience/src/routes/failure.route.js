import express from ('express');
import router from express.Router();
import failureController from ('../controllers/failure.controller');

router.post('/recover', failureController.recoverPayment);
router.get('/summary', failureController.getFailureSummary);
router.post('/detect-stuck', failureController.detectStuckPayments);
router.get('/log', failureController.getFailureLog);
router.get('/dlq', failureController.getDLQEntries);

export default router;