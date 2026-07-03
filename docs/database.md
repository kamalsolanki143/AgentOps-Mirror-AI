# Database

## PostgreSQL

Main relational store for users, projects, tests, and reports.

### Key Tables

- `users` – Authentication and profile
- `personas` – Simulated user profiles
- `scenarios` – Test scenario definitions
- `stress_tests` – Test run metadata
- `transcripts` – Individual conversation records
- `audit_results` – Per-dimension scoring
- `reports` – Generated report artifacts

## Redis

Used for:
- Celery task queue (simulation jobs)
- WebSocket pub/sub for real-time updates
- Rate limiting and session cache
