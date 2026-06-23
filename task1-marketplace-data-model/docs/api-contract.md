# Task 1 API Contract

## POST /api/v1/companies
Register a company.

Request body:
- name: string
- email: string
- phone: string

Response 201:
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Acme Corp",
    "email": "hr@acme.com",
    "phone": "+911234567890",
    "kyc_status": "pending",
    "created_at": "..."
  }
}

Errors:
- 409 DUPLICATE_COMPANY
- 422 VALIDATION_ERROR

## GET /api/v1/companies/:id
Retrieve company profile.

Response 200:
{
  "success": true,
  "data": { ... }
}

Errors:
- 404 COMPANY_NOT_FOUND

## PATCH /api/v1/companies/:id/kyc
Submit or update KYC.

Request body:
- doc_type: string
- storage_url: url

Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "company_id": "uuid",
    "doc_type": "gst",
    "url": "https://...",
    "status": "submitted",
    "created_at": "...",
    "updated_at": "..."
  }
}

## GET /api/v1/companies/:id/kyc
Get KYC status.

Response 200:
{
  "success": true,
  "data": {
    "company_id": "uuid",
    "status": "submitted"
  }
}
