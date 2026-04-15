#!/usr/bin/env bash
# Auto-deployment script triggered by GitHub Action
set -euo pipefail

PROJECT_DIR="/var/www/dr-welnes"

cd "$PROJECT_DIR"

# Use the single source of truth deployment helper.
bash deploy/timeweb-cloud/deploy.sh
