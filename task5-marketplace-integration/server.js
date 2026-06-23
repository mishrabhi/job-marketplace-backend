import { app, pool } from './app.js';
import env from './src/config/env.js';

const port = env.PORT;

app.listen(port, () => {
  console.log(`Task 5 API listening on port ${port}`);
});
