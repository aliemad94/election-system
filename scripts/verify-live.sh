#!/usr/bin/env bash
# 🤖 Live Environment Automated Security & Health Verifier (Bash Version)
# Usage: ./scripts/verify-live.sh <BASE_URL> [ADMIN_PASSWORD] [OBSERVER_PASSWORD]

TARGET_URL="${1:-${LIVE_URL:-http://localhost:3000}}"
node "$(dirname "$0")/verify-live.js" "$TARGET_URL" "$2" "$3"
