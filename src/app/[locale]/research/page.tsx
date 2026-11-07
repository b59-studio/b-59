import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { defaultLocale } from "@/i18n/config";
import { NAV_MENUS } from "@/components/nav-menus";
import { NavItemMark, NavItemName } from "@/components/NavMenuParts";
import { IndexPage, IndexSection, type IndexEntry } from "@/components/IndexList";

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
  const [locale, t, nav, research] = await Promise.all([
    getLocale(),
    getTranslations("researchIndex"),
    getTranslations("nav"),
    getTranslations("research"),
  ]);
  const menu = NAV_MENUS.find((m) => m.id === "research");
  const items = menu?.groups.flatMap((g) => g.items) ?? [];

  // The research is published in English only, so other locales say so once.
  const englishOnly = locale !== defaultLocale;

  const entries: IndexEntry[] = items.map((item) => ({
    href: item.href,
    mark: <NavItemMark item={item} size={40} />,
    title: <NavItemName item={item} t={nav} />,
    blurb: nav(item.sub),
    hrefLang: "en",
  }));

  return (
    <IndexPage title={nav("research")} lede={t("intro")}>
      <IndexSection
        id="research-2026"
        heading={nav("elections2026")}
        note={englishOnly ? research("englishOnly") : undefined}
        entries={entries}
        locale={locale}
      />
    </IndexPage>
  );
}
