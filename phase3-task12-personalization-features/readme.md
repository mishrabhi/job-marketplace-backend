# Personalization & Recommendation Feature Engine 

This module implements the **Personalization & Recommendation Feature Engine** for the PlaceMux backend. It provides low-latency feature retrieval, intelligent caching, cache invalidation, and feature consistency between model training and online serving.

The platform ensures recommendation models always receive fresh and consistent feature vectors while minimizing database load through an in-memory caching layer.


# Folder Structure

```text
phase3-task12-personalization-feature/
├── migrations/
│   └── 043_personalization_feature_store.sql    # Feature store & cache schema
├── src/
│   ├── config/
│   │   ├── db.js                                # Database connection
│   │   ├── env.js                               # Environment configuration
│   │   └── logger.js                            # Structured logging
│   ├── middlewares/
│   │   └── errorHandler.js                      # Global error handler
│   ├── validators/
│   │   └── feature.validator.js         # Request validation schemas
│   ├── controllers/
│   │   └── feature.controller.js        # Personalization endpoints
│   ├── services/
│   │   └── feature.service.js           # Feature store & cache engine
│   └── routes/
│       ├── feature.routes.js            # /api/v1/personalization endpoints
│       └── index.js                             # Route registry
├── app.js                                       # Express application
├── server.js                                    # Server bootstrap
├── package.json                                 # Project manifest
└── README.md
```


# Core Architecture & Workflow

## 1. Feature Store

The personalization engine maintains feature vectors for every candidate.

Each feature profile contains:

- Student ID
- Tenant ID
- Skills Vector
- Applications Count
- Average Match Score
- Last Updated Timestamp

These features are shared between offline model training and real-time inference to maintain feature parity.


## 2. Low-Latency Feature Retrieval

To reduce database load, frequently requested feature vectors are cached.

Feature retrieval follows:

- First request → Database
- Subsequent requests (within cache lifetime) → Cache
- Cache expiry or invalidation → Database refresh

This provides consistent low-latency responses.


## 3. Cache Invalidation

Whenever candidate profile information changes (for example, a resume upload), the cached feature vector is invalidated.

Typical invalidation triggers include:

- Resume uploaded
- Skills updated
- Assessment completed
- Profile edited

The next feature request automatically rebuilds the cache.


# Setup & Execution Guide

## 1. Deploy Database Schema

Run the migration within your PostgreSQL/Supabase instance.

```bash
psql \
  -h your-supabase-host \
  -U postgres \
  -d postgres \
  -f migrations/043_personalization_feature_tables.sql
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

export STUDENT_UUID="4b111d42-ab12-4211-8224-2da21e48bc02"
export TENANT_UUID="a1b23c44-dd55-66ee-77ff-88aa99bb0011"
```


## Step 1 — Upsert Candidate Feature Vector

```bash
curl -X POST "$BASE/personalization/features" \
  -H "Content-Type: application/json" \
  -d "{
    \"student_id\": \"$STUDENT_UUID\",
    \"tenant_id\": \"$TENANT_UUID\",
    \"skills_vector\": [\"NodeJS\", \"Postgres\", \"Express\"],
    \"applications_count\": 5,
    \"avg_match_score\": 0.8850
  }"
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json
{
  "success": true,
  "feature_vector_updated": true
}
```

The candidate's feature vector is inserted or updated in the feature store.

## Step 2 — Retrieve Feature Vector

### First Request (Database)

```bash
curl -X GET "$BASE/personalization/features?student_id=$STUDENT_UUID&tenant_id=$TENANT_UUID"
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json
{
  "success": true,
  "source": "DATABASE_STORE",
  "student_id": "4b111d42-ab12-4211-8224-2da21e48bc02"
}
```

The feature vector is loaded directly from the database and stored in cache.


### Second Request (Cache)

```bash
curl -X GET "$BASE/personalization/features?student_id=$STUDENT_UUID&tenant_id=$TENANT_UUID"
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json
{
  "success": true,
  "source": "CACHE_HIT",
  "student_id": "4b111d42-ab12-4211-8224-2da21e48bc02"
}
```

Since the cache entry is still valid, the response is served directly from memory.


## Step 3 — Invalidate Cached Features

```bash
curl -X POST "$BASE/personalization/cache/invalidate" \
  -H "Content-Type: application/json" \
  -d "{
    \"student_id\": \"$STUDENT_UUID\",
    \"tenant_id\": \"$TENANT_UUID\",
    \"reason\": \"NEW_RESUME_UPLOADED\"
  }"
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json
{
  "success": true,
  "cache_invalidated": true,
  "reason": "NEW_RESUME_UPLOADED"
}
```

The cached feature vector is removed. The next retrieval request automatically reloads the latest feature data from the database.


# Personalization Features

- Centralized Feature Store
- Low-Latency Feature Retrieval
- In-Memory Feature Caching
- Cache Invalidation
- Feature Parity Between Training & Serving
- Recommendation Feature Management
- Consistent Online Feature Access
- Structured Logging
- Production-ready Personalization Platform


# Feature Retrieval Workflow

```text
Feature Request
       │
       ▼
Check Cache
       │
       ├────────────► Cache Hit
       │                  │
       │                  ▼
       │         Return Cached Features
       │
       ▼
Load From Database
       │
       ▼
Update Cache
       │
       ▼
Return Features
```


# Cache Invalidation Workflow

```text
Profile Update
       │
       ▼
Detect Change
       │
       ▼
Invalidate Cache
       │
       ▼
Next Request
       │
       ▼
Reload From Database
       │
       ▼
Rebuild Cache
```
