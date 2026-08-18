# PlaceMux API Architecture & Conventions (v1.0)

## 1. Architectural Layering Flow
Requests flow strictly through 4 discrete layers:
`HTTP Request` ➔ `Route (URL & Validation)` ➔ `Controller (HTTP context & parsing)` ➔ `Service (Business Logic)` ➔ `Repository (Data Access)` ➔ `HTTP Response Envelope`

* **Routes:** Route matching, middleware binding, and schema attachment only.
* **Controllers:** Thin boundary handlers; extracts parameters, invokes service, formats response.
* **Services:** Pure business domain rules; completely agnostic of Express `req` / `res`.
* **Repository / Data:** Data persistence abstraction and query mechanics.

## 2. Uniform REST Conventions
* Resources use plural nouns (`/jobs`, `/candidates`, `/applications`).
* Standard HTTP Verbs: `GET` (Read), `POST` (Create), `PUT`/`PATCH` (Update), `DELETE` (Remove).
* Nesting represents direct sub-resource ownership (e.g., `GET /jobs/:id/applications`).

## 3. Standard Envelope & Pagination Strategy[cite: 15]
Every list endpoint implements standardized pagination, filtering, and sorting parameters:
* `page`: 1-based page index (Default: 1)[cite: 15]
* `limit`: Page size constraint (Default: 10, Max: 100)[cite: 15]
* `sort`: Field to sort by with directional prefix (e.g., `sort=-created_at`)[cite: 15]

### Standard Success Envelope[cite: 15]
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total_records": 42,
    "total_pages": 5,
    "has_next": true,
    "has_prev": false
  },
  "timestamp": "2026-08-18T11:22:33.456Z"
}