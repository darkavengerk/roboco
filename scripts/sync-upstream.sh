#!/usr/bin/env bash
# Keep the fork current with upstream.
#
# Strategy: `master` stays a CLEAN MIRROR of upstream/master (fast-forward only),
# so it can never conflict. Your domain work lives on a feature branch that is
# rebased on top of the refreshed master.
#
#   scripts/sync-upstream.sh [branch]      # default branch: feature/domain-profiles
#
set -euo pipefail

BRANCH="${1:-feature/domain-profiles}"

echo "==> fetching upstream"
git fetch upstream --tags --prune

echo "==> fast-forwarding master to upstream/master"
git checkout master
if ! git merge --ff-only upstream/master; then
  echo "✗ master is not a clean mirror (it has local commits). Move them to a"
  echo "  branch and reset master:  git branch -m master mywork && \\"
  echo "                            git checkout -B master upstream/master"
  exit 1
fi
git push origin master 2>/dev/null || echo "  (skipped push to origin master — is origin your fork yet? run setup-fork.sh)"

echo "==> rebasing '$BRANCH' on the refreshed master"
git checkout "$BRANCH"
if git rebase master; then
  echo "✓ '$BRANCH' rebased cleanly on upstream/master."
  echo "  push with:  git push --force-with-lease origin $BRANCH"
else
  echo "✗ rebase hit conflicts. Resolve, then:"
  echo "    git add -A && git rebase --continue"
  echo "  (the only files that can conflict are the ones you changed in-tree —"
  echo "   keep domain content under profiles/ to avoid this entirely.)"
  exit 1
fi
