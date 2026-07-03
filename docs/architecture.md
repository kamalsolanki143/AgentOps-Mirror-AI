# Architecture

## Overview

AgentOps Mirror AI follows a microservices architecture with four main services:

1. **Frontend** – Next.js SPA with Tailwind CSS
2. **Backend** – FastAPI REST + WebSocket server
3. **AI Workers** – LangChain-based agent workers (async)
4. **Audit Engine** – Scoring and evaluation pipeline

## Data Flow

```
User → Frontend → API Gateway → Backend → Queue (Redis)
                                           ├── AI Workers (simulation)
                                           └── Audit Workers (scoring)
                                               ↓
                                           Database → Frontend (realtime via WS)
```

## Communication

- **REST**: Frontend ↔ Backend
- **WebSocket**: Backend ↔ Frontend (real-time updates)
- **Redis Pub/Sub**: Backend ↔ Workers
- **Celery**: Async task queue for long-running jobs
