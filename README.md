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
NEXT_PUBLIC_SITE_URL=http://localhost:3000 pnpm dev
```

Site runs on [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Local development server |
| `pnpm build` | Production build |
| `pnpm start` | Serve production build |
| `pnpm lint` | ESLint |
| `pnpm test` | Unit tests (Jest) |

## Environment variables

- `NEXT_PUBLIC_SITE_URL` — canonical URL for metadata and sitemap (required).

## Project layout

| Path | Purpose |
| --- | --- |
| `src/app/` | Routes and global layout |
| `src/components/` | Shared UI (header, footer, theme) |
| `public/` | Static assets |

## Deployment

Deploy to Vercel with one click (free tier available). Set `NEXT_PUBLIC_SITE_URL` to your production domain in the Vercel environment variables panel.

## License

[MIT + Commons Clause](LICENSE). Free to use as a reference or for personal projects; not licensed for resale or commercial redistribution.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Contact

Questions or feedback? Email [contact@b-59.com](mailto:contact@b-59.com).
