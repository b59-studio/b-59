import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "Sitemap",
  description:
    "Navigate B-59's website. Links to our home page, about us, privacy policy, and terms of use. Human-centered design and civic technology.",
  alternates: { canonical: "/about/sitemap" },
  openGraph: {
    title: "Sitemap | B-59",
    description: "Find your way around B-59. Home, about, and legal pages.",
    url: "/about/sitemap",
  },
};

export default async function SiteMap() {
  const t = await getTranslations("aboutSitemap");

  const siteLinks = [
    { href: "/", label: t("linkHome") },
    { href: "/studio", label: t("linkOurWork") },
    { href: "/solutions/ready2vote", label: t("linkReady2vote") },
    { href: "/solutions/hotline", label: t("linkHotline") },
    { href: "/solutions/travis-county-vdr", label: t("linkTravisCountyVdr") },
    { href: "/solutions/voter-registration-palooza", label: t("linkVoterRegistrationPalooza") },
    { href: "/solutions/brand-design/merch", label: t("linkMerch") },
    { href: "/about", label: t("linkOurStory") },
    { href: "/about/inspirations", label: t("linkInspirations") },
    { href: "/about/team", label: t("linkTeam") },
    { href: "/solutions/brand-design/philosophy", label: t("linkBrandDesignPhilosophy") },
    { href: "/donate", label: t("linkDonate") },
    { href: "/about/privacy", label: t("linkPrivacyPolicy") },
    { href: "/about/terms", label: t("linkTermsOfUse") },
  ] as const;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h1 className="heading-xl mb-4">{t("heading")}</h1>
      <p className="body-lg text-secondary mb-8 max-w-2xl">
        {t.rich("intro", {
          email: (chunks) => (
            <a href="mailto:contact@b-59.com" className="text-b59-blue underline">
              {chunks}
            </a>
          ),
        })}
      </p>
      <ul className="space-y-3">
        {siteLinks.map(({ href, label }) => (
          <li key={href}>
            <Link href={href} className="nav-link text-lg">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
