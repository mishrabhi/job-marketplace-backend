# Hybrid Semantic Search & Vector Retrieval Engine

This module implements the **Hybrid Semantic Search & Vector Retrieval Engine** for the PlaceMux backend. It combines traditional keyword-based search with dense vector similarity search to deliver highly relevant candidate retrieval while enforcing strict multi-tenant data isolation.

The platform performs tenant-aware pre-filtering before executing search operations, ensuring that users only access records belonging to their authorized organization.


# Folder Structure

```text
phase3-task13-semantic-search/
├── migrations/
│   └── 044_hybrid_sematic_search.sql         # Search index & vector schema
├── src/
│   ├── config/
│   │   ├── db.js                            # Database connection
│   │   ├── env.js                           # Environment configuration
│   │   └── logger.js                        # Structured logging
│   ├── middlewares/
│   │   └── errorHandler.js                  # Global error handler
│   ├── validators/
│   │   └── search.validator.js              # Request validation schemas
│   ├── controllers/
│   │   └── search.controller.js             # Search endpoints
│   ├── services/
│   │   └── search.service.js                # Hybrid search engine
│   └── routes/
│       ├── search.routes.js                 # /api/v1/search endpoints
│       └── index.js                         # Route registry
├── app.js                                   # Express application
├── server.js                                # Server bootstrap
├── package.json                             # Project manifest
└── README.md
```


# Core Architecture & Workflow

## 1. Hybrid Search Engine

The search engine combines:

- Keyword Matching
- Dense Vector Similarity
- Candidate Ranking
- Tenant Filtering

This approach delivers accurate search results by leveraging both lexical relevance and semantic understanding.


## 2. Vector Retrieval

Each indexed candidate stores:

- Profile Information
- Searchable Keywords
- Dense Embedding Vector
- Tenant Identifier
- Search Metadata

The dense embedding enables semantic matching beyond exact keyword searches.

## 3. Tenant-Aware Search

Before executing any search query, the engine applies tenant filtering.

This guarantees:

- Complete tenant isolation
- No cross-tenant visibility
- Secure search execution
- Multi-tenant compliance

Unauthorized tenant queries return no matching results.


# Setup & Execution Guide

## 1. Deploy Database Schema

Run the migration within your PostgreSQL/Supabase instance.

```bash
psql \
  -h your-supabase-host \
  -U postgres \
  -d postgres \
  -f migrations/044_hybrid_search_tables.sql
```


## 2. Install Dependencies

```bash
npm install
```


## 3. Start Development Server

```bash
npm run dev
```


# Evaluator Validation Guide

Configure the required environment variables.

```bash
export BASE=http://localhost:3009/api/v1

export STUDENT_UUID="4b111d42-ab12-4211-8224-2da21e48bc02"
export TENANT_UUID="a1b23c44-dd55-66ee-77ff-88aa99bb0011"
export OTHER_TENANT="9fffffff-ffff-ffff-ffff-ffffffffffff"
```


## Step 1 — Index a Candidate

```bash
curl -X POST "$BASE/search/index" \
  -H "Content-Type: application/json" \
  -d "{
    \"student_id\": \"$STUDENT_UUID\",
    \"tenant_id\": \"$TENANT_UUID\",
    \"full_name\": \"Alex Rivera\",
    \"headline\": \"Senior Backend Systems Engineer\",
    \"skills_keywords\": \"NodeJS, Postgres, Express, Distributed Systems\",
    \"dense_embedding\": [0.12, 0.45, 0.88, 0.33]
  }"
```

### Expected Result

Returns **HTTP 201 Created**.

Example response:

```json
{
  "success": true,
  "candidate_indexed": true
}
```

The candidate profile is successfully indexed and becomes available for hybrid search.

---

## Step 2 — Execute a Hybrid Search

```bash
curl -X POST "$BASE/search/query" \
  -H "Content-Type: application/json" \
  -d "{
    \"query\": \"NodeJS\",
    \"tenant_id\": \"$TENANT_UUID\",
    \"page\": 1,
    \"limit\": 10
  }"
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json
{
  "success": true,
  "slo_cleared": true,
  "results": [
    {
      "full_name": "Alex Rivera",
      "headline": "Senior Backend Systems Engineer"
    }
  ]
}
```

The engine performs both keyword and semantic vector matching while restricting results to the specified tenant.

---

## Step 3 — Verify Multi-Tenant Isolation

Execute the same search using an unauthorized tenant.

```bash
curl -X POST "$BASE/search/query" \
  -H "Content-Type: application/json" \
  -d "{
    \"query\": \"NodeJS\",
    \"tenant_id\": \"$OTHER_TENANT\",
    \"page\": 1,
    \"limit\": 10
  }"
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json
{
  "success": true,
  "results": []
}
```

No candidate records are returned because tenant pre-filtering prevents cross-tenant data access.


# Search Features

- Hybrid Keyword + Semantic Search
- Dense Vector Retrieval
- Candidate Indexing
- Multi-Tenant Query Isolation
- Tenant-Aware Pre-filtering
- Semantic Ranking
- Low-Latency Search
- Structured Logging
- Production-ready Search Infrastructure


# Candidate Indexing Workflow

```text
Candidate Profile
        │
        ▼
Generate Search Document
        │
        ▼
Store Keywords
        │
        ▼
Store Dense Embedding
        │
        ▼
Persist Search Index
```

# Hybrid Search Workflow

```text
Search Request
        │
        ▼
Validate Tenant
        │
        ▼
Apply Tenant Filter
        │
        ▼
Keyword Search
        │
        ▼
Vector Similarity Search
        │
        ▼
Merge & Rank Results
        │
        ▼
Return Candidates
```

# Tenant Isolation Workflow

```text
Incoming Search
        │
        ▼
Read Tenant ID
        │
        ▼
Apply Tenant Filter
        │
        ▼
Search Authorized Records
        │
        ▼
Return Matching Results
```
