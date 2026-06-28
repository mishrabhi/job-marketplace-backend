import express from ('express');
import router from express.Router();
import webhookController from ('../controllers/webhook.controller');
import rawBody from ('../middlewares/rawBody');

router.post('/razorpay', rawBody, webhookController.handleWebhook);

export default router;