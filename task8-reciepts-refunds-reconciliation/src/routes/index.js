import Router from "express";
import receiptRoutes from './reciept.route'
import refundRoutes from './refund.routes';
import reconciliationRoutes from './reconciliation.routes';
import webhookRoutes from './webhook.routes';

const router = Router();

router.use('/receipts', receiptRoutes);
router.use('/refunds', refundRoutes);
router.use('/reconciliation', reconciliationRoutes);
router.use('/webhooks', webhookRoutes);

export default router;