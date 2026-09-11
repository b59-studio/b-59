#!/usr/bin/env bash
# install-hooks.sh — wire this repo's pre-push hook. Run once per clone.
#
#   bash scripts/install-hooks.sh
#
# The hook itself is three lines of plumbing: git hands it the refs being
# pushed on stdin, it works out what the branch adds on top of main, and hands
# that range to scripts/changelog-date-guard. The logic stays in the tracked
# script so it is reviewable, testable and shared; .git/hooks is never
# committed and would otherwise exist only on the machine that wrote it.
#
# The privacy hooks (pre-commit, commit-msg) come from the shared setup
# elsewhere and are untouched by this script.

set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
hooks_dir="$(git rev-parse --path-format=absolute --git-path hooks)"
target="$hooks_dir/pre-push"
marker="changelog-date-guard"

if [ -e "$target" ] && ! grep -q "$marker" "$target"; then
  echo "✗ $target already exists and is not ours."
  echo "  Not overwriting it. Add this line to it by hand instead:"
  echo ""
  echo '    exec "$(git rev-parse --show-toplevel)"/scripts/pre-push-checks'
  exit 1
fi

cat > "$target" <<'HOOK'
#!/usr/bin/env bash
# pre-push — installed by scripts/install-hooks.sh. Do not edit here; edit
# scripts/pre-push-checks, which this delegates to, and re-run the installer.
exec "$(git rev-parse --show-toplevel)"/scripts/pre-push-checks "$@"
HOOK
chmod +x "$target"

echo "✓ pre-push installed ($target)"
echo "  It runs: scripts/pre-push-checks → scripts/changelog-date-guard"
echo "  Verify with: bash scripts/install-hooks.sh --verify"

if [ "${1:-}" = "--verify" ]; then
  printf 'refs/heads/main %s refs/heads/main %s\n' \
    "$(git rev-parse HEAD)" "$(git rev-parse HEAD)" | "$target"
  echo "✓ hook runs"
fi

cd "$repo_root" >/dev/null
