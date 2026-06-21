import { NextResponse } from "next/server";
import {
  createCheckoutSession,
  normalizeAmountCents,
  normalizeFrequency,
  resolveRedirectBaseUrl,
} from "@/lib/stripe";
import { resolveSiteUrl } from "@/lib/site-url";

// Stripe calls need the Node.js runtime (not edge) and must never be cached.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const siteUrl = resolveSiteUrl();

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { amountCents, frequency } =
    typeof body === "object" && body !== null
      ? (body as { amountCents?: unknown; frequency?: unknown })
      : {};

  const amount = normalizeAmountCents(amountCents);
  const freq = normalizeFrequency(frequency);

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
    });
    return NextResponse.json({ url });
  } catch (error) {
    // Log server-side for debugging; return a generic message to the client.
    console.error("Donation checkout failed:", error);
    return NextResponse.json(
      { error: "We couldn't start the checkout. Please try again." },
      { status: 502 },
    );
  }
}
