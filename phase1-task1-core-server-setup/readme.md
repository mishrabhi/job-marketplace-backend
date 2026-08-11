# Task 1 — System Ingestion & Core Server Setup

Node.js starter server for PlaceMux Phase 1 Industry Immersion [source: 13].

## 🚀 How to Run

1. **Install dependencies:**
   ```bash
   npm install
   ```
Configure environment:
```
cp .env.example .env
```

Start in development mode:
```
npm run dev
```

Verify Health Route:
```
curl http://localhost:3000/health
```


Verify Sample Route:
```
curl http://localhost:3000/api/v1/sample/welcome
```