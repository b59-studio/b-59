/**
 * Stripe webhook signature verification, implemented with Node's crypto so the
 * project carries no extra runtime dependency.
 *
 * Mirrors Stripe's own scheme: the `Stripe-Signature` header carries a
 * timestamp (`t`) and one or more HMAC-SHA256 signatures (`v1`). The signed
 * payload is `${timestamp}.${rawBody}`, keyed with the endpoint's signing
 * secret. See https://stripe.com/docs/webhooks/signatures
 *
 * Server-only: reads the webhook signing secret. Import solely from the route
 * handler under src/app/api.
 */

import crypto from "crypto";

/** Reject events whose timestamp is older/newer than this, to blunt replays. */
const DEFAULT_TOLERANCE_SECONDS = 300;

export type StripeEvent = {
  id: string;
  type: string;
  data: { object: Record<string, unknown> };
};

function parseSignatureHeader(header: string): { timestamp: number; signatures: string[] } {
  let timestamp = Number.NaN;
  const signatures: string[] = [];

  for (const part of header.split(",")) {
    const [key, value] = part.split("=");
    if (key === "t") {
      timestamp = Number(value);
    } else if (key === "v1" && value) {
      signatures.push(value);
    }
  }

  return { timestamp, signatures };
}

/** Constant-time compare of two hex strings of equal byte length. */
function secureCompareHex(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  if (bufA.length !== bufB.length || bufA.length === 0) {
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Verify the signature and return the parsed event.
 * Throws if the header is missing/malformed, the signature does not match, or
 * the timestamp falls outside the tolerance window.
 */
export function constructStripeEvent(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
  toleranceSeconds: number = DEFAULT_TOLERANCE_SECONDS,
): StripeEvent {
  if (!signatureHeader) {
    throw new Error("Missing Stripe-Signature header");
  }

  const { timestamp, signatures } = parseSignatureHeader(signatureHeader);
  if (!Number.isFinite(timestamp) || signatures.length === 0) {
    throw new Error("Malformed Stripe-Signature header");
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`, "utf8")
    .digest("hex");

  const matched = signatures.some((candidate) => secureCompareHex(candidate, expected));
  if (!matched) {
    throw new Error("Stripe-Signature verification failed");
  }

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > toleranceSeconds) {
    throw new Error("Stripe-Signature timestamp outside tolerance window");
  }

  return JSON.parse(rawBody) as StripeEvent;
}
