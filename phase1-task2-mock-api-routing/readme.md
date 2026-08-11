# Task 2 — Pre-Project API Mock Routing

Mock routing contracts unblocking frontend integration for PlaceMux [source: 14].

## Verification Commands

1. **Get Mock Jobs List:**
   ```bash
   curl http://localhost:3000/api/v1/jobs
   ```

Get Mock Candidate Profile:
```
curl http://localhost:3000/api/v1/candidates/cand_101
```

Submit Mock Application:
```
curl -X POST http://localhost:3000/api/v1/applications \
  -H "Content-Type: application/json" \
  -d '{
    "job_id": "job_01h8a92b3c4d5e6f",
    "candidate_id": "cand_101",
    "cover_note": "Excited to apply for Full Stack Engineer!"
  }'
```

Verify Error Contract (404 Not Found):
```
curl http://localhost:3000/api/v1/candidates/cand_invalid
```