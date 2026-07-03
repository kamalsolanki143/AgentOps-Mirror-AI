# AgentOps Mirror AI

**AgentOps Mirror AI** is a comprehensive platform for stress-testing, auditing, and optimizing AI agent systems. It simulates realistic user personas, detects vulnerabilities (hallucinations, prompt leaks, jailbreaks), evaluates business goals, and generates actionable reports.

## Features

- **Persona-Based Simulation** – Generate diverse user personas and run conversational simulations at scale.
- **AI stress Testing** – Concurrent async runners for high-throughput agent interaction testing.
- **Audit Engine** – Multi-dimensional scoring: security, latency, quality, policy compliance, business goal alignment.
- **Vulnerability Detection** – Hallucination, prompt leak, and jailbreak detection out of the box.
- **Prompt Optimization** – Automatic prompt refinement based on simulation outcomes.
- **Regression Testing** – Compare agent behavior across prompt/config versions.
- **Rich Reporting** – PDF, dashboard, and webhook-delivered reports.
- **Integrations** – GitHub, Jira, Slack, Teams, Email, Webhook.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  Frontend   │────▶│   Backend    │────▶│      AI      │
│  (Next.js)  │     │  (FastAPI)   │     │   (Agents)   │
└─────────────┘     └──────┬───────┘     └──────┬───────┘
                           │                     │
                    ┌──────▼───────┐     ┌──────▼───────┐
                    │  Simulation  │     │  Audit       │
                    │   Engine     │     │  Engine      │
                    └──────────────┘     └──────────────┘
```

## Getting Started

```bash
git clone https://github.com/kamalsolanki143/AgentOps-Mirror-AI.git
cd AgentOps-Mirror-AI
cp .env.example .env
make setup
make dev
```

## Tech Stack

| Layer       | Technology                     |
|-------------|--------------------------------|
| Frontend    | Next.js, Tailwind CSS, Zustand |
| Backend     | FastAPI, SQLAlchemy, Celery    |
| AI/Agents   | LangChain, OpenAI, Custom LLMs |
| Database    | PostgreSQL, Redis              |
| Monitoring  | Prometheus, Grafana, Loki      |
| Deployment  | Docker, Kubernetes, Vercel     |

## License

MIT License – see [LICENSE](LICENSE).
