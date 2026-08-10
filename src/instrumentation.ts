/**
 * Server-side Sentry initialization (Next.js instrumentation hook).
 *
 * Error reporting per docs/adr/0001-telemetry-decision.md: the donate API
 * routes add explicit captures; onRequestError picks up anything unhandled.
 * With no DSN configured the SDK is disabled and every capture is a no-op,
 * so local and preview builds work without any Sentry environment.
 */

import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      enabled: Boolean(process.env.SENTRY_DSN),
      environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
      release: process.env.VERCEL_GIT_COMMIT_SHA,
      // Keep headers, cookies, and IPs out of events (the ADR's no-PII posture).
      sendDefaultPii: false,
    });
  }
}

export const onRequestError = Sentry.captureRequestError;
