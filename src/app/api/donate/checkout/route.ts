import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import {
  createCheckoutSession,
  normalizeAmountCents,
  normalizeFrequency,
  resolveRedirectBaseUrl,
} from "@/lib/stripe";
import { resolveSiteUrl } from "@/lib/site-url";
import { donationsOpen } from "@/lib/donations";
import { defaultLocale, isLocale } from "@/i18n/config";

// Stripe calls need the Node.js runtime (not edge) and must never be cached.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const siteUrl = resolveSiteUrl();

export async function POST(request: Request) {
  // Donations are closed. Refuse here as well as on the page: the page being a
  // 404 stops nobody who posts straight at this endpoint, or whose tab was
  // open before it came down.
  if (!donationsOpen) {
    return NextResponse.json({ error: "B-59 is not accepting donations." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { amountCents, frequency, locale } =
    typeof body === "object" && body !== null
      ? (body as { amountCents?: unknown; frequency?: unknown; locale?: unknown })
      : {};

  const amount = normalizeAmountCents(amountCents);
  const freq = normalizeFrequency(frequency);
  // Untrusted input — fall back to the default locale rather than trusting a
  // caller-supplied path segment (standard 33's locale-is-untrusted rule).
  const resolvedLocale = isLocale(locale) ? locale : defaultLocale;
  // Default locale is unprefixed under `localePrefix: 'as-needed'`.
  const localePrefix = resolvedLocale === defaultLocale ? "" : `/${resolvedLocale}`;

  if (amount === null) {
    return NextResponse.json(
      { error: "Please enter an amount between $1 and $50,000." },
      { status: 400 },
    );
  }
  if (freq === null) {
    return NextResponse.json({ error: "Invalid frequency." }, { status: 400 });
  }

  // Trust the request's Origin only when it's an allowed host; otherwise fall
  // back to the configured site URL so a forged Origin can't redirect donors
  // off-site after checkout.
  const baseUrl = resolveRedirectBaseUrl(request.headers.get("origin"), siteUrl);

  try {
    const url = await createCheckoutSession({
      amountCents: amount,
      frequency: freq,
      baseUrl,
      localePrefix,
    });
    return NextResponse.json({ url });
  } catch (error) {
    // Report server-side only; return a generic message to the client. The
    // captured context is deliberately non-personal: amount and frequency,
    // never donor details (card data stays on Stripe's hosted page).
    Sentry.captureException(error, {
      tags: { route: "donate/checkout" },
      contexts: { donation: { amount_cents: amount, frequency: freq } },
    });
    console.error("Donation checkout failed:", error);
    return NextResponse.json(
      { error: "We couldn't start the checkout. Please try again." },
      { status: 502 },
    );
  }
}
