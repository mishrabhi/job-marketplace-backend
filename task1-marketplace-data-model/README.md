# Task 1: Marketplace Data Model

## Purpose
Build the core marketplace data model:
- Companies
- Students
- Skills
- KYC submissions

## Structure

- `.env` / `.env.example`
- `.gitignore`
- `app.js`
- `server.js`
- `package.json`
- `package-lock.json`
- `jest.config.cjs`
- `scripts/migrate.js`
- `migrations/001_create_companies.sql`
- `migrations/002_create_students.sql`
- `migrations/003_create_skills.sql`
- `migrations/004_create_kyc.sql`
- `docs/api-contract.md`

## Run

```bash
cd task1-marketplace-data-model
npm install
npm run migrate
npm run dev
```

## Tests

```bash
npm test
```

## Notes

This task defines the initial database schema and API surface for handling companies, students, skills, and KYC workflows.
