import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { NAV_MENUS } from "@/components/nav-menus";
import { NavItemMark } from "@/components/NavMenuParts";

export const metadata: Metadata = {
  title: "Research",
  description:
    "B-59's data work on Texas elections: 2026 turnout against past years, the statewide polling average, and results by county and precinct.",
  alternates: { canonical: "/research" },
  openGraph: {
    title: "Research | B-59",
    description: "Turnout, polls and results from the 2026 Texas general election.",
    url: "/research",
  },
};

/**
 * The page the Research menu's header links to: every research page, in the
 * order and with the marks and summaries the menu gives them.
 */
export default async function Research() {
  const [t, nav] = await Promise.all([getTranslations("researchIndex"), getTranslations("nav")]);
  const menu = NAV_MENUS.find((m) => m.id === "research");
  const items = menu?.groups.flatMap((g) => g.items) ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="space-y-12">
        <section>
          <h1 className="heading-xl mb-6">{nav("research")}</h1>
          <p className="body-lg max-w-2xl">{t("intro")}</p>
        </section>

        <section>
          <h2 className="heading-md mb-4">{nav("elections2026")}</h2>
          <ul className="space-y-4">
            {items.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="portfolio-card portfolio-card--marked">
                  <NavItemMark item={item} size={32} className="portfolio-card-mark" />
                  <span className="portfolio-card-body">
                    <h3 className="heading-sm">{"key" in item.label ? nav(item.label.key) : item.label.brand}</h3>
                    <p className="body-md">{nav(item.sub)}</p>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
