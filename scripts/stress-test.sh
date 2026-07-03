#!/usr/bin/env bash
set -euo pipefail

API_URL=${API_URL:-http://localhost:8000/api/v1}
TOKEN=${TOKEN:-}

curl -s -X POST "$API_URL/stress-test/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"persona_ids": [1, 2, 3], "scenario_id": 1}' | jq .
