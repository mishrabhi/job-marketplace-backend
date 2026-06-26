import Router from 'express';
import ctrl from '../controllers/refund.controller';

const router = Router();

// POST /api/v1/refunds — initiate refund (idempotency_key required in body)
router.post('/', ctrl.initiateRefund);

// GET /api/v1/refunds/:id — get refund by ID
router.get('/:id', ctrl.getRefund);

// GET /api/v1/refunds/student/:student_id — list refunds for a student
router.get('/student/:student_id', ctrl.listStudentRefunds);

export default router;