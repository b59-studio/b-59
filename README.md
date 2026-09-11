# B-59

B-59 Studio — human-centered design and civic technology. This is our marketing site, built with Next.js.

This repo is public for transparency and for others to learn from. You're welcome to use it as a reference.

[![License: MIT + Commons Clause](https://img.shields.io/badge/license-MIT%20%2B%20Commons%20Clause-blue)](LICENSE)

## Quick start

**Prerequisites:** Node.js 20+, [pnpm](https://pnpm.io/) 9+

```bash
git clone https://github.com/b59-studio/b-59.git
cd b-59
pnpm install
bash scripts/install-hooks.sh
NEXT_PUBLIC_SITE_URL=http://localhost:3000 pnpm dev
```

Site runs on [http://localhost:3000](http://localhost:3000).

`install-hooks.sh` wires the pre-push hook. Git hooks are not part of a clone,
so this is once per checkout — see [Changelog dates](#changelog-dates).

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Local development server |
| `pnpm build` | Production build |
| `pnpm start` | Serve production build |
| `pnpm lint` | ESLint |
| `pnpm test` | Unit tests (Jest) |
| `bash scripts/install-hooks.sh` | Wire the pre-push hook (once per clone) |

## Changelog dates

The site is continuously deployed, so a `## YYYY-MM-DD` heading in
[CHANGELOG.md](CHANGELOG.md) is a claim about the day a change went live. An
entry filed under the wrong day is invisible in review — the addition is clean
and only the heading above it changed — so the pre-push hook checks it:

**A dated heading your branch adds, and anything you add under one, must name
today.** `## [Unreleased]` is always allowed, and a push that leaves the
changelog alone is never inspected.

If your branch sits open past midnight, the next push asks you to re-date it.
That is the check working: the heading is meant to name the day the change
actually ships. To correct notes that already shipped — a typo in an old entry,
or re-dating one that was filed wrong:

```bash
CHANGELOG_DATE_GUARD=off git push
```

The logic lives in `scripts/changelog-date-guard` (run it with `--help`), and
is covered by `scripts/changelog-date-guard.test.ts` in the normal test run.
It cannot catch a branch dated today that merges tomorrow without another push;
nothing at push time knows the merge date.

## Environment variables

- `NEXT_PUBLIC_SITE_URL` — canonical URL for metadata and sitemap (required).

## Project layout

| Path | Purpose |
| --- | --- |
| `src/app/` | Routes and global layout |
| `src/components/` | Shared UI (header, footer, theme) |
| `public/` | Static assets |
| `scripts/` | Repo tooling (the pre-push guard and its installer) |

## Deployment

Deploy to Vercel with one click (free tier available). Set `NEXT_PUBLIC_SITE_URL` to your production domain in the Vercel environment variables panel.

## License

[MIT + Commons Clause](LICENSE). Free to use as a reference or for personal projects; not licensed for resale or commercial redistribution.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Contact

Questions or feedback? Email [contact@b-59.com](mailto:contact@b-59.com).
