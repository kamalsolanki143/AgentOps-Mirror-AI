#!/usr/bin/env bash
set -euo pipefail

echo "Cleaning up..."

find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
find . -type d -name node_modules -exec rm -rf {} + 2>/dev/null || true
find . -type d -name .next -exec rm -rf {} + 2>/dev/null || true
find . -name "*.pyc" -delete 2>/dev/null || true

echo "Cleanup complete!"
