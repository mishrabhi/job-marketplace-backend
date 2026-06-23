# PlaceMux Demo Script (2 min)

## Setup
```bash
# Terminal 1: Start server
cd task5-marketplace-integration
npm install
npm run migrate
npm run dev

# Terminal 2: Run demo
cd task5-marketplace-integration
```

## Step 1: Company Signup
```bash
curl -X POST http://localhost:3000/api/v1/companies \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TechCorp",
    "email": "hr@techcorp.com",
    "phone": "9876543210"
  }'
# Save COMPANY_ID
```

## Step 2: Company KYC Submission
```bash
COMPANY_ID="<from step 1>"
curl -X PATCH http://localhost:3000/api/v1/companies/$COMPANY_ID/kyc \
  -H "Content-Type: application/json" \
  -d '{
    "doc_type": "GST",
    "storage_url": "https://storage.example.com/gst.pdf"
  }'
```

## Step 3: Create Job with Thresholds
```bash
curl -X POST http://localhost:3000/api/v1/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "company_id": "'$COMPANY_ID'",
    "title": "Senior Node.js Developer",
    "description": "Build scalable backend services with Node.js and Express",
    "thresholds": [
      {
        "skill_id": "550e8400-e29b-41d4-a716-446655440000",
        "min_level": 60
      }
    ]
  }'
# Save JOB_ID
```

## Step 4: Publish Job (Get Assessment Link)
```bash
JOB_ID="<from step 3>"
curl -X POST http://localhost:3000/api/v1/jobs/$JOB_ID/publish \
  -H "Content-Type: application/json" \
  -d '{
    "company_id": "'$COMPANY_ID'"
  }'
# Returns assessment link with token
```

## Step 5: Search Jobs (Discovery)
```bash
curl -X GET "http://localhost:3000/api/v1/search/jobs?q=Node"
```

## Step 6: Check Skill Threshold
```bash
STUDENT_ID="550e8400-e29b-41d4-a716-446655440001"
curl -X POST http://localhost:3000/api/v1/threshold/check \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "'$STUDENT_ID'",
    "job_id": "'$JOB_ID'"
  }'
# Returns { eligible: true/false, failures: [...] }
```

## Step 7: Student Application (with Idempotency)
```bash
IDEMPOTENCY_KEY=$(uuidgen)
curl -X POST http://localhost:3000/api/v1/applications \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $IDEMPOTENCY_KEY" \
  -d '{
    "job_id": "'$JOB_ID'",
    "student_id": "'$STUDENT_ID'"
  }'
# Save APPLICATION_ID
# Repeat: same APPLICATION_ID returned (idempotent)
```

## Step 8: Company Shortlist Candidate
```bash
APPLICATION_ID="<from step 7>"
curl -X POST http://localhost:3000/api/v1/shortlists \
  -H "Content-Type: application/json" \
  -d '{
    "application_id": "'$APPLICATION_ID'",
    "company_id": "'$COMPANY_ID'",
    "note": "Excellent experience, invite to interview"
  }'
```

## Step 9: Health Check
```bash
curl http://localhost:3000/api/v1/health
# Should return: { success: true, data: { status: "ok", database: "connected" } }
```

---

## Expected Results
- ✅ Company created with UUID
- ✅ KYC submitted successfully
- ✅ Job created with thresholds
- ✅ Job published with assessment link token
- ✅ Search returns published job
- ✅ Threshold check returns eligibility (true/false)
- ✅ Application created with idempotency
- ✅ Candidate shortlisted
- ✅ Health endpoint reports connected DB
