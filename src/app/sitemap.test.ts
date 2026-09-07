import { describe, expect, it } from "@jest/globals";
import sitemap, { discoverRoutePaths } from "./sitemap";

describe("discoverRoutePaths", () => {
  it("finds every real page under src/app/[locale], including ones not yet overridden", () => {
    const routes = discoverRoutePaths();
    expect(routes).toEqual(
      expect.arrayContaining([
        "",
        "/studio",
        "/solutions/hotline",
        "/solutions/ready2vote",
        "/solutions/travis-county-vdr",
        "/solutions/brand-design/philosophy",
        "/solutions/brand-design/portfolio",
        "/solutions/brand-design/merch",
        "/donate",
        "/donate/success",
        "/about",
        "/about/inspirations",
        "/about/team",
        "/about/sitemap",
        "/about/privacy",
        "/about/terms",
      ]),
    );
  });
});

describe("sitemap", () => {
  it("includes newly added pages by default without a manual override", () => {
    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);
    expect(urls.some((url) => url.endsWith("/solutions/hotline"))).toBe(true);
  });

  it("excludes pages explicitly opted out via overrides", () => {
    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);
    expect(urls.some((url) => url.endsWith("/solutions/brand-design/portfolio"))).toBe(false);
    expect(urls.some((url) => url.endsWith("/donate/success"))).toBe(false);
  });

  it("gives every entry full locale alternates including x-default", () => {
    const entries = sitemap();
    for (const entry of entries) {
      expect(entry.alternates?.languages).toEqual(
        expect.objectContaining({ en: expect.any(String), es: expect.any(String), zh: expect.any(String), he: expect.any(String), hi: expect.any(String), "x-default": expect.any(String) }),
      );
    }
  });
});
