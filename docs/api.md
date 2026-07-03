# API Reference

Base URL: `http://localhost:8000/api/v1`

## Authentication

All endpoints except `/auth/*` require a Bearer token.

```
Authorization: Bearer <token>
```

## Endpoints

| Method | Path                   | Description           |
|--------|------------------------|-----------------------|
| POST   | /auth/login            | Login                 |
| POST   | /auth/register         | Register              |
| GET    | /users/me              | Current user          |
| GET    | /agents                | List agents           |
| POST   | /stress-test           | Run stress test       |
| GET    | /stress-test/:id       | Get test status       |
| POST   | /personas              | Create persona        |
| GET    | /reports               | List reports          |
| POST   | /reports/generate      | Generate report       |
| GET    | /analytics/dashboard   | Dashboard metrics     |
| GET    | /health                | Health check          |
| WS     | /ws/:test_id           | Real-time updates     |

## Schema

All requests/responses use JSON. See `backend/app/schemas/` for full type definitions.
