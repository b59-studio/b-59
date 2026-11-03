import { describe, expect, it } from "@jest/globals";
import { accessToken, configuredPassword, hasAccess, passwordMatches } from "./win-calculator-access";

describe("configuredPassword", () => {
  it("reads the password from the environment", () => {
    expect(configuredPassword({ WIN_CALCULATOR_PASSWORD: "open sesame" })).toBe("open sesame");
  });

  it("treats an unset or blank variable as no password", () => {
    expect(configuredPassword({})).toBeNull();
    expect(configuredPassword({ WIN_CALCULATOR_PASSWORD: "   " })).toBeNull();
  });
});

describe("passwordMatches", () => {
  it("lets the right password in, ignoring stray spaces", () => {
    expect(passwordMatches("open sesame", "open sesame")).toBe(true);
    expect(passwordMatches(" open sesame ", "open sesame")).toBe(true);
  });

  it("refuses a wrong password", () => {
    expect(passwordMatches("open sesam", "open sesame")).toBe(false);
    expect(passwordMatches("", "open sesame")).toBe(false);
  });

  it("refuses everything when no password is configured", () => {
    expect(passwordMatches("", null)).toBe(false);
    expect(passwordMatches("anything", null)).toBe(false);
  });
});

describe("hasAccess", () => {
  const password = "open sesame";

  it("accepts the cookie the right password produced", () => {
    expect(hasAccess(accessToken(password), password)).toBe(true);
  });

  it("refuses a missing, forged or stale cookie", () => {
    expect(hasAccess(undefined, password)).toBe(false);
    expect(hasAccess("", password)).toBe(false);
    expect(hasAccess(password, password)).toBe(false);
    expect(hasAccess(accessToken("the old password"), password)).toBe(false);
  });

  it("refuses every cookie when no password is configured", () => {
    expect(hasAccess(accessToken(password), null)).toBe(false);
  });
});
