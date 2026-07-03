# Demo Script

## 1. Setup

```bash
make setup
make dev
```

## 2. Create a Stress Test

1. Open `http://localhost:3000`
2. Register an account
3. Go to "Stress Test" → "New Test"
4. Select 3+ personas and 2 scenarios
5. Click "Run"

## 3. View Results

1. Watch real-time updates on the dashboard
2. Open the audit report for detailed scoring
3. Replay individual conversations
4. Export report as PDF

## 4. Run via CLI

```bash
curl -X POST http://localhost:8000/api/v1/stress-test \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"persona_ids": [1,2,3], "scenario_id": 1}'
```
