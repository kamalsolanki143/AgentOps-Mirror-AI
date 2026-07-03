#!/usr/bin/env bash
set -euo pipefail

echo "Setting up AgentOps Mirror AI..."

cp -n .env.example .env || true

cd frontend && npm install && cd ..
cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt && cd ..

echo "Setup complete!"
