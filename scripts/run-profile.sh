#!/usr/bin/env bash
# Bring a domain profile's stack up/down. ONE profile at a time (the base compose
# pins container names + host port 3000 — see profiles/README.md).
#
#   scripts/run-profile.sh novel            # up (default action)
#   scripts/run-profile.sh research up
#   scripts/run-profile.sh novel down
#   scripts/run-profile.sh research logs
#
set -euo pipefail

PROFILE="${1:-}"
ACTION="${2:-up}"
case "$PROFILE" in
  research|novel) ;;
  *) echo "usage: $0 {research|novel} [up|down|logs]"; exit 2 ;;
esac

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ENV_FILE="profiles/$PROFILE/.env.$PROFILE"
if [ ! -f "$ENV_FILE" ]; then
  echo "✗ $ENV_FILE not found. Copy the template and edit it:"
  echo "    cp $ENV_FILE.example $ENV_FILE"
  exit 1
fi

# Load shared secrets first (repo-root .env), then the profile's overrides.
set -a
# shellcheck disable=SC1091
[ -f .env ] && . ./.env
# shellcheck disable=SC1090
. "$ENV_FILE"
set +a

# Absolute host path of the domain prompt overlay (compose binds it read-only).
export ROBOCO_PROMPTS_OVERLAY_HOST="$ROOT/profiles/$PROFILE/prompts"

COMPOSE=(docker compose
  -f docker-compose.yaml
  -f profiles/compose.profile.yml
  -p "roboco-$PROFILE")

case "$ACTION" in
  up)
    "${COMPOSE[@]}" up -d
    # POSTGRES_DB only auto-creates the domain DB on a fresh volume; ensure it
    # exists for an already-initialised one.
    "${COMPOSE[@]}" exec -T postgres sh -lc \
      "psql -U \"\${POSTGRES_USER:-roboco}\" -tc \
        \"SELECT 1 FROM pg_database WHERE datname='${ROBOCO_DATABASE_NAME}'\" \
        | grep -q 1 || createdb -U \"\${POSTGRES_USER:-roboco}\" '${ROBOCO_DATABASE_NAME}'" \
      2>/dev/null || true
    echo "✓ roboco-$PROFILE up"
    echo "  db=$ROBOCO_DATABASE_NAME  data=$ROBOCO_DATA_DIR  prompts=$ROBOCO_PROMPTS_OVERLAY_HOST"
    echo "  panel: http://localhost:3000"
    ;;
  down)  "${COMPOSE[@]}" down ;;
  logs)  "${COMPOSE[@]}" logs -f --tail=120 ;;
  *) echo "unknown action: $ACTION (use up|down|logs)"; exit 2 ;;
esac
