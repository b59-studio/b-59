# ADR 0001: Telemetry decision

## Status

Accepted — merged 2026-08-10. The wiring (Sentry, the Plausible script,
the privacy-policy processor list) is in the codebase; events flow once
the vendor accounts exist and their keys land in Doppler.

**Section 3 (product analytics) was superseded on 2026-09-11 by
`0002-pageview-analytics-on-vercel.md`.** The Plausible site was never
created, so the script never loaded and the site went a month with no
pageview measurement; Vercel Analytics replaces it. Sections 1 and 2 —
crash reporting as not-applicable, and Sentry for error reporting —
stand as written.

Date: 2026-08-10

## Context

b-59 is the public marketing site for B-59 Studio: static Next.js pages
(studio, solutions, about) in two locales, plus one transactional
surface — the donation flow (`src/components/DonateForm.tsx` →
`/api/donate/checkout` → Stripe Checkout → `/api/donate/webhook`). The
client portal is a separate product (studio-portal) with its own record.

Telemetry today is accidental, not decided: `@vercel/analytics` sits in
`src/app/[locale]/layout.tsx` because Vercel templates ship it — per
`standards/46-product-telemetry.md` a template artifact that satisfies
no telemetry decision. Server errors go to `console.error`, visible only
in Vercel's log stream, which nobody watches.

## Decision

One decision covering the three concerns the gate names:

### 1. Crash reporting — not applicable

The site is browser-delivered, not an installable app; there is no
device-side crash surface. Nothing to decide beyond recording that this
concern does not exist for this product. Not store-distributed, so store
privacy labels are out of scope entirely.

### 2. Error reporting — yes: Sentry

The donate path moves real money, and its failure modes are currently
silent: a webhook signature failure or a missing `STRIPE_WEBHOOK_SECRET`
dies in `console.error`. `standards/20-tooling-preferences.md` calls for
Sentry before shipping user-facing code; this site shipped without it,
so the decision is recorded now and wired next.

Scope: `@sentry/nextjs` covering the two donate API routes and unhandled
client exceptions — release and environment tags, source maps uploaded
in CI, new-issue and error-spike alerts routed to email.

- **Processor list:** Sentry becomes a data processor and must appear in
  the privacy policy before the first event flows.
- **Consent posture:** no consent gate. `sendDefaultPii` stays false, no
  cookies, no PII in events; error reporting operates on a
  legitimate-interest basis.

### 3. Product analytics — pageviews only: Plausible

No product event set and no tracking plan: the site has no
activation/retention loop to measure, and its one conversion (donations)
is already fully measured in the Stripe dashboard, which stays the
system of record for it. Traffic questions — which solutions pages draw
attention, where visitors come from — are answered by cookieless
pageview counts, and that is the whole analytics ambition here.

- **Processor list:** Plausible becomes a data processor and must appear
  in the privacy policy before the script loads.
- **Consent posture:** no cookie banner. Plausible is cookieless by
  design; its no-banner position rests on the legitimate-interest basis
  argued in its own commissioned legal assessment — widely relied on,
  not settled law. We record running banner-free as our choice, not as
  fact, and revisit if that ground shifts.

## Consequences

- Easier: donation-path failures page someone instead of waiting for a
  donor's email; traffic questions get answers without cookies.
- Harder: two vendor accounts to operate, and the privacy page's current
  "we may use cookies" copy (`messages/*.json`) must be replaced with a
  named processor list (Vercel hosting, Stripe payments, Sentry errors,
  Plausible analytics) before wiring lands.
- Follow-ups, in the wiring phase — none of them part of this record:
  1. Wire Plausible, then **remove `@vercel/analytics`** from the layout
     and `package.json`. It is explicitly not kept: redundant once
     Plausible is the pageview answer. It stays untouched until then so
     this ADR remains a decision record, not a code change.
  2. Wire `@sentry/nextjs` per `standards/46-product-telemetry.md`
     (release tags, source maps, alert rules — "SDK installed" without
     those is not wired).
  3. Update the privacy-policy copy and processor list, then fill in the
     dashboard links below.
- Revisit when: the site grows an authenticated or app-like surface —
  then the analytics answer is re-decided with a tracking plan and
  PostHog per `standards/20-tooling-preferences.md`.

## Alternatives considered

1. **Keep `@vercel/analytics` as the analytics answer** — rejected:
   Vercel-locked, pageview-scoped, priced per event beyond the free
   tier, and named in `standards/46` as satisfying no telemetry
   decision.
2. **"None, deliberately" for error reporting** — a valid answer for a
   pure brochure site, rejected here: this site takes payments, and the
   recorded trade-off would be learning about webhook failures from
   donors or from lag in the Stripe dashboard. Not acceptable on a
   money path.
3. **PostHog product analytics** — rejected as scope creep: there is no
   product loop to measure, and an empty tracking plan is the failure
   mode `standards/46` warns about (data without questions).

## Where to look

| Concern | Surface | Where |
| --- | --- | --- |
| Traffic / pageviews | Plausible site for www.b-59.com | <https://plausible.io/www.b-59.com> (live once the site is created and `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is set) |
| Errors (server + client) | Sentry project for b-59 | Sentry dashboard (link lands when the project is provisioned) |
| Donations — conversions and payment failures | Stripe | Stripe dashboard |
| Deploy and runtime logs | Vercel project | Vercel dashboard |
