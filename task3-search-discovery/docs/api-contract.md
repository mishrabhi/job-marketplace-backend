# Task 3 API Contract

## GET /api/v1/search/jobs
Search published jobs by query, skill, and level.

Query params:
- q: string (optional) - search in title and description
- skill_id: uuid (optional) - filter by skill
- min_level: number 1-100 (optional) - filter jobs with max threshold <= this level
- page: number (optional, default 1)
- limit: number (optional, default 20, max 100)

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "company_id": "uuid",
      "title": "Backend Engineer",
      "description": "Build APIs",
      "status": "published",
      "created_at": "..."
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 143
  }
}

Errors:
- 400 INVALID_PARAMS
- 422 VALIDATION_ERROR

## GET /api/v1/discovery/feed
Ranked job feed for a student based on skill match.

Query params:
- student_id: uuid (required)
- page: number (optional, default 1)
- limit: number (optional, default 20, max 100)

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "company_id": "uuid",
      "title": "Backend Engineer",
      "description": "Build APIs",
      "status": "published",
      "thresholds": [ { "skill_id": "uuid", "min_level": 60 } ],
      "match_score": 85.5,
      "created_at": "..."
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 143
  }
}

Errors:
- 404 STUDENT_NOT_FOUND
- 422 VALIDATION_ERROR

## GET /api/v1/discovery/jobs/:id
Public job detail view (published jobs only).

Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "company_id": "uuid",
    "title": "Backend Engineer",
    "description": "Build APIs",
    "status": "published",
    "thresholds": [
      { "id": "uuid", "skill_id": "uuid", "min_level": 60 }
    ],
    "created_at": "..."
  }
}

Errors:
- 404 JOB_NOT_FOUND (if not published or doesn't exist)
