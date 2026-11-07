import { describe, expect, it } from "@jest/globals";
import { discoverRoutePaths } from "@/app/sitemap";
import { buildLlmsTxt } from "./llms-txt";
import { datasetJsonLd, organizationId, organizationJsonLd } from "./structured-data";

const SITE = "https://www.b-59.com";

describe("organizationJsonLd", () => {
  const [org, site] = organizationJsonLd(SITE)["@graph"];

  it("places the studio in Austin, Texas", () => {
    expect(org.address).toMatchObject({ addressLocality: "Austin", addressRegion: "TX", addressCountry: "US" });
    expect(org.description).toContain("Austin, Texas");
  });

  it("gives the studio one id the website and datasets can point at", () => {
    expect(org["@id"]).toBe(organizationId(SITE));
    expect(site.publisher).toEqual({ "@id": organizationId(SITE) });
    const dataset = datasetJsonLd({ siteUrl: SITE, path: "/x", name: "x", description: "x", temporalCoverage: "2026", keywords: [] });
    expect(dataset.creator["@id"]).toBe(organizationId(SITE));
  });
});

describe("buildLlmsTxt", () => {
  const text = buildLlmsTxt(SITE);
  const linked = [...text.matchAll(/\]\((https:[^)]+)\)/g)].map((m) => m[1].slice(SITE.length));

  it("opens with the studio's name and summary, as the format expects", () => {
    expect(text.startsWith("# B-59 Studio\n\n> ")).toBe(true);
  });

  it("links only to pages that exist", () => {
    const routes = new Set([...discoverRoutePaths(), "/sitemap.xml"]);
    expect(linked.length).toBeGreaterThan(0);
    expect(linked.filter((path) => !routes.has(path))).toEqual([]);
  });
});
