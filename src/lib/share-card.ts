import type { Metadata } from "next";

type OpenGraph = NonNullable<Metadata["openGraph"]>;

/**
 * The sitewide share card, rendered by app/opengraph-image.tsx. Referenced
 * explicitly because Next merges metadata shallowly: a page that declares its
 * own `openGraph` replaces the parent's whole object, so a card inherited only
 * through the file convention silently disappears from every such page.
 */
export const SHARE_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "B-59 — Human-centered design and strategy",
} as const;

/**
 * Spread into every page's `openGraph`, ahead of its own title, description
 * and url, so each page keeps the card and the site-level fields.
 */
export const BASE_OPEN_GRAPH = {
  type: "website",
  locale: "en_US",
  siteName: "B-59",
  images: [SHARE_IMAGE],
} satisfies OpenGraph;
