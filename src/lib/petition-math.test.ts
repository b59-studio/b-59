import { describe, expect, it } from "@jest/globals";
import { addDays, deadlinesFor, signaturesRequired, thresholdShare, validityNeeded } from "./petition-math";

describe("signaturesRequired", () => {
  it("caps at 20,000 once 5% of voters is more", () => {
    expect(signaturesRequired(545_230)).toBe(20_000);
  });

  it("uses 5% when that is fewer", () => {
    expect(signaturesRequired(300_000)).toBe(15_000);
  });
});

describe("thresholdShare", () => {
  it("puts Austin's bar at about 3.7% of qualified voters", () => {
    expect(thresholdShare(545_230)).toBeCloseTo(0.0367, 4);
  });
});

describe("validityNeeded", () => {
  it("is the required count over the submitted count", () => {
    expect(validityNeeded(25_000, 20_000)).toBe(0.8);
    expect(validityNeeded(40_000, 20_000)).toBe(0.5);
  });

  it("refuses an empty petition", () => {
    expect(() => validityNeeded(0, 20_000)).toThrow(RangeError);
  });
});

describe("addDays", () => {
  it("crosses month and year boundaries on calendar dates", () => {
    expect(addDays("2027-01-01", -1)).toBe("2026-12-31");
    expect(addDays("2027-02-28", 1)).toBe("2027-03-01");
  });
});

describe("deadlinesFor", () => {
  it("chains each step back from the election", () => {
    const d = deadlinesFor("2027-05-01", { orderLeadDays: 78, councilDays: 10, clerkDays: 30, signatureLifeDays: 180 });
    expect(d.orderBy).toBe("2027-02-12");
    expect(d.certifyBy).toBe("2027-02-02");
    expect(d.fileBy).toBe("2027-01-03");
    expect(d.oldestSignature).toBe("2026-07-07");
  });
});

describe("deadlinesFor November 2028", () => {
  it("lands the filing date in July and the oldest signature in January", () => {
    const d = deadlinesFor("2028-11-07", { orderLeadDays: 78, councilDays: 10, clerkDays: 30, signatureLifeDays: 180 });
    expect(d.orderBy).toBe("2028-08-21");
    expect(d.certifyBy).toBe("2028-08-11");
    expect(d.fileBy).toBe("2028-07-12");
    expect(d.oldestSignature).toBe("2028-01-14");
  });
});
