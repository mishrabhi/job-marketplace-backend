import express from ('express');
import routes from ('./src/routes');
import { errorHandler } from ('./src/middlewares/errorHandler');

const app = express();

app.use(express.json());

// Main monetization pipelines mount route
app.use('/api/v1', routes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', task: 'Task 10 Pipeline Stable' });
});

app.use(errorHandler);

export default app;