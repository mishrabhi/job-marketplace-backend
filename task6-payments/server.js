const app = require('./app');
const env = require('./src/config/env');

const port = env.PORT || 3006;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
