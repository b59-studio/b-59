/**
 * Client-side Sentry initialization: unhandled browser exceptions only, per
 * docs/adr/0001-telemetry-decision.md — no replay, no tracing, no PII.
 * With no DSN configured the SDK is disabled and nothing loads or sends.
 *
 * NEXT_PUBLIC_* values are inlined at build time; changing them requires a
 * redeploy, not just an environment update.
 */

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  sendDefaultPii: false,
});

// Inert while tracing stays off; exported so the SDK stops asking for it on
// every build.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
