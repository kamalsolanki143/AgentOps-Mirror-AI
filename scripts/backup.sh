#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

docker compose exec -T postgres pg_dump -U postgres agentops > "$BACKUP_DIR/database.sql"
echo "Backup saved to $BACKUP_DIR"
