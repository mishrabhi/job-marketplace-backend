import express from ('express');
import router from express.Router();
import failureRoutes from ('./failure.route.js');
import webhookRoutes from ('./webhook.route.js');

router.use('/failures', failureRoutes);
router.use('/webhooks', webhookRoutes);

export default router;