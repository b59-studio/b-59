import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Pin the workspace root to this checkout. Next otherwise infers it from the
  // nearest lockfile, which in a linked worktree under .claude/worktrees/ is the
  // primary checkout — the dev server then watches and caches the wrong tree.
  turbopack: { root: process.cwd() },
};

// Source-map upload runs only when SENTRY_AUTH_TOKEN is present (CI); local
// builds without Sentry environment print a notice and build normally.
export default withSentryConfig(withNextIntl(nextConfig), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  telemetry: false,
});
