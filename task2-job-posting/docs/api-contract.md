# Task 2 API Contract

## POST /api/v1/jobs
Create a new job with skill thresholds.

Request body:
- company_id: uuid
- title: string
- description: string
- thresholds: array of { skill_id: uuid, min_level: number 1-100 }

Response 201:
{
  "success": true,
  "data": {
    "id": "uuid",
    "company_id": "uuid",
    "title": "Backend Engineer",
    "description": "Build APIs",
    "status": "draft",
    "thresholds": [
      { "id": "uuid", "job_id": "uuid", "skill_id": "uuid", "min_level": 60 }
    ],
    "created_at": "..."
  }
}

Errors:
- 400 THRESHOLDS_REQUIRED
- 422 VALIDATION_ERROR

## GET /api/v1/jobs/:id
Retrieve job details with thresholds.

Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "company_id": "uuid",
    "title": "Backend Engineer",
    "description": "Build APIs",
    "status": "draft",
    "thresholds": [ ... ],
    "created_at": "..."
  }
}

Errors:
- 404 JOB_NOT_FOUND

## POST /api/v1/jobs/:id/publish
Publish a job and generate assessment link.

Request body:
- company_id: uuid

Response 200:
{
  "success": true,
  "data": {
    "job": { "id": "uuid", ..., "status": "published" },
    "assessmentLink": {
      "id": "uuid",
      "job_id": "uuid",
      "token": "uuid-token",
      "expires_at": "..."
    }
  }
}

Errors:
- 403 FORBIDDEN (not the company owner)
- 404 JOB_NOT_FOUND

## GET /api/v1/jobs/:id/assessment-link
Get assessment link for a published job.

Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "job_id": "uuid",
    "token": "uuid-token",
    "expires_at": "..."
  }
}

Errors:
- 404 JOB_NOT_FOUND
- 404 ASSESSMENT_LINK_NOT_FOUND

## POST /api/v1/threshold/check
Check if student meets thresholds for a job.

Request body:
- student_id: uuid
- job_id: uuid

Response 200:
{
  "success": true,
  "data": {
    "eligible": true or false,
    "failures": [
      {
        "skill_id": "uuid",
        "reason": "THRESHOLD_NOT_MET",
        "message": "Student skill level 45 is below required level 60",
        "student_level": 45,
        "required_level": 60
      }
    ]
  }
}

Errors:
- 404 STUDENT_NOT_FOUND
- 404 JOB_NOT_FOUND
- 422 VALIDATION_ERROR
