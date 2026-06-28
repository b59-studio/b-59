import type { MetadataRoute } from "next";
import { resolveSiteUrl } from "@/lib/site-url";

const siteUrl = resolveSiteUrl();

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: "", priority: 1, changeFrequency: "monthly" as const },
    { path: "/solutions/brand-design/philosophy", priority: 0.8, changeFrequency: "yearly" as const },
    // /solutions/brand-design/portfolio is intentionally omitted — built but not public yet.
    { path: "/solutions/ready2vote", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/donate", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/about", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/about/sitemap", priority: 0.5, changeFrequency: "yearly" as const },
    { path: "/about/privacy", priority: 0.5, changeFrequency: "yearly" as const },
    { path: "/about/terms", priority: 0.5, changeFrequency: "yearly" as const },
  ];

  return routes.map(({ path, priority, changeFrequency }) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}
