import express from ('express');
import router from express.Router();
import revenueRoutes from ('./revenue.routes');

// Mount contextual route matrices safely
router.use('/revenue', revenueRoutes);

export default router;