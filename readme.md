# PlaceMux Backend

A skill-gated job marketplace backend split into five sequential Node/Express tasks.
Each task is a standalone app that builds toward the final integrated marketplace.

## Project Structure

- `task1-marketplace-data-model/` — company, student, skill, KYC models and data layer
- `task2-job-posting/` — job posting, skill thresholds, assessment link generation
- `task3-search-discovery/` — job search, discovery feed, ranking and search indexes
- `task4-applications-shortlisting/` — student applications, idempotency, shortlist/reject workflow
- `task5-marketplace-integration/` — full integration of all prior tasks into one consolidated app

## How to Use

Each task folder is self-contained. Run the following inside any task directory:

```bash
cd taskX-task-name
npm install
npm run migrate
npm run dev
```

For tests:

```bash
npm test
```

## Documentation

Each task includes API documentation at `docs/api-contract.md`.
Task 5 also includes a live demo script at `docs/demo-script.md`.

## Notes

- All apps use ES modules.
- Environment variables are defined in each task’s `.env.example` file.
- Task 5 contains the full final marketplace integration and should be treated as the consolidated backend.
