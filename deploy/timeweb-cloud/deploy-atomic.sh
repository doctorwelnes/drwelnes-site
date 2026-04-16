#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
APP_NAME="dr-welnes"
RELEASES_DIR="$PROJECT_ROOT/releases"
SHARED_DIR="$PROJECT_ROOT/shared"
SHARED_UPLOADS_DIR="$SHARED_DIR/public/uploads"
CURRENT_LINK="$PROJECT_ROOT/current"
ENV_FILE="$PROJECT_ROOT/.env.production"
HEALTHCHECK_URL="${HEALTHCHECK_URL:-http://127.0.0.1:3000/api/health}"

log() {
  printf '\n[%s] %s\n' "$APP_NAME" "$1"
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Required command not found: $1" >&2
    exit 1
  fi
}

rollback_to_previous_release() {
  local previous_release="$1"

  if [ -z "$previous_release" ] || [ ! -d "$previous_release" ]; then
    echo "No previous release available for rollback." >&2
    exit 1
  fi

  log "Rolling back to previous release: $previous_release"
  ln -sfn "$previous_release" "$CURRENT_LINK"
  pm2 startOrReload "$PROJECT_ROOT/deploy/timeweb-cloud/ecosystem.config.cjs" --only "$APP_NAME" --env production

  if ! curl -fsS --max-time 10 "$HEALTHCHECK_URL" >/dev/null; then
    echo "Rollback healthcheck failed after restoring $previous_release" >&2
    exit 1
  fi

  pm2 save
  log "Rollback completed successfully"
}

cleanup_staging() {
  if [ -d "$TMP_RELEASE_DIR" ]; then
    rm -rf "$TMP_RELEASE_DIR"
  fi
}

log "Checking prerequisites"
require_command curl
require_command git
require_command node
require_command npm
require_command pm2
require_command rsync

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing .env.production at project root." >&2
  echo "Copy deploy/timeweb-cloud/env.production.example to .env.production and fill the values." >&2
  exit 1
fi

mkdir -p "$RELEASES_DIR" "$SHARED_UPLOADS_DIR"

GIT_SHA="$(git -C "$PROJECT_ROOT" rev-parse --short HEAD)"
RELEASE_ID="$(date -u +%Y%m%d%H%M%S)-${GIT_SHA}"
RELEASE_DIR="$RELEASES_DIR/$RELEASE_ID"
TMP_RELEASE_DIR="$RELEASE_DIR.tmp"
STANDALONE_DIR="$TMP_RELEASE_DIR/.next/standalone"
STANDALONE_PUBLIC="$STANDALONE_DIR/public"
STANDALONE_STATIC_DIR="$STANDALONE_DIR/.next/static"

if [ -e "$TMP_RELEASE_DIR" ]; then
  rm -rf "$TMP_RELEASE_DIR"
fi

trap cleanup_staging EXIT

log "Preparing release directory $RELEASE_DIR"
mkdir -p "$TMP_RELEASE_DIR"
rsync -a --delete \
  --exclude '.git/' \
  --exclude 'node_modules/' \
  --exclude '.next/' \
  --exclude 'releases/' \
  --exclude 'shared/' \
  --exclude 'current' \
  --exclude '.env.production' \
  --exclude 'public/uploads/' \
  --exclude 'package-lock.json' \
  "$PROJECT_ROOT"/ "$TMP_RELEASE_DIR"/

mkdir -p "$TMP_RELEASE_DIR/public"
rm -rf "$TMP_RELEASE_DIR/public/uploads"
ln -sfn "$SHARED_UPLOADS_DIR" "$TMP_RELEASE_DIR/public/uploads"
ln -sfn "$ENV_FILE" "$TMP_RELEASE_DIR/.env.production"

log "Loading environment variables"
set -a
. "$ENV_FILE"
set +a

cd "$TMP_RELEASE_DIR"

log "Installing dependencies"
if ! npm ci --include=dev --legacy-peer-deps; then
  log "npm ci failed — cleaning node_modules and retrying"
  rm -rf "$TMP_RELEASE_DIR/node_modules"
  npm ci --include=dev --legacy-peer-deps
fi

log "Generating Prisma client"
npx prisma generate

log "Applying Prisma migrations"
npx prisma migrate deploy

log "Clearing previous build artifacts"
rm -rf "$TMP_RELEASE_DIR/.next"
rm -rf "$TMP_RELEASE_DIR/node_modules/.cache"

log "Building the application"
npm run build

if [ ! -f "$STANDALONE_DIR/server.js" ]; then
  echo "Standalone build not found at $STANDALONE_DIR/server.js" >&2
  exit 1
fi

log "Preparing standalone assets"
rm -rf "$STANDALONE_PUBLIC" "$STANDALONE_STATIC_DIR"
mkdir -p "$STANDALONE_DIR" "$STANDALONE_STATIC_DIR"
ln -sfn "../../public" "$STANDALONE_PUBLIC"
cp -R "$TMP_RELEASE_DIR/.next/static/." "$STANDALONE_STATIC_DIR/"

PREVIOUS_RELEASE=""
if [ -L "$CURRENT_LINK" ] || [ -e "$CURRENT_LINK" ]; then
  PREVIOUS_RELEASE="$(readlink -f "$CURRENT_LINK" || true)"
fi

log "Switching current release atomically"
rm -rf "$RELEASE_DIR"
mv "$TMP_RELEASE_DIR" "$RELEASE_DIR"
ln -sfn "$RELEASE_DIR" "$CURRENT_LINK"
trap - EXIT

log "Starting or reloading PM2 process"
pm2 startOrReload "$PROJECT_ROOT/deploy/timeweb-cloud/ecosystem.config.cjs" --only "$APP_NAME" --env production

log "Running healthcheck"
if ! curl -fsS --max-time 10 --retry 5 --retry-delay 2 --retry-all-errors "$HEALTHCHECK_URL" >/dev/null; then
  echo "Healthcheck failed for $HEALTHCHECK_URL" >&2
  rollback_to_previous_release "$PREVIOUS_RELEASE"
fi

pm2 save

log "Deployment complete"
pm2 status "$APP_NAME" || true
