import fs from "node:fs";
import path from "node:path";
import type { MetadataRoute } from "next";
import { resolveSiteUrl } from "@/lib/site-url";
import { locales, defaultLocale, type Locale } from "@/i18n/config";

const siteUrl = resolveSiteUrl();
const APP_LOCALE_DIR = path.join(process.cwd(), "src/app/[locale]");

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

type RouteOverride = {
  priority?: number;
  changeFrequency?: ChangeFrequency;
  /** Page exists and is reachable, but shouldn't be offered to search engines. */
  exclude?: boolean;
};

const DEFAULT_PRIORITY = 0.5;
const DEFAULT_CHANGE_FREQUENCY: ChangeFrequency = "monthly";

// Every routable page under src/app/[locale] is discovered from the filesystem and
// included automatically. Add an entry here only to override the defaults above
// (priority/changeFrequency) or to opt a page OUT of the sitemap — never to opt one in.
const overrides: Record<string, RouteOverride> = {
  "": { priority: 1 },
  "/studio": { priority: 0.9 },
  "/solutions/brand-design/philosophy": { priority: 0.8, changeFrequency: "yearly" },
  "/solutions/brand-design/portfolio": { exclude: true }, // built but not public yet
  "/solutions/hotline": { priority: 0.9 },
  "/solutions/ready2vote": { priority: 0.9 },
  "/solutions/travis-county-vdr": { priority: 0.9 },
  "/donate": { priority: 0.8 },
  "/donate/success": { exclude: true }, // post-transaction confirmation, not for search engines
  "/about": { priority: 0.9 },
  "/about/sitemap": { priority: 0.5, changeFrequency: "yearly" },
  "/about/privacy": { priority: 0.5, changeFrequency: "yearly" },
  "/about/terms": { priority: 0.5, changeFrequency: "yearly" },
};

/** Walks src/app/[locale] for page.tsx/page.ts files, skipping dynamic/group segments we can't statically enumerate. */
export function discoverRoutePaths(dir: string = APP_LOCALE_DIR, prefix = ""): string[] {
  const routes: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (entry.name.startsWith("[") || entry.name.startsWith("(")) continue;
      routes.push(...discoverRoutePaths(path.join(dir, entry.name), `${prefix}/${entry.name}`));
    } else if (entry.name === "page.tsx" || entry.name === "page.ts") {
      routes.push(prefix);
    }
  }
  return routes;
}

// Default locale is unprefixed under `localePrefix: 'as-needed'`.
function localizedPath(locale: Locale, routePath: string): string {
  return locale === defaultLocale ? routePath : `/${locale}${routePath}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = discoverRoutePaths()
    .map((routePath) => ({ path: routePath, ...overrides[routePath] }))
    .filter((route) => !route.exclude);

  return routes.map(({ path: routePath, priority = DEFAULT_PRIORITY, changeFrequency = DEFAULT_CHANGE_FREQUENCY }) => ({
    url: `${siteUrl}${localizedPath(defaultLocale, routePath)}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
    alternates: {
      languages: Object.fromEntries([
        ...locales.map((locale) => [locale, `${siteUrl}${localizedPath(locale, routePath)}`]),
        ["x-default", `${siteUrl}${routePath}`],
      ]),
    },
  }));
}
