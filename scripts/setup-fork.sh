#!/usr/bin/env bash
# Re-point git remotes for the fork-maintenance workflow.
#
#   origin   -> YOUR fork      (push your work here)
#   upstream -> rennf93/roboco (pull updates from here)
#
# Run ONCE, AFTER you have forked rennf93/roboco to your own account on GitHub.
#
#   scripts/setup-fork.sh git@github.com:<your-user>/roboco.git
#
set -euo pipefail

FORK_URL="${1:-}"
if [ -z "$FORK_URL" ]; then
  echo "usage: $0 git@github.com:<your-user>/roboco.git"
  echo "       (fork rennf93/roboco on GitHub first, then pass your fork's URL)"
  exit 2
fi

UPSTREAM_URL="git@github.com:rennf93/roboco.git"

git remote set-url upstream "$UPSTREAM_URL" 2>/dev/null || git remote add upstream "$UPSTREAM_URL"
git remote set-url origin "$FORK_URL"
# Guard: never accidentally push to upstream (the original repo).
git remote set-url --push upstream DISABLED.no-push 2>/dev/null || true

echo "---"
git remote -v
echo "---"
echo "✓ origin   = $FORK_URL   (your fork — push here)"
echo "✓ upstream = $UPSTREAM_URL   (original — pull here, push disabled)"
echo
echo "Next: keep current with  scripts/sync-upstream.sh"
