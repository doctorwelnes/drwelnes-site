#!/usr/bin/env bash
# Auto-deployment script triggered by GitHub Action
# Test: verifying cron-based auto-deployment
set -euo pipefail

PROJECT_DIR="/var/www/dr-welnes"

cd "$PROJECT_DIR"

# Use the single source of truth deployment helper.
bash deploy/timeweb-cloud/deploy.sh
