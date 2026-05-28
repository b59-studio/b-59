# Contributing

We're not actively seeking external contributions to this repo, but we welcome forks and references.

## If you do fork or modify

- Create a feature branch per change.
- Run `pnpm lint` and `pnpm build` before committing. Both must pass.
- Commit messages: imperative voice ("Add feature X", "Fix bug Y"). Explain the *why*, not just the what.
- No AI tool mentions in commits, code, or PRs.

## Reporting issues

Use [GitHub Issues](https://github.com/b59-studio/b-59/issues). Include:

- Browser and OS
- Steps to reproduce
- Expected vs. actual behavior

## Code style

- ESLint config is enforced — run `pnpm lint` to check.
- TypeScript strict mode is on; no `any` without a comment explaining why.
- Tailwind utility classes only. Custom CSS is a last resort; leave a comment if you add it.
