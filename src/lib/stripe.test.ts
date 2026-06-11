import { describe, expect, it } from "@jest/globals";
import {
  MAX_AMOUNT_CENTS,
  MIN_AMOUNT_CENTS,
  normalizeAmountCents,
  normalizeFrequency,
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
