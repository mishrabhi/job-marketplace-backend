# API Architecture & Conventions 

This module establishes the standardized REST API architecture and conventions for PlaceMux. It provides consistent response envelopes, pagination, query filtering, request validation, and a clean four-tier application-layer separation.


## Core Architecture

The API follows a layered architecture designed to keep responsibilities isolated and maintainable:

```text
Client
  │
  ▼
Routes
  │
  ▼
Controllers
  │
  ▼
Services
  │
  ▼
Data / Database Layer
```

### Key Conventions

- Standardized success response envelopes
- Standardized error response envelopes
- Paginated collection responses
- Query parameter filtering
- Request schema validation
- Consistent HTTP status codes
- Four-tier layer decoupling
- Predictable REST endpoint conventions

## API Response Conventions

### Success Response

Successful resource operations use a consistent `successResponse` structure.

Example:

```json
{
  "success": true,
  "data": {
    "id": "resource-uuid",
    "title": "Lead Backend Architect"
  }
}
```

### Paginated Response

Collection endpoints expose pagination metadata alongside the returned records.

Example:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 2,
    "total_records": 10,
    "total_pages": 5,
    "has_next": true
  }
}
```

### Error Response

Errors follow a consistent `error` envelope.

Example:

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Job not found"
  }
}
```


# API Usage

The API is exposed under:

```text
http://localhost:3000/api/v1
```


# Evaluator Verification Guide

## Step 1 — Verify Standardized Paginated Collection

Query the jobs collection with explicit pagination parameters.

```bash
curl -X GET "http://localhost:3000/api/v1/jobs?page=1&limit=2"
```

### Expected Result

Returns **HTTP 200 OK**.

The response follows the standardized `paginatedResponse` structure and includes pagination metadata such as:

- `total_records`
- `total_pages`
- `has_next`

Example:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 2,
    "total_records": 8,
    "total_pages": 4,
    "has_next": true
  }
}
```


## Step 2 — Verify Query Filtering

Filter candidates by a specific skill.

```bash
curl -X GET "http://localhost:3000/api/v1/candidates?skill=Node.js"
```

### Expected Result

Returns **HTTP 200 OK**.

The response contains only candidates matching the requested skill filter.

## Step 3 — Create a New Resource with Validation

Create a new job using the standardized POST endpoint.

```bash
curl -X POST "http://localhost:3000/api/v1/jobs" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Lead Backend Architect",
    "department": "Infrastructure",
    "location": "Bengaluru, India",
    "type": "FULL_TIME",
    "salary_range": "₹35,00,000 - ₹45,00,000"
  }'
```

### Expected Result

Returns **HTTP 201 Created**.

The response is wrapped using the standardized `successResponse` envelope.

Example:

```json
{
  "success": true,
  "data": {
    "title": "Lead Backend Architect",
    "department": "Infrastructure",
    "location": "Bengaluru, India",
    "type": "FULL_TIME",
    "salary_range": "₹35,00,000 - ₹45,00,000"
  }
}
```

Request validation ensures that invalid or missing fields are rejected before the resource is created.


## Step 4 — Verify Uniform Error Format

Request a job using an invalid resource identifier.

```bash
curl -X GET "http://localhost:3000/api/v1/jobs/job_invalid_id"
```

### Expected Result

Returns **HTTP 404 Not Found**.

The response uses the standardized error envelope.

Example:

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Job not found"
  }
}
```

# Request Lifecycle

```text
HTTP Request
     │
     ▼
Route
     │
     ▼
Validation
     │
     ▼
Controller
     │
     ▼
Service
     │
     ▼
Database
     │
     ▼
Standardized Response
```

# Pagination Workflow

```text
Client Request
     │
     ▼
?page=1&limit=2
     │
     ▼
Validate Query Parameters
     │
     ▼
Fetch Requested Records
     │
     ▼
Calculate Pagination Metadata
     │
     ▼
paginatedResponse
```

# Error Handling Workflow

```text
Invalid Request
      │
      ▼
Validation / Resource Check
      │
      ▼
Error Identified
      │
      ▼
Central Error Handler
      │
      ▼
Standardized Error Envelope
      │
      ▼
HTTP Status Code
```

# API Design Principles

### Consistency

All endpoints follow the same response and error conventions.

### Validation

Incoming request bodies and query parameters are validated before business logic execution.

### Pagination

Large collections are accessed through explicit pagination parameters rather than returning unrestricted datasets.

### Filtering

Collection endpoints support query-based filtering where applicable.

### Separation of Concerns

Business logic remains isolated from HTTP routing and controller concerns through a layered architecture.


# Supported API Patterns

| Pattern | Example |
|---|---|
| Paginated Collection | `GET /api/v1/jobs?page=1&limit=2` |
| Filtered Collection | `GET /api/v1/candidates?skill=Node.js` |
| Resource Creation | `POST /api/v1/jobs` |
| Resource Lookup | `GET /api/v1/jobs/:id` |
| Success Envelope | `successResponse` |
| Paginated Envelope | `paginatedResponse` |
| Error Envelope | `error` |
