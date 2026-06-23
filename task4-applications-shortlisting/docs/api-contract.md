# Task 4 API Contract

## POST /api/v1/applications
Apply to a job (with idempotency).

Headers:
- Idempotency-Key: uuid (required)

Request body:
- job_id: uuid
- student_id: uuid

Response 201:
{
  "success": true,
  "data": {
    "id": "uuid",
    "job_id": "uuid",
    "student_id": "uuid",
    "status": "applied",
    "idempotency_key": "uuid",
    "created_at": "..."
  }
}

Errors:
- 400 IDEMPOTENCY_KEY_REQUIRED
- 400 JOB_NOT_PUBLISHED
- 404 JOB_NOT_FOUND
- 404 STUDENT_NOT_FOUND
- 422 VALIDATION_ERROR

Note: Calling with same idempotency key returns existing application (idempotent).

## GET /api/v1/applications/:id
Get application status.

Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "job_id": "uuid",
    "student_id": "uuid",
    "status": "applied",
    "created_at": "..."
  }
}

Errors:
- 404 APPLICATION_NOT_FOUND

## GET /api/v1/applications
List student's applications.

Query params:
- student_id: uuid (required)
- page: number (optional, default 1)
- limit: number (optional, default 20, max 100)

Response 200:
{
  "success": true,
  "data": [ { ... } ],
  "meta": { "page": 1, "limit": 20 }
}

Errors:
- 404 STUDENT_NOT_FOUND
- 422 VALIDATION_ERROR

## DELETE /api/v1/applications/:id
Withdraw an application.

Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "withdrawn",
    ...
  }
}

Errors:
- 400 INVALID_APPLICATION_STATUS
- 404 APPLICATION_NOT_FOUND

## POST /api/v1/shortlists
Shortlist a candidate.

Request body:
- application_id: uuid
- company_id: uuid
- note: string (optional)

Response 201:
{
  "success": true,
  "data": {
    "id": "uuid",
    "application_id": "uuid",
    "company_id": "uuid",
    "status": "shortlisted",
    "note": null,
    "created_at": "..."
  }
}

Errors:
- 403 FORBIDDEN (company doesn't own job)
- 404 APPLICATION_NOT_FOUND
- 404 JOB_NOT_FOUND

## POST /api/v1/shortlists/reject
Reject a candidate.

Request body:
- application_id: uuid
- company_id: uuid
- note: string (optional)

Response 201:
{
  "success": true,
  "data": {
    "id": "uuid",
    "application_id": "uuid",
    "company_id": "uuid",
    "status": "rejected",
    "note": null,
    "created_at": "..."
  }
}

## GET /api/v1/shortlists/:id
Get shortlist entry.

Response 200:
{
  "success": true,
  "data": { ... }
}

Errors:
- 404 SHORTLIST_NOT_FOUND

## PATCH /api/v1/shortlists/:id
Update shortlist status.

Request body:
- status: "shortlisted" | "rejected"
- note: string (optional)

Response 200:
{
  "success": true,
  "data": { ... }
}

Errors:
- 400 INVALID_STATUS
- 404 SHORTLIST_NOT_FOUND

## GET /api/v1/shortlists
List candidates for a job (company only).

Query params:
- job_id: uuid (required)
- company_id: uuid (required)
- page: number (optional, default 1)
- limit: number (optional, default 20, max 100)

Response 200:
{
  "success": true,
  "data": [ { ... } ],
  "meta": { "page": 1, "limit": 20 }
}

Errors:
- 403 FORBIDDEN
- 404 JOB_NOT_FOUND
