# ADR 0002: Pageview analytics move to Vercel Analytics

## Status

Accepted — 2026-09-11. Supersedes section 3 (*Product analytics —
pageviews only: Plausible*) of `0001-telemetry-decision.md`. The rest of
ADR-0001 — crash reporting as not-applicable, and Sentry for error
reporting — stands unchanged.

Date: 2026-09-11

## Context

ADR-0001 chose Plausible for cookieless pageview counts and, in the same
record, required `@vercel/analytics` to be removed once Plausible was
wired. The removal happened on 2026-08-10 in `b2f6d4b`. The wiring
landed in the same commit and is still in the codebase and correct.

What never happened was the part the record treated as a follow-up: the
Plausible site was never created, so `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` was
never set. The script is behind a truthiness check on that variable, so
it renders nothing, and the site has had **no pageview measurement of
any kind since 2026-08-10** — Vercel's was switched off deliberately and
Plausible's was never switched on.

Two properties of the setup kept that invisible for a month. The failure
is silent by construction: a missing environment variable produces an
absent script tag, not an error, and the guard that makes local builds
work without vendor credentials is the same guard that makes production
fail quietly. And `NEXT_PUBLIC_*` values are inlined at build time, while
`build` is a bare `next build` with no Doppler wrapper — so even a value
correctly stored in Doppler would never have reached the bundle. The
variable had to be in Vercel's own project environment, and nothing in
the record said so.

## Decision

Vercel Analytics becomes the pageview answer. `@vercel/analytics` is
restored to `src/app/[locale]/layout.tsx`, and Plausible is not adopted.

ADR-0001 rejected this option for three stated reasons, and two of them
were correct and remain true: it is Vercel-locked, and it is priced per
event beyond the free tier. The third — that `standards/46` names it as
a template artifact satisfying no telemetry decision — no longer
applies, because this record is that decision.

What outweighs them is that the alternative has produced zero data for a
month. The measurement this site actually needs is which solutions pages
draw attention and where visitors arrive from; that question goes
unanswered either way, and only one of the two options answers it
without a vendor account somebody has to remember to create. Vercel
Analytics requires no new processor, no new account, and no new secret —
which is precisely the class of dependency that failed here.

- **Processor list:** no addition. Vercel is already a processor for
  hosting; its role in the privacy policy widens from "hosting" to
  "hosting and analytics", and Plausible leaves the list. Updated in
  `messages/*.json` in the same change, in all five locales.
- **Consent posture:** unchanged, and for the same reason. Vercel
  Analytics is cookieless, so the policy's "the only cookie this site
  sets remembers your language choice" stays true and no banner appears.

## Consequences

- Easier: traffic questions get answered on the next deploy, with no
  account to provision and no key to rotate.
- Harder: pageview history is Vercel's and does not export cleanly, so
  leaving Vercel later means leaving the history. Accepted — a marketing
  site's aggregate pageview history is not an asset worth designing
  around.
- Cost: free tier covers current volume. If events exceed it, the
  decision to revisit is this one, not a silent overage.
- **The Plausible wiring stays in the codebase, inert.** Removing it is
  not free — it is the only ready path back to a non-Vercel analytics
  vendor. It carries a comment recording that setting its domain would
  put a second analytics processor on every page and therefore requires
  a privacy-policy update in the same change.
- Revisit when: the free tier is exceeded, or the site grows an
  authenticated surface — at which point ADR-0001's own revisit clause
  (a tracking plan and PostHog) governs instead.

## Alternatives considered

1. **Finish Plausible as ADR-0001 specified** — create the site, set the
   variable in Vercel. Rejected not on the merits, which are good
   (cookieless, portable, not Vercel-locked), but on the evidence: it
   was specified once and did not get done, and nothing about repeating
   the specification makes the account appear. Available at any time by
   setting one variable, since the code is still there.
2. **Run both** — rejected. Two analytics processors on every page for
   one question, and a privacy policy that has to name both.
3. **Accept no pageview measurement** — a defensible answer for a
   brochure site, and effectively what has been running since August.
   Rejected because it was never actually chosen; it was arrived at by
   omission, and a decision nobody made is not a decision.

## Where to look

| Concern | Surface | Where |
| --- | --- | --- |
| Traffic / pageviews | Vercel Web Analytics | Vercel dashboard → b-59 → Analytics |
| Errors (server + client) | Sentry project for b-59 | Sentry dashboard (see ADR-0001) |
| Donations — conversions and payment failures | Stripe | Stripe dashboard |
