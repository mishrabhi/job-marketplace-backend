import app from './app.js';
import env from './src/config/env.js';

const port = env.PORT;

app.listen(port, () => {
  console.log(`Task 3 API listening on port ${port}`);
});
