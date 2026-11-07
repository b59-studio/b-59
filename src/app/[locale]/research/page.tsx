import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { defaultLocale } from "@/i18n/config";
import { NAV_MENUS } from "@/components/nav-menus";
import { NavItemMark, NavItemName } from "@/components/NavMenuParts";
import { IndexPage, IndexSection, type IndexEntry } from "@/components/IndexList";

export const metadata: Metadata = {
  title: "Research",
  description:
    "B-59's data work on Texas elections and Austin ballot petitions: 2026 turnout against past years, the statewide polling average, results by county and precinct, and what it takes to qualify a petition in Austin.",
  alternates: { canonical: "/research" },
  openGraph: {
    title: "Research | B-59",
    description: "Turnout, polls and results from the 2026 Texas general election, and the numbers behind Austin ballot petitions.",
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
  const groups = menu?.groups ?? [];

  // The research is published in English only, so other locales say so once.
  const englishOnly = locale !== defaultLocale;

  const entriesOf = (group: (typeof groups)[number]): IndexEntry[] =>
    group.items.map((item) => ({
      href: item.href,
      mark: (size) => <NavItemMark item={item} size={size} />,
      title: <NavItemName item={item} t={nav} />,
      blurb: nav(item.sub),
      hrefLang: "en",
    }));

  return (
    <IndexPage title={nav("research")} lede={t("intro")}>
      {groups.map((group, i) => (
        <IndexSection
          key={group.items[0]?.href ?? i}
          id={`research-${i + 1}`}
          heading={group.heading ? nav(group.heading) : undefined}
          note={englishOnly && i === 0 ? research("englishOnly") : undefined}
          entries={entriesOf(group)}
        />
      ))}
    </IndexPage>
  );
}
