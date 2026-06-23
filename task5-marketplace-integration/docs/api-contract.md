# PlaceMux Marketplace API Contract

Complete REST API surface for skill-gated job marketplace (Tasks 1-5 consolidated).

## Base URL
```
http://localhost:3000/api/v1
```

## Response Format
All endpoints return:
```json
{
  "success": true/false,
  "data": {},
  "error": { "code": "...", "message": "..." },
  "meta": { "page": 1, "limit": 20, "total": 100 }
}
```

---

## 1. Companies (Task 1)

### Register Company
- **POST** `/companies`
- **Body**: `{ name, email, phone }`
- **Response**: `201 Created` with company object
- **Error**: `409 DUPLICATE_COMPANY` if email exists

### Get Company Profile
- **GET** `/companies/{id}`
- **Response**: `200 OK` with company object

### Submit KYC
- **PATCH** `/companies/{id}/kyc`
- **Body**: `{ doc_type, storage_url }`
- **Response**: `200 OK` with KYC document

### Get KYC Status
- **GET** `/companies/{id}/kyc`
- **Response**: `200 OK` with KYC status

---

## 2. Jobs (Task 2)

### Create Job
- **POST** `/jobs`
- **Body**: `{ company_id, title, description, thresholds: [{ skill_id, min_level }, ...] }`
- **Response**: `201 Created` with job object + thresholds
- **Error**: `400 THRESHOLDS_REQUIRED` if thresholds empty

### Get Job Details
- **GET** `/jobs/{id}`
- **Response**: `200 OK` with job + thresholds

### Publish Job
- **POST** `/jobs/{id}/publish`
- **Body**: `{ company_id }`
- **Response**: `200 OK` with job + assessment link (idempotent token)
- **Error**: `403 FORBIDDEN` if company doesn't own job

### Get Assessment Link
- **GET** `/jobs/{id}/assessment-link`
- **Response**: `200 OK` with link object (token, expires_at)

---

## 3. Thresholds (Task 2)

### Check Student Eligibility
- **POST** `/threshold/check`
- **Body**: `{ student_id, job_id }`
- **Response**: `200 OK` with `{ eligible: true/false, failures: [...] }`

---

## 4. Search (Task 3)

### Search Jobs
- **GET** `/search/jobs?q=keyword&skill_id=uuid&min_level=50&page=1&limit=20`
- **Query**: `q` (optional), `skill_id` (optional), `min_level` (optional)
- **Response**: `200 OK` with jobs array + meta (pagination)

---

## 5. Discovery (Task 3)

### Get Ranked Feed
- **GET** `/discovery/feed?student_id=uuid&page=1&limit=20`
- **Query**: `student_id` (required), `page`, `limit`
- **Response**: `200 OK` with ranked jobs (match_score descending) + meta
- **Algorithm**: `match_score = (thresholds_met / total_thresholds) * 100`

### Get Job Details (Public)
- **GET** `/discovery/jobs/{id}`
- **Response**: `200 OK` with published job + thresholds
- **Error**: `404 JOB_NOT_FOUND` if draft

---

## 6. Applications (Task 4)

### Apply to Job
- **POST** `/applications`
- **Headers**: `Idempotency-Key: uuid` (required)
- **Body**: `{ job_id, student_id }`
- **Response**: `201 Created` with application
- **Idempotency**: Same key returns existing application (not duplicate)
- **Error**: `400 IDEMPOTENCY_KEY_REQUIRED` if header missing
- **Error**: `400 JOB_NOT_PUBLISHED` if job not published

### Get Application Status
- **GET** `/applications/{id}`
- **Response**: `200 OK` with application object

---

## 7. Shortlists (Task 4)

### Shortlist Candidate
- **POST** `/shortlists`
- **Body**: `{ application_id, company_id, note: "optional" }`
- **Response**: `201 Created` with shortlist
- **Error**: `403 FORBIDDEN` if company doesn't own job

---

## 8. Health (Task 5)

### Liveness Probe
- **GET** `/health`
- **Response**: `200 OK` if database connected, `503 Service Unavailable` otherwise

### Readiness Probe
- **GET** `/health/ready`
- **Response**: `200 OK` if all tables accessible, `503 Service Unavailable` otherwise

---

## Error Codes
| Code | Status | Meaning |
|------|--------|---------|
| `DUPLICATE_COMPANY` | 409 | Email already registered |
| `COMPANY_NOT_FOUND` | 404 | Company doesn't exist |
| `JOB_NOT_FOUND` | 404 | Job doesn't exist |
| `JOB_NOT_PUBLISHED` | 400 | Job not published for applications |
| `STUDENT_NOT_FOUND` | 404 | Student doesn't exist |
| `THRESHOLDS_REQUIRED` | 400 | Job must have ≥1 skill threshold |
| `IDEMPOTENCY_KEY_REQUIRED` | 400 | Missing Idempotency-Key header |
| `ASSESSMENT_LINK_NOT_FOUND` | 404 | No assessment link generated |
| `APPLICATION_NOT_FOUND` | 404 | Application doesn't exist |
| `FORBIDDEN` | 403 | Unauthorized (company/ownership) |

---

## Data Models

### Company
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "phone": "string",
  "kyc_status": "pending|submitted|verified",
  "created_at": "ISO8601"
}
```

### Student
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "skill_scores": { "skill_id": level, ... },
  "created_at": "ISO8601"
}
```

### Job
```json
{
  "id": "uuid",
  "company_id": "uuid",
  "title": "string",
  "description": "string",
  "status": "draft|published",
  "thresholds": [{ "id", "skill_id", "min_level" }, ...],
  "created_at": "ISO8601"
}
```

### Application
```json
{
  "id": "uuid",
  "job_id": "uuid",
  "student_id": "uuid",
  "status": "applied|withdrawn",
  "idempotency_key": "string",
  "created_at": "ISO8601"
}
```

### Shortlist
```json
{
  "id": "uuid",
  "application_id": "uuid",
  "company_id": "uuid",
  "status": "shortlisted|rejected",
  "note": "string|null",
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```
