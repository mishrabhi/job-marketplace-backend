import express from ('express');
import router from express.Router();
import failureRoutes from ('./failure.routes');
import webhookRoutes from ('./webhook.routes');

router.use('/failures', failureRoutes);
router.use('/webhooks', webhookRoutes);

export default router;