#!/usr/bin/env bash
# install-hooks.sh — wire this repo's pre-push hook. Run once per clone.
#
#   bash scripts/install-hooks.sh
#
# The hook itself is plumbing: git hands it the refs being pushed on stdin, it
# works out what the branch adds on top of main, and hands that range to
# scripts/changelog-date-guard. The logic stays in the tracked script so it is
# reviewable, testable and shared; .git/hooks is never committed and would
# otherwise exist only on the machine that wrote it.
#
# That split is also why the hook checks the script is there before running it.
# .git/hooks is CHECKOUT-scoped and scripts/ is BRANCH-scoped, so the two have
# different lifetimes: check out a branch cut before these scripts existed and
# the hook is still installed while its script is gone. An unconditional exec
# fails the push outright, with an error naming a path that branch has never
# heard of. The hook is the half that has to cope.
#
# The privacy hooks (pre-commit, commit-msg) come from the shared setup
# elsewhere and are untouched by this script.

set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
hooks_dir="$(git rev-parse --path-format=absolute --git-path hooks)"
target="$hooks_dir/pre-push"
marker="scripts/pre-push-checks"

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
#
# Absent on a branch cut before it existed, in which case there is nothing to
# run and the push is not this hook's to refuse.
checks="$(git rev-parse --show-toplevel)/scripts/pre-push-checks"
[ -x "$checks" ] || exit 0
exec "$checks" "$@"
HOOK
chmod +x "$target"

echo "✓ pre-push installed ($target)"
echo "  It runs: scripts/pre-push-checks → scripts/changelog-date-guard"
echo "  Verify with: bash scripts/install-hooks.sh --verify"

if [ "${1:-}" = "--verify" ]; then
  printf 'refs/heads/main %s refs/heads/main %s\n' \
    "$(git rev-parse HEAD)" "$(git rev-parse HEAD)" | "$target"
  # Say which of the two outcomes this was. "The hook ran" is true even when it
  # stepped aside because the checks are not on this branch, and reporting that
  # as a pass would be the installer confirming a guard that is not guarding.
  if [ -x "$repo_root/scripts/pre-push-checks" ]; then
    echo "✓ hook runs, checks ran"
  else
    echo "✓ hook runs, but scripts/pre-push-checks is not on this branch —"
    echo "  it steps aside here. Check out a branch that has it to verify the checks."
  fi
fi

cd "$repo_root" >/dev/null
