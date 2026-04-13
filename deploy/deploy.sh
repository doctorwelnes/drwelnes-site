#!/usr/bin/env bash
# Auto-deployment script triggered by GitHub Action
set -euo pipefail

PROJECT_DIR="/var/www/dr-welnes"

cd "$PROJECT_DIR"

# sync repository
git fetch origin
git reset --hard origin/master

# install deps and build
pnpm install
pnpm prisma generate
pnpm build

# run timeweb helper and restart pm2
deploy/timeweb-cloud/deploy.sh
pm2 restart dr-welnes
pm2 save
