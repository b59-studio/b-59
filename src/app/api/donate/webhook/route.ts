import { NextResponse } from "next/server";
import { constructStripeEvent } from "@/lib/stripe-webhook";

// Signature verification uses Node's crypto and the raw request body, so this
// must run on the Node.js runtime and must never be cached.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("Stripe webhook received but STRIPE_WEBHOOK_SECRET is not configured.");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 500 });
  }

  // Stripe signs the exact raw bytes; do not parse before verifying.
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event;
  try {
    event = constructStripeEvent(rawBody, signature, secret);
  } catch (error) {
    console.error("Stripe webhook verification failed:", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  // Acknowledge known events. Persistence/notifications can hang off these
  // cases later; for now we log so completed donations are traceable.
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object;
      // Donor email is intentionally omitted — keep PII out of application logs.
      console.log("Donation completed:", {
        id: session.id,
        amountTotal: session.amount_total,
        currency: session.currency,
        mode: session.mode,
      });
      break;
    }
    case "invoice.paid": {
      // Fires on each successful recurring (monthly) charge.
      const invoice = event.data.object;
      console.log("Recurring donation charged:", {
        id: invoice.id,
        amountPaid: invoice.amount_paid,
        currency: invoice.currency,
      });
      break;
    }
    case "checkout.session.async_payment_failed": {
      console.warn("Donation payment failed:", { id: event.data.object.id });
      break;
    }
    default:
      // Unhandled event types are fine to ignore; Stripe just needs a 2xx.
      break;
  }

  return NextResponse.json({ received: true });
}
