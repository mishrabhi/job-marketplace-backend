import app from "./app.js";
import env from "./src/config/env.js";

app.listen(env.PORT, () => {
  console.log(`[Task 8] Receipts, Refunds & Reconciliation — running on port ${env.PORT}`);
});