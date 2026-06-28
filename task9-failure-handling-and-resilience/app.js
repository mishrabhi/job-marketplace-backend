import express from ('express');
import routes from ('./src/routes');
import { errorHandler } from ('./src/middlewares/errorHandler');

const app = express();

app.use((req, res, next) => {
  if (req.path === '/api/v1/webhooks/razorpay') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.use('/api/v1', routes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

export default app;