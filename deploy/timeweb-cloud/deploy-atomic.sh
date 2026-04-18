#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
APP_NAME="dr-welnes"
BUILD_ROOT="${BUILD_ROOT:-/tmp/dr-welnes-builds}"
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
  if [ -d "$BUILD_RELEASE_DIR" ]; then
    rm -rf "$BUILD_RELEASE_DIR"
  fi
}

cleanup_old_builds() {
  if [ ! -d "$BUILD_ROOT" ]; then
    return
  fi
  log "Cleaning old build directories from $BUILD_ROOT"
  # Remove all previous staging build directories before creating a new one.
  # These are temporary deploy artifacts and should not accumulate between deploys.
  find "$BUILD_ROOT" -mindepth 1 -maxdepth 1 -exec rm -rf {} + 2>/dev/null || true
}

cleanup_old_releases() {
  if [ ! -d "$RELEASES_DIR" ]; then
    return
  fi
  log "Cleaning old releases (keeping last 5)"
  # Keep only the 5 most recent releases
  ls -t "$RELEASES_DIR" | tail -n +6 | while read -r release; do
    rm -rf "$RELEASES_DIR/$release"
  done
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

# Clean up old build directories before starting new build
cleanup_old_builds

GIT_SHA="$(git -C "$PROJECT_ROOT" rev-parse --short HEAD)"
RELEASE_ID="$(date -u +%Y%m%d%H%M%S)-${GIT_SHA}"
FINAL_RELEASE_DIR="$RELEASES_DIR/$RELEASE_ID"
BUILD_RELEASE_DIR="$BUILD_ROOT/$RELEASE_ID"
STANDALONE_DIR="$BUILD_RELEASE_DIR/.next/standalone"
STANDALONE_PUBLIC="$STANDALONE_DIR/public"
STANDALONE_STATIC_DIR="$STANDALONE_DIR/.next/static"

if [ -e "$BUILD_RELEASE_DIR" ]; then
  rm -rf "$BUILD_RELEASE_DIR"
fi

trap cleanup_staging EXIT

log "Preparing build directory $BUILD_RELEASE_DIR"
mkdir -p "$BUILD_RELEASE_DIR"
rsync -a --delete \
  --exclude '.git/' \
  --exclude 'node_modules/' \
  --exclude '.next/' \
  --exclude 'releases/' \
  --exclude 'shared/' \
  --exclude 'current' \
  --exclude '.env.production' \
  --exclude 'public/uploads/' \
  "$PROJECT_ROOT"/ "$BUILD_RELEASE_DIR"/

mkdir -p "$BUILD_RELEASE_DIR/public"
rm -rf "$BUILD_RELEASE_DIR/public/uploads"
ln -sfn "$SHARED_UPLOADS_DIR" "$BUILD_RELEASE_DIR/public/uploads"
ln -sfn "$ENV_FILE" "$BUILD_RELEASE_DIR/.env.production"

log "Loading environment variables"
set -a
. "$ENV_FILE"
set +a

cd "$BUILD_RELEASE_DIR"

log "Installing dependencies"
if ! npm install --include=dev --legacy-peer-deps; then
  log "npm install failed — cleaning node_modules and retrying"
  rm -rf "$BUILD_RELEASE_DIR/node_modules"
  npm install --include=dev --legacy-peer-deps
fi

log "Generating Prisma client"
npx prisma generate

log "Applying Prisma migrations"
npx prisma migrate deploy

log "Clearing previous build artifacts"
rm -rf "$BUILD_RELEASE_DIR/.next"
rm -rf "$BUILD_RELEASE_DIR/node_modules/.cache"

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
cp -R "$BUILD_RELEASE_DIR/.next/static/." "$STANDALONE_STATIC_DIR/"

PREVIOUS_RELEASE=""
if [ -L "$CURRENT_LINK" ] || [ -e "$CURRENT_LINK" ]; then
  PREVIOUS_RELEASE="$(readlink -f "$CURRENT_LINK" || true)"
fi

log "Publishing runtime assets"
rm -rf "$FINAL_RELEASE_DIR"
mkdir -p "$FINAL_RELEASE_DIR/.next/standalone" "$FINAL_RELEASE_DIR/.next/static" "$FINAL_RELEASE_DIR/public"
rsync -a --delete "$BUILD_RELEASE_DIR/.next/standalone/" "$FINAL_RELEASE_DIR/.next/standalone/"
rsync -a --delete "$BUILD_RELEASE_DIR/.next/static/" "$FINAL_RELEASE_DIR/.next/static/"
rsync -a --delete "$BUILD_RELEASE_DIR/public/" "$FINAL_RELEASE_DIR/public/"
rm -rf "$FINAL_RELEASE_DIR/public/uploads"
ln -sfn "$SHARED_UPLOADS_DIR" "$FINAL_RELEASE_DIR/public/uploads"

log "Switching current release atomically"
ln -sfn "$FINAL_RELEASE_DIR" "$CURRENT_LINK"
trap - EXIT

log "Starting or reloading PM2 process"
pm2 startOrReload "$PROJECT_ROOT/deploy/timeweb-cloud/ecosystem.config.cjs" --only "$APP_NAME" --env production

log "Waiting for server to start listening on port 3000"
MAX_WAIT=30
WAITED=0
while [ $WAITED -lt $MAX_WAIT ]; do
  if ss -ltnp 2>/dev/null | grep -q ":3000"; then
    break
  fi
  sleep 1
  WAITED=$((WAITED + 1))
done

if [ $WAITED -eq $MAX_WAIT ]; then
  echo "Server did not start listening on port 3000 within ${MAX_WAIT}s" >&2
  rollback_to_previous_release "$PREVIOUS_RELEASE"
fi

log "Running healthcheck"
if ! curl -fsS --max-time 10 --retry 10 --retry-delay 3 --retry-all-errors "$HEALTHCHECK_URL" >/dev/null; then
  echo "Healthcheck failed for $HEALTHCHECK_URL" >&2
  rollback_to_previous_release "$PREVIOUS_RELEASE"
fi

# Clean up old releases after successful deployment
cleanup_old_releases

pm2 save

log "Deployment complete"
pm2 status "$APP_NAME" || true
