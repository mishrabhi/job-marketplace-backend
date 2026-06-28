# Monetization Integration & Revenue Dashboard

This module implements the final layer of the PlaceMux payment infrastructure by introducing **Monetization Integration** and a **Revenue Analytics Dashboard**. It provides real-time revenue reporting using PostgreSQL Materialized Views, automated gateway reconciliation, and production-ready analytics to ensure internal financial records remain synchronized with Razorpay transaction data.


# Folder Structure

```text
task10-monetization-revenue/
├── migrations/
│   └── 017_revenue_dashboard_views.sql   # Database reporting views (Revenue metrics & reconciliation)
├── src/
│   ├── config/
│   │   ├── db.js                         # Supabase client initialization
│   │   ├── env.js                        # Environment validation & feature flags
│   │   ├── logger.js                     # Structured logging manager
│   │   └── razorpay.js                   # Razorpay SDK wrapper
│   ├── middlewares/
│   │   └── errorHandler.js               # Global error handler
│   ├── validators/
│   │   └── revenue.validator.js          # Zod request validation schemas
│   ├── controllers/
│   │   └── revenue.controller.js         # Revenue dashboard & reconciliation endpoints
│   ├── services/
│   │   └── revenue.service.js            # Revenue analytics & gateway reconciliation logic
│   └── routes/
│       ├── revenue.routes.js             # /api/v1/revenue endpoints
│       └── index.js                      # Route registry
├── app.js                                # Express application setup
├── server.js                             # Server bootstrap
├── .env.example                          # Environment configuration template
└── package.json                          # Project manifest
```


# Core Monetization Architecture & Flows

## 1. Persistent Revenue Summary Views

To keep analytical queries fast and isolated from production workloads, reporting data is generated through PostgreSQL Materialized Views.

The application relies on:

* `view_revenue_metrics_summary`
* `view_daily_revenue_reconciliation`

These views aggregate payment data directly from the database, providing:

* Daily revenue metrics
* Platform earnings
* Payment success rates
* Refund statistics
* Reconciliation summaries

Using database views eliminates expensive runtime aggregations and avoids relying on in-memory caching.


## 2. Live Verification & Safety Mode

The application supports both sandbox and production payment environments through an environment-controlled feature flag.

| Configuration              | Purpose                       |
| -------------------------- | ----------------------------- |
| `IS_REAL_MONEY_MODE=false` | Sandbox / Testing Environment |
| `IS_REAL_MONEY_MODE=true`  | Production Live Payment Mode  |

This flag allows the backend to safely switch between simulated and real-money transaction processing without modifying application logic.

## 3. Gateway Balance Reconciliation Engine

To ensure financial integrity, the backend periodically compares internal payment records with Razorpay's official transaction history.

The `performGatewayReconciliation()` routine performs the following steps:

1. Retrieves internal payment records for a target date.
2. Fetches captured transactions from the Razorpay API within the same time window.
3. Compares totals, counts, and payment states.
4. Detects any mismatches between the application database and gateway records.
5. Produces reconciliation reports for operational auditing.

This guarantees that revenue metrics accurately reflect the payment gateway's source of truth.


# Setup & Execution Guide

## 1. Deploy Database Schema

Run the reporting view migration within your Supabase PostgreSQL database.

```bash
psql \
  -h your-supabase-host \
  -U postgres \
  -d postgres \
  -f migrations/017_revenue_dashboard_views.sql
```


## 2. Configure Environment Variables

Create a `.env` file using the following configuration:

```env
PORT=3009
NODE_ENV=development

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your-razorpay-test-secret

IS_REAL_MONEY_MODE=false
```

### Environment Modes

| Variable                   | Description                       |
| -------------------------- | --------------------------------- |
| `IS_REAL_MONEY_MODE=false` | Uses Razorpay Sandbox for testing |
| `IS_REAL_MONEY_MODE=true`  | Enables live payment processing   |


## 3. Install Dependencies

```bash
npm install
```


## 4. Start Development Server

```bash
npm run dev
```

# Revenue Dashboard Features

The dashboard exposes analytical endpoints that provide:

* Total Revenue
* Total Successful Payments
* Failed Payment Statistics
* Refunded Amount
* Platform Earnings
* Daily Revenue Trends
* Revenue Reconciliation Reports
* Payment Success Rate
* Gateway vs Internal Record Comparison


# Revenue Reconciliation Workflow

The reconciliation engine performs the following validation flow:

```text
Application Database
        │
        ▼
Fetch Internal Payments
        │
        ▼
Fetch Razorpay Transactions
        │
        ▼
Compare Counts
        │
        ▼
Compare Revenue Totals
        │
        ▼
Compare Payment Statuses
        │
        ▼
Generate Reconciliation Report
```

Any discrepancies detected are highlighted for operational review, ensuring financial transparency and data consistency.


# Key Features

* Revenue Analytics Dashboard
* PostgreSQL Materialized Views
* Daily Revenue Aggregation
* Gateway Reconciliation Engine
* Razorpay Integration
* Production & Sandbox Mode Support
* Real-time Financial Metrics
* Environment-based Safety Controls
* Structured Logging
* Production-ready Reporting Architecture
