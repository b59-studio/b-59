import { describe, expect, it } from "@jest/globals";
import crypto from "crypto";
import { constructStripeEvent } from "./stripe-webhook";

const SECRET = "whsec_testsecret";

function sign(rawBody: string, secret: string, timestamp: number): string {
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`, "utf8")
    .digest("hex");
  return `t=${timestamp},v1=${signature}`;
}

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

const validEvent = {
  id: "evt_123",
  type: "checkout.session.completed",
  data: { object: { id: "cs_test_123" } },
};

describe("constructStripeEvent", () => {
  it("returns the parsed event for a valid signature", () => {
    const rawBody = JSON.stringify(validEvent);
    const header = sign(rawBody, SECRET, nowSeconds());

    const event = constructStripeEvent(rawBody, header, SECRET);

    expect(event.id).toBe("evt_123");
    expect(event.type).toBe("checkout.session.completed");
    expect(event.data.object.id).toBe("cs_test_123");
  });

  it("throws when the body was tampered with after signing", () => {
    const rawBody = JSON.stringify(validEvent);
    const header = sign(rawBody, SECRET, nowSeconds());
    const tamperedBody = JSON.stringify({ ...validEvent, id: "evt_tampered" });

    expect(() => constructStripeEvent(tamperedBody, header, SECRET)).toThrow(
      /verification failed/i,
    );
  });

  it("throws when verified against the wrong secret", () => {
    const rawBody = JSON.stringify(validEvent);
    const header = sign(rawBody, SECRET, nowSeconds());

    expect(() =>
      constructStripeEvent(rawBody, header, "whsec_wrongsecret"),
    ).toThrow(/verification failed/i);
  });

  it("throws when the timestamp is outside the tolerance window", () => {
    const rawBody = JSON.stringify(validEvent);
    const staleTimestamp = nowSeconds() - 600; // 10 minutes old; tolerance is 300s
    const header = sign(rawBody, SECRET, staleTimestamp);

    expect(() => constructStripeEvent(rawBody, header, SECRET)).toThrow(
      /tolerance window/i,
    );
  });

  it("throws when the Stripe-Signature header is missing", () => {
    const rawBody = JSON.stringify(validEvent);

    expect(() => constructStripeEvent(rawBody, null, SECRET)).toThrow(
      /missing stripe-signature/i,
    );
  });

  it("throws when the signature header is malformed", () => {
    const rawBody = JSON.stringify(validEvent);

    expect(() => constructStripeEvent(rawBody, "garbage", SECRET)).toThrow(
      /malformed/i,
    );
  });
});
