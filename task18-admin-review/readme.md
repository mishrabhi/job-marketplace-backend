# Admin Console Core Assessment Bank & Proctoring Adjudication Queue

This module implements the **Admin Console Assessment Bank** and **Proctoring Adjudication Queue** for the PlaceMux backend. It enables administrators to manage assessment questions, maintain a verified item bank, review flagged proctoring incidents, and record adjudication decisions through secure administrative APIs.

The system provides centralized tools for assessment management while ensuring that proctoring incidents are reviewed through an auditable workflow.


# Folder Structure

```text id="5cskgb"
task18-admin-console/
├── migrations/
│   └── 025_admin_console_tables.sql      # Assessment bank & proctoring schema
├── src/
│   ├── config/
│   │   ├── db.js                         # Database connection
│   │   ├── env.js                        # Environment configuration
│   │   └── logger.js                     # Structured logging
│   ├── middlewares/
│   │   └── errorHandler.js               # Global error handler
│   ├── validators/
│   │   ├── question.validator.js         # Assessment validation schemas
│   │   └── proctoring.validator.js       # Adjudication validation
│   ├── controllers/
│   │   └── admin.controller.js           # Admin endpoints
│   ├── services/
│   │   └── admin.service.js              # Item bank & adjudication engine
│   └── routes/
│       ├── admin.routes.js               # /api/v1/admin endpoints
│       └── index.js                      # Route registry
├── app.js                                # Express application
├── server.js                             # Server bootstrap
├── package.json                          # Project manifest
└── README.md
```


# Core Architecture & Workflow

## 1. Assessment Item Bank

The Assessment Item Bank acts as the centralized repository for verified assessment questions.

Each stored question contains:

* Topic
* Difficulty Level
* Question Payload
* Answer Options
* Correct Answer Metadata
* Administrator Information

Questions are validated before being committed to the database to maintain consistency across assessments.


## 2. Proctoring Adjudication Queue

Flagged proctoring incidents enter a review queue where administrators evaluate suspicious candidate behavior.

Typical review outcomes include:

* Cleared
* Warning Issued
* Disqualified

Each adjudication records:

* Review ID
* Verdict
* Reviewing Administrator
* Resolution Notes
* Timestamp

This creates a complete audit trail for every reviewed incident.


## 3. Administrative Workflow

```text id="2lr8t2"
Assessment Question
        │
        ▼
Validate Request
        │
        ▼
Store in Item Bank
        │
        ▼
Available for Assessments

────────────────────────────

Flagged Proctoring Incident
        │
        ▼
Admin Review
        │
        ▼
Record Verdict
        │
        ▼
Persist Audit History
```


# Setup & Execution Guide

## 1. Deploy Database Schema

Run the migration within your PostgreSQL/Supabase instance.

```bash id="k1tn5g"
psql \
  -h your-supabase-host \
  -U postgres \
  -d postgres \
  -f migrations/025_admin_console_tables.sql
```


## 2. Install Dependencies

```bash id="bbsv3z"
npm install
```


## 3. Start Development Server

```bash id="jlwmw8"
npm run dev
```


# Evaluator Validation Guide

Configure the required environment variables.

```bash id="vx3t54"
export BASE=http://localhost:3009/api/v1
export AUDITING_ADMIN_ID="6a226759-42b7-47b2-8490-67bc1e09bc48"
```


## Step 1 — Add a Question to the Assessment Item Bank

```bash id="9djlwm"
curl -X POST "$BASE/admin/item-bank/questions" \
  -H "Content-Type: application/json" \
  -d "{
    \"topic\": \"Data Structures\",
    \"difficulty_level\": \"medium\",
    \"question_payload\": {
      \"text\": \"What is the average time complexity of searching an item within a balanced Binary Search Tree?\",
      \"options\": [
        \"O(1)\",
        \"O(n)\",
        \"O(log n)\",
        \"O(n log n)\"
      ]
    },
    \"correct_meta\": {
      \"answer_index\": 2
    },
    \"admin_user_id\": \"$AUDITING_ADMIN_ID\"
  }"
```

### Expected Result

Returns **HTTP 201 Created**.

Example response:

```json id="jlwmmk"
{
  "success": true,
  "question_created": true
}
```

Verify that the question has been stored correctly within the `assessment_item_bank` table.


## Step 2 — Review a Proctoring Incident

```bash id="o3rwq9"
curl -X POST "$BASE/admin/proctoring/adjudicate" \
  -H "Content-Type: application/json" \
  -d "{
    \"review_id\": \"<insert-active-flagged-row-uuid>\",
    \"verdict\": \"disqualified\",
    \"admin_user_id\": \"$AUDITING_ADMIN_ID\",
    \"resolution_notes\": \"Flagged incident confirmed. Candidate recorded switching viewports extensively over baseline tolerance parameters.\"
  }"
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json id="0vbq4w"
{
  "success": true,
  "review_status": "disqualified"
}
```

The review record is updated and the administrator's decision is permanently recorded in the audit trail.


# Security Features

* Centralized assessment item bank
* Administrative question management
* Secure proctoring review queue
* Immutable adjudication history
* Role-based administrative operations
* Structured audit logging
* Persistent database storage
* Production-ready moderation architecture


# Assessment Question Workflow

```text id="egho4j"
Create Question
        │
        ▼
Validate Request
        │
        ▼
Store Question
        │
        ▼
Persist Metadata
        │
        ▼
Available in Item Bank
```


# Proctoring Review Workflow

```text id="st0iyk"
Flagged Incident
        │
        ▼
Administrator Review
        │
        ▼
Select Verdict
        │
        ▼
Record Resolution Notes
        │
        ▼
Persist Decision
        │
        ▼
Complete Audit Trail
```

