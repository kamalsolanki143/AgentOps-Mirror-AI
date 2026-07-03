.PHONY: setup dev build lint test clean deploy backup

# ─── Setup ───────────────────────────────────────────
setup:
	@echo "Setting up project..."
	cp -n .env.example .env || true
	cd frontend && npm install
	cd backend && python -m venv venv && . venv/bin/activate && pip install -r requirements.txt

dev:
	docker compose up -d postgres redis
	cd backend && uvicorn app.main:app --reload --port 8000 &
	cd frontend && npm run dev &
	wait

# ─── Build ───────────────────────────────────────────
build:
	docker compose build

# ─── Lint & Test ─────────────────────────────────────
lint:
	cd frontend && npm run lint
	cd backend && ruff check .

test:
	cd frontend && npm run test
	cd backend && pytest
	cd ai && pytest
	cd audit-engine && pytest

# ─── Clean ───────────────────────────────────────────
clean:
	rm -rf frontend/node_modules frontend/.next
	rm -rf backend/venv backend/__pycache__
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true

# ─── Deploy ──────────────────────────────────────────
deploy:
	@echo "Running deployment scripts..."
	./scripts/deploy.sh

backup:
	@echo "Running backup..."
	./scripts/backup.sh
