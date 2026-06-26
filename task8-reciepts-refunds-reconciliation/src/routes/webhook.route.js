import Router from 'express';
import rawBody from '../middlewares/rawBody';
import ctrl from '../controllers/webhook.controller';

const router = Router();

// POST /api/v1/webhooks/razorpay
// IMPORTANT: rawBody middleware must be used here, NOT express.json()
// Razorpay verifies the HMAC of the raw bytes — once parsed to JSON
// and re-serialised the signature will not match.
router.post('/razorpay', rawBody, ctrl.handleWebhook);

export default router;