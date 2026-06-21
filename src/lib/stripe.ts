/**
 * Minimal server-side Stripe integration.
 *
 * Talks to the Stripe REST API with fetch so the project carries no extra
 * runtime dependency. All card handling happens on Stripe's hosted Checkout
 * page, so this server never sees card data (PCI scope stays at SAQ-A).
 *
 * This module must only ever run on the server: it reads the secret key.
 * It is imported solely from the route handler under src/app/api, which
 * Next.js always executes server-side. Do not import it from a Client
 * Component ("use client") — that would bundle the secret-key path into the
 * browser build.
 */

const STRIPE_API = "https://api.stripe.com/v1/checkout/sessions";

/** Smallest accepted contribution, in cents. Stripe's floor is $0.50. */
export const MIN_AMOUNT_CENTS = 100;

/** Largest accepted contribution, in cents. Guards against typos/abuse. */
export const MAX_AMOUNT_CENTS = 5_000_000;

export type Frequency = "once" | "monthly";

export type CheckoutInput = {
  amountCents: number;
  frequency: Frequency;
  baseUrl: string;
};

/**
 * Validate an amount coming from an untrusted client.
 * Returns the integer cent value, or null if it is not acceptable.
 */
export function normalizeAmountCents(value: unknown): number | null {
  const cents = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(cents) || !Number.isInteger(cents)) {
    return null;
  }
  if (cents < MIN_AMOUNT_CENTS || cents > MAX_AMOUNT_CENTS) {
    return null;
  }
  return cents;
}

export function normalizeFrequency(value: unknown): Frequency | null {
  return value === "once" || value === "monthly" ? value : null;
}

/**
 * Decide which base URL Stripe should redirect back to after checkout.
 *
 * The request's own Origin is convenient — localhost and the live host then
 * redirect to themselves — but it is attacker-controlled, so trust it only
 * when it matches the configured site host or a localhost dev host. Anything
 * else falls back to siteUrl, so a forged Origin can't turn the success/cancel
 * links into an open redirect. Returns an absolute origin (scheme + host +
 * port), never with a trailing slash.
 */
export function resolveRedirectBaseUrl(origin: string | null, siteUrl: string): string {
  if (!origin) {
    return siteUrl;
  }

  let candidate: URL;
  try {
    candidate = new URL(origin);
  } catch {
    return siteUrl;
  }

  if (candidate.protocol !== "http:" && candidate.protocol !== "https:") {
    return siteUrl;
  }

  let allowedHost: string;
  try {
    allowedHost = new URL(siteUrl).hostname;
  } catch {
    return siteUrl;
  }

  const host = candidate.hostname;
  const isAllowed =
    host === allowedHost || host === "localhost" || host === "127.0.0.1";

  return isAllowed ? candidate.origin : siteUrl;
}

/**
 * Create a Stripe Checkout Session and return the URL to redirect the donor to.
 * Throws if the secret key is missing or Stripe rejects the request.
 */
export async function createCheckoutSession({
  amountCents,
  frequency,
  baseUrl,
}: CheckoutInput): Promise<string> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  const isMonthly = frequency === "monthly";
  const params = new URLSearchParams();

  params.set("mode", isMonthly ? "subscription" : "payment");
  params.set("success_url", `${baseUrl}/donate/success?session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${baseUrl}/donate?status=cancelled`);

  // Single line item priced on the fly, so no pre-created Stripe Price needed.
  params.set("line_items[0][quantity]", "1");
  params.set("line_items[0][price_data][currency]", "usd");
  params.set("line_items[0][price_data][unit_amount]", String(amountCents));
  params.set(
    "line_items[0][price_data][product_data][name]",
    isMonthly ? "Monthly contribution to B-59" : "Contribution to B-59",
  );

  if (isMonthly) {
    params.set("line_items[0][price_data][recurring][interval]", "month");
  } else {
    // "Donate" call-to-action on Stripe's button; only valid for one-time payments.
    params.set("submit_type", "donate");
  }

  const response = await fetch(STRIPE_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    // Surface Stripe's error message server-side only; never leak it to the client.
    const detail = await response.text();
    throw new Error(`Stripe checkout session failed (${response.status}): ${detail}`);
  }

  const session = (await response.json()) as { url?: string };
  if (!session.url) {
    throw new Error("Stripe checkout session response did not include a URL");
  }

  return session.url;
}
