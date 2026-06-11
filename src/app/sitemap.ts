import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://b-59.com";

export default function sitemap(): MetadataRoute.Sitemap {
  // /work omitted until it is linked in primary navigation.
  const routes = [
    { path: "", priority: 1, changeFrequency: "monthly" as const },
    { path: "/solutions/ready2vote", priority: 0.9, changeFrequency: "monthly" as const },
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
