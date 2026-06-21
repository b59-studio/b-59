import { describe, expect, it } from "@jest/globals";
import {
  MAX_AMOUNT_CENTS,
  MIN_AMOUNT_CENTS,
  normalizeAmountCents,
  normalizeFrequency,
  resolveRedirectBaseUrl,
} from "./stripe";

describe("normalizeAmountCents", () => {
  it("accepts the minimum and maximum boundaries", () => {
    expect(normalizeAmountCents(MIN_AMOUNT_CENTS)).toBe(MIN_AMOUNT_CENTS);
    expect(normalizeAmountCents(MAX_AMOUNT_CENTS)).toBe(MAX_AMOUNT_CENTS);
  });

  it("accepts a value inside the range", () => {
    expect(normalizeAmountCents(5_000)).toBe(5_000);
  });

  it("accepts a numeric string and returns a number", () => {
    expect(normalizeAmountCents("2500")).toBe(2500);
  });

  it("rejects values just outside the boundaries", () => {
    expect(normalizeAmountCents(MIN_AMOUNT_CENTS - 1)).toBeNull();
    expect(normalizeAmountCents(MAX_AMOUNT_CENTS + 1)).toBeNull();
  });

  it("rejects non-integer amounts", () => {
    expect(normalizeAmountCents(150.5)).toBeNull();
    expect(normalizeAmountCents("99.99")).toBeNull();
  });

  it("rejects NaN and non-finite values", () => {
    expect(normalizeAmountCents(Number.NaN)).toBeNull();
    expect(normalizeAmountCents(Number.POSITIVE_INFINITY)).toBeNull();
    expect(normalizeAmountCents("not-a-number")).toBeNull();
  });

  it("rejects negative and zero amounts", () => {
    expect(normalizeAmountCents(-100)).toBeNull();
    expect(normalizeAmountCents(0)).toBeNull();
  });

  it("rejects null and undefined", () => {
    expect(normalizeAmountCents(null)).toBeNull();
    expect(normalizeAmountCents(undefined)).toBeNull();
  });
});

describe("normalizeFrequency", () => {
  it("accepts the two valid frequencies", () => {
    expect(normalizeFrequency("once")).toBe("once");
    expect(normalizeFrequency("monthly")).toBe("monthly");
  });

  it("rejects any other value", () => {
    expect(normalizeFrequency("weekly")).toBeNull();
    expect(normalizeFrequency("")).toBeNull();
    expect(normalizeFrequency(undefined)).toBeNull();
    expect(normalizeFrequency(null)).toBeNull();
    expect(normalizeFrequency(42)).toBeNull();
  });
});

describe("resolveRedirectBaseUrl", () => {
  const siteUrl = "https://b-59.com";

  it("accepts an origin on the configured site host", () => {
    expect(resolveRedirectBaseUrl("https://b-59.com", siteUrl)).toBe(
      "https://b-59.com",
    );
  });

  it("accepts localhost dev origins", () => {
    expect(resolveRedirectBaseUrl("http://localhost:3000", siteUrl)).toBe(
      "http://localhost:3000",
    );
    expect(resolveRedirectBaseUrl("http://127.0.0.1:3000", siteUrl)).toBe(
      "http://127.0.0.1:3000",
    );
  });

  it("falls back to the site URL for a foreign origin", () => {
    expect(resolveRedirectBaseUrl("https://evil.example.com", siteUrl)).toBe(
      siteUrl,
    );
  });

  it("falls back for a look-alike host that only suffixes the site host", () => {
    expect(
      resolveRedirectBaseUrl("https://b-59.com.evil.example", siteUrl),
    ).toBe(siteUrl);
  });

  it("falls back for a non-http(s) scheme", () => {
    expect(resolveRedirectBaseUrl("javascript:alert(1)", siteUrl)).toBe(siteUrl);
  });

  it("falls back when the Origin header is missing or malformed", () => {
    expect(resolveRedirectBaseUrl(null, siteUrl)).toBe(siteUrl);
    expect(resolveRedirectBaseUrl("not a url", siteUrl)).toBe(siteUrl);
  });

  it("strips any path or trailing slash from the returned origin", () => {
    expect(resolveRedirectBaseUrl("https://b-59.com/", siteUrl)).toBe(
      "https://b-59.com",
    );
  });
});
