import Router from 'express';
import ctrl from '../controllers/receipt.controller';

const router = Router();

// POST /api/v1/receipts — issue receipt for a captured payment (idempotent)
router.post('/', ctrl.issueReceipt);

// GET /api/v1/receipts/:id — get receipt by receipt ID
router.get('/:id', ctrl.getReceipt);

// GET /api/v1/receipts/by-payment/:payment_id — get receipt by payment ID
router.get('/by-payment/:payment_id', ctrl.getReceiptByPayment);

// GET /api/v1/receipts/student/:student_id — list all receipts for a student
router.get('/student/:student_id', ctrl.listStudentReceipts);

export default router;