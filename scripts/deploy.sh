#!/usr/bin/env bash
set -euo pipefail

ENV=${1:-production}

echo "Deploying to $ENV..."

if [ "$ENV" = "production" ]; then
    docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
else
    docker compose up -d
fi

echo "Deploy complete!"
