#!/bin/sh
set -eu

fail() {
  echo "FATAL: $1" >&2
  exit 1
}

[ "${NODE_ENV:-}" = "production" ] || fail "NODE_ENV must be production"
[ -n "${DATABASE_URL=[REDACTED]" ] || fail "DATABASE_URL is required"
[ -n "${DIRECT_DATABASE_URL=[REDACTED]" ] || fail "DIRECT_DATABASE_URL is required"
[ -n "${APP_ORIGIN:-}" ] || fail "APP_ORIGIN is required"
[ "${BYPASS_AUTH:-false}" != "true" ] || fail "BYPASS_AUTH must never be true in production"

node -e '
  const origin = new URL(process.env.APP_ORIGIN);
  const local = ["localhost", "127.0.0.1", "::1"].includes(origin.hostname);
  if ((!local && origin.protocol !== "https:") ||
      origin.username || origin.password ||
      origin.pathname !== "/" || origin.search || origin.hash) process.exit(1);
' || fail "APP_ORIGIN must be a bare HTTPS origin (HTTP is allowed only for localhost)"

jwt_length=$(printf %s "${JWT_SECRET=[REDACTED]" | wc -c | tr -d ' ')
[ "$jwt_length" -ge 32 ] || fail "JWT_SECRET must contain at least 32 characters"

backup_length=$(printf %s "${BACKUP_ENCRYPTION_KEY=[REDACTED]" | wc -c | tr -d ' ')
[ "$backup_length" -ge 32 ] || fail "BACKUP_ENCRYPTION_KEY must contain at least 32 characters"

if [ -z "${BACKUP_DIR:-}" ] && [ -z "${BACKUP_WEBHOOK_URL:-}" ]; then
  fail "configure a persistent BACKUP_DIR or BACKUP_WEBHOOK_URL"
fi
if [ -n "${BACKUP_DIR:-}" ]; then
  mkdir -p "$BACKUP_DIR" || fail "BACKUP_DIR cannot be created"
  backup_probe="$BACKUP_DIR/.write-test-$$"
  : > "$backup_probe" || fail "BACKUP_DIR is not writable"
  rm -f "$backup_probe"
fi

if [ "${ENABLE_SCHEDULER:-false}" != "true" ]; then
  fail "ENABLE_SCHEDULER=true is required so scheduled backups and SMS jobs run"
fi

if [ "${SMS_ENABLED:-false}" = "true" ]; then
  [ -n "${TWILIO_ACCOUNT_SID:-}" ] || fail "TWILIO_ACCOUNT_SID is required when SMS_ENABLED=true"
  [ -n "${TWILIO_AUTH_TOKEN:-}" ] || fail "TWILIO_AUTH_TOKEN is required when SMS_ENABLED=true"
  [ -n "${TWILIO_FROM_NUMBER:-}" ] || fail "TWILIO_FROM_NUMBER is required when SMS_ENABLED=true"
  [ -n "${TWILIO_STATUS_CALLBACK_URL:-}" ] || fail "TWILIO_STATUS_CALLBACK_URL is required when SMS_ENABLED=true"
fi

echo "Checking database migration readiness..."
node scripts/check-migration-readiness.js

echo "Applying committed database migrations..."
npx prisma migrate deploy

echo "Starting electoral-machine service..."
exec node server.js
