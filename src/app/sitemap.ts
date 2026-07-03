import type { MetadataRoute } from "next";
import { resolveSiteUrl } from "@/lib/site-url";
import { locales, defaultLocale, type Locale } from "@/i18n/config";

const siteUrl = resolveSiteUrl();

// Default locale is unprefixed under `localePrefix: 'as-needed'`.
function localizedPath(locale: Locale, path: string): string {
  return locale === defaultLocale ? path : `/${locale}${path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: "", priority: 1, changeFrequency: "monthly" as const },
    { path: "/studio", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/solutions/brand-design/philosophy", priority: 0.8, changeFrequency: "yearly" as const },
    // /solutions/brand-design/portfolio is intentionally omitted — built but not public yet.
    { path: "/solutions/ready2vote", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/solutions/travis-county-vdr", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/donate", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/about", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/about/sitemap", priority: 0.5, changeFrequency: "yearly" as const },
    { path: "/about/privacy", priority: 0.5, changeFrequency: "yearly" as const },
    { path: "/about/terms", priority: 0.5, changeFrequency: "yearly" as const },
  ];

  return routes.map(({ path, priority, changeFrequency }) => ({
    url: `${siteUrl}${localizedPath(defaultLocale, path)}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
    alternates: {
      languages: Object.fromEntries([
        ...locales.map((locale) => [locale, `${siteUrl}${localizedPath(locale, path)}`]),
        ["x-default", `${siteUrl}${path}`],
      ]),
    },
  }));
}
