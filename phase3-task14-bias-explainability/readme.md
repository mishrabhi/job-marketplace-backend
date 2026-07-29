# Fairness, Bias Audit & Explainability Engine 

This module implements the **Fairness, Bias Audit & Explainability Engine** for the PlaceMux backend. It provides immutable AI decision logging, explainable prediction APIs, bias audit capabilities, and a human-in-the-loop appeal workflow to ensure transparency and accountability in automated hiring decisions.

The platform enables organizations to audit every machine learning decision, provide meaningful explanations to candidates, and support manual review processes when decisions are challenged.


# Folder Structure

```text
phase3-task14-bias-explainatory/
├── migrations/
│   └── 046_decision_audit_appeals.sql        # Fairness audit & appeals schema
├── src/
│   ├── config/
│   │   ├── db.js                           # Database connection
│   │   ├── env.js                          # Environment configuration
│   │   └── logger.js                       # Structured logging
│   ├── middlewares/
│   │   └── errorHandler.js                 # Global error handler
│   ├── validators/
│   │   └── audit.validator.js           # Request validation schemas
│   ├── controllers/
│   │   └── audit.controller.js          # Fairness & appeals endpoints
│   ├── services/
│   │   └── audit.service.js             # Explainability & audit engine
│   └── routes/
│       ├── audit.routes.js              # /api/v1/fairness endpoints
│       └── index.js                        # Route registry
├── app.js                                  # Express application
├── server.js                               # Server bootstrap
├── package.json                            # Project manifest
└── README.md
```


# Core Architecture & Workflow

## 1. Immutable Decision Logging

Every automated hiring decision is permanently recorded in an append-only audit log.

Each record contains:

- Decision Token
- Candidate ID
- Application ID
- Model Version
- Decision Type
- Decision Reason
- Feature Importance
- Input Snapshot
- Timestamp

Once written, decision records cannot be modified, ensuring complete auditability.


## 2. Explainability Engine

The explainability service provides transparent explanations for AI-driven decisions.

Each explanation includes:

- Decision Summary
- Model Version
- Feature Importance Scores
- Decision Reason
- Input Snapshot

This enables candidates and administrators to understand why a particular decision was made.


## 3. Human-in-the-Loop Appeals

Candidates may appeal automated decisions for manual review.

The workflow includes:

- Appeal Submission
- Human Review
- Reviewer Notes
- Final Decision
- Audit Trail

This ensures fairness by allowing qualified reviewers to override automated outcomes when appropriate.

#  Setup & Execution Guide

## 1. Deploy Database Schema

Run the migration within your PostgreSQL/Supabase instance.

```bash
psql \
  -h your-supabase-host \
  -U postgres \
  -d postgres \
  -f migrations/045_fairness_audit_tables.sql
```


## 2. Install Dependencies

```bash
npm install
```


## 3. Start Development Server

```bash
npm run dev
```


#  Evaluator Validation Guide

Configure the required environment variables.

```bash
export BASE=http://localhost:3009/api/v1

export CANDIDATE_UUID="4b111d42-ab12-4211-8224-2da21e48bc02"
export APP_UUID="8a329d41-cc21-4112-9114-1da21e48bc01"
export TENANT_UUID="a1b23c44-dd55-66ee-77ff-88aa99bb0011"
export DECISION_TOKEN="dec-token-2026-xyz-001"
export REVIEWER_UUID="6a226759-42b7-47b2-8490-67bc1e09bc48"
```


## Step 1 — Log an Automated Decision

