#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
APP_NAME="dr-welnes"
STANDALONE_DIR="$ROOT_DIR/.next/standalone"
STANDALONE_PUBLIC="$STANDALONE_DIR/public"
STANDALONE_STATIC_DIR="$STANDALONE_DIR/.next/static"

log() {
  printf '\n[%s] %s\n' "$APP_NAME" "$1"
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Required command not found: $1" >&2
    exit 1
  fi
}

log "Checking prerequisites"
require_command node
require_command npm
require_command pm2

if [ ! -f "$ROOT_DIR/.env.production" ]; then
  echo "Missing .env.production at project root." >&2
  echo "Copy deploy/timeweb-cloud/env.production.example to .env.production and fill the values." >&2
  exit 1
fi

cd "$ROOT_DIR"

log "Installing dependencies"
npm ci --include=dev --legacy-peer-deps

log "Loading environment variables"
set -a
. "$ROOT_DIR/.env.production"
set +a

log "Generating Prisma client"
npx prisma generate

log "Applying Prisma migrations"
npx prisma migrate deploy

log "Clearing previous build artifacts"
rm -rf "$ROOT_DIR/.next"
# Also clean any Next.js cache in node_modules
rm -rf "$ROOT_DIR/node_modules/.cache"

log "Building the application"
npm run build

if [ ! -f "$STANDALONE_DIR/server.js" ]; then
  echo "Standalone build not found at $STANDALONE_DIR/server.js" >&2
  exit 1
fi

log "Preparing standalone assets"
rm -rf "$STANDALONE_PUBLIC" "$STANDALONE_STATIC_DIR"
mkdir -p "$STANDALONE_DIR" "$STANDALONE_STATIC_DIR"
ln -s "$ROOT_DIR/public" "$STANDALONE_PUBLIC"
cp -R "$ROOT_DIR/.next/static/." "$STANDALONE_STATIC_DIR/"

log "Starting or reloading PM2 process"
pm2 startOrReload "$ROOT_DIR/deploy/timeweb-cloud/ecosystem.config.cjs" --only "$APP_NAME" --env production
pm2 save

log "Deployment complete"
pm2 status "$APP_NAME" || true
