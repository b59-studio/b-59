import { describe, expect, it } from "@jest/globals";
import sitemap, { discoverRoutePaths, pageLastModified } from "./sitemap";

describe("pageLastModified", () => {
  const d = (iso: string) => new Date(iso);
  const dates = new Map([
    ["src/app/[locale]/page.tsx", d("2026-01-01")],
    ["src/app/[locale]/layout.tsx", d("2026-06-01")],
    ["src/app/[locale]/research/page.tsx", d("2026-02-01")],
    ["src/app/[locale]/research/chart.tsx", d("2026-03-01")],
    ["src/app/[locale]/research/sub/page.tsx", d("2026-09-01")],
  ]);

  it("takes the newest file in the page's own folder", () => {
    expect(pageLastModified("/research", dates)).toEqual(d("2026-03-01"));
  });

  it("ignores subpages and the shared layout", () => {
    expect(pageLastModified("", dates)).toEqual(d("2026-01-01"));
  });

  it("gives no date when git has none", () => {
    expect(pageLastModified("/about", dates)).toBeUndefined();
  });
});

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
        "/research",
        "/research/2026-election-analysis",
        "/research/2026-polls",
        "/research/2026-results",
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
    expect(urls.some((url) => url.endsWith("/donate"))).toBe(false);
    expect(urls.some((url) => url.endsWith("/donate/success"))).toBe(false);
    expect(urls.some((url) => url.endsWith("/studio/win-calculator"))).toBe(false);
  });

  // Which pages get a date depends on how much history the checkout has (CI
  // fetches one commit, so none do); git-dates.test.ts covers the dating itself.
  it("never dates a page by build time, and leaves live-data pages undated", () => {
    const before = Date.now();
    const entries = sitemap();
    const byPath = (suffix: string) => entries.find((entry) => entry.url.endsWith(suffix));
    for (const entry of entries) {
      if (entry.lastModified) expect(new Date(entry.lastModified).getTime()).toBeLessThan(before);
    }
    expect(byPath("/research/2026-results")).not.toHaveProperty("lastModified");
    expect(byPath("/research/2026-polls")).not.toHaveProperty("lastModified");
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