```bash
curl -X POST "$BASE/fairness/decisions/log" \
  -H "Content-Type: application/json" \
  -d "{
    \"decision_token\": \"$DECISION_TOKEN\",
    \"tenant_id\": \"$TENANT_UUID\",
    \"candidate_id\": \"$CANDIDATE_UUID\",
    \"application_id\": \"$APP_UUID\",
    \"model_version\": \"ltr_v2.1_xgboost\",
    \"decision_type\": \"REJECTED\",
    \"decision_reason\": \"Candidate match score (0.42) fell below automated cutoff threshold (0.60)\",
    \"feature_weights\": {
      \"skill_match\": 0.30,
      \"experience_years\": 0.12,
      \"batch_year_match\": 0.00
    },
    \"input_snapshot\": {
      \"skills\": [\"HTML\", \"CSS\"],
      \"experience_months\": 6
    }
  }"
```

### Expected Result

Returns **HTTP 201 Created**.

Example response:

```json
{
  "success": true,
  "decision_logged": true
}
```

The automated decision is permanently stored in the immutable audit log.

---

## Step 2 — Retrieve Decision Explanation

```bash
curl -X GET "$BASE/fairness/decisions/explain?decision_token=$DECISION_TOKEN&tenant_id=$TENANT_UUID"
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json
{
  "success": true,
  "decision_type": "REJECTED",
  "model_version": "ltr_v2.1_xgboost",
  "decision_reason": "Candidate match score fell below threshold.",
  "feature_importance": {
    "skill_match": 0.30,
    "experience_years": 0.12,
    "batch_year_match": 0.00
  }
}
```

The explanation API returns the model version, decision summary, and feature importance values that contributed to the prediction.

---

## Step 3 — Submit an Appeal

```bash
curl -X POST "$BASE/fairness/appeals/submit" \
  -H "Content-Type: application/json" \
  -d "{
    \"decision_token\": \"$DECISION_TOKEN\",
    \"candidate_id\": \"$CANDIDATE_UUID\",
    \"tenant_id\": \"$TENANT_UUID\",
    \"appeal_reason\": \"I have updated my portfolio with 2 years of Node.js production experience that was omitted during initial extraction.\",
    \"idempotency_key\": \"appeal-token-sub-001\"
  }"
```

### Expected Result

Returns **HTTP 201 Created**.

Example response:

```json
{
  "success": true,
  "appeal_status": "submitted"
}
```

The appeal is successfully recorded and queued for manual review.

---

## Step 4 — Adjudicate the Appeal

```bash
curl -X POST "$BASE/fairness/appeals/adjudicate" \
  -H "Content-Type: application/json" \
  -d "{
    \"appeal_id\": \"<INSERT_APPEAL_UUID_FROM_STEP_3>\",
    \"tenant_id\": \"$TENANT_UUID\",
    \"status\": \"overturned\",
    \"reviewer_notes\": \"Verified updated portfolio credentials. Re-opening candidate profile for manual interview round.\",
    \"reviewed_by\": \"$REVIEWER_UUID\"
  }"
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json
{
  "success": true,
  "appeal_status": "overturned",
  "review_completed": true
}
```

The appeal is adjudicated by a human reviewer, and the decision is recorded in the audit log.


# Fairness & Explainability Features

- Immutable AI Decision Logging
- Explainable Decision APIs
- Feature Importance Tracking
- Human-in-the-Loop Appeals
- Append-Only Audit Logs
- Bias Audit Support
- Manual Review Workflow
- Transparent AI Governance
- Production-ready Responsible AI Platform


# Decision Logging Workflow

```text
Model Prediction
       │
       ▼
Generate Decision
       │
       ▼
Capture Feature Importance
       │
       ▼
Persist Immutable Audit Record
       │
       ▼
Return Decision
```


# Explainability Workflow

```text
Explanation Request
        │
        ▼
Locate Decision Record
        │
        ▼
Retrieve Model Metadata
        │
        ▼
Generate Explanation
        │
        ▼
Return Feature Importance
```

# Appeal Workflow

```text
Candidate Appeal
        │
        ▼
Validate Request
        │
        ▼
Create Appeal Record
        │
        ▼
Assign Human Reviewer
        │
        ▼
Manual Evaluation
        │
        ▼
Record Final Verdict
        │
        ▼
Persist Audit Trail
```
