import { describe, expect, it } from "@jest/globals";
import { DEFAULT_SITE_URL, resolveSiteUrl } from "./site-url";

describe("resolveSiteUrl", () => {
  it("returns a valid https origin unchanged", () => {
    expect(resolveSiteUrl("https://www.b-59.com")).toBe("https://www.b-59.com");
  });

  it("normalizes away a trailing slash or path", () => {
    expect(resolveSiteUrl("https://b-59.com/")).toBe("https://b-59.com");
    expect(resolveSiteUrl("https://b-59.com/foo")).toBe("https://b-59.com");
  });

  it("falls back when the value is missing or blank", () => {
    expect(resolveSiteUrl(undefined)).toBe(DEFAULT_SITE_URL);
    expect(resolveSiteUrl("")).toBe(DEFAULT_SITE_URL);
    expect(resolveSiteUrl("   ")).toBe(DEFAULT_SITE_URL);
  });

  it("falls back for a pasted markdown link instead of crashing the build", () => {
    expect(resolveSiteUrl("[www.b-59.com](https://www.b-59.com)")).toBe(
      DEFAULT_SITE_URL,
    );
  });

  it("falls back for a non-http(s) scheme", () => {
    expect(resolveSiteUrl("ftp://b-59.com")).toBe(DEFAULT_SITE_URL);
    expect(resolveSiteUrl("javascript:alert(1)")).toBe(DEFAULT_SITE_URL);
  });

  it("falls back for a plainly malformed value", () => {
    expect(resolveSiteUrl("not a url")).toBe(DEFAULT_SITE_URL);
  });
});
