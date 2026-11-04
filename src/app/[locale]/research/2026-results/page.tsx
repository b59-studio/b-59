import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { ResultsView } from "@/components/research/results-2026/ResultsView";
import { defaultLocale } from "@/i18n/config";
import { countyStatuses, defaultRace, raceDetail, raceIndex } from "@/lib/results-2026/present";
import { getSnapshot } from "@/lib/results-2026/snapshot";

// Rendered per request: the sources are read live, at most every two minutes
// per server instance (REFRESH_SECONDS in snapshot.ts), and the page refreshes
// itself in the browser on the same beat. Static rendering would bake in
// whatever was counted at build time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "2026 Texas Live Results",
  description:
    "Live, unofficial results of the November 3, 2026 Texas general election, race by race: statewide totals, 19 counties from their own results systems, and precinct detail where counties publish it.",
  alternates: { canonical: "/research/2026-results" },
  openGraph: {
    title: "2026 Texas Live Results | B-59",
    description: "Race-by-race results for Texas, by county and precinct, refreshed every two minutes.",
    url: "/research/2026-results",
  },
};

export default async function Results2026() {
  const [locale, t, snapshot] = await Promise.all([getLocale(), getTranslations("research"), getSnapshot()]);
  const index = raceIndex(snapshot);
  const key = defaultRace(index);
  const race = key ? raceDetail(snapshot, key) : null;

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {locale !== defaultLocale && (
        <p role="note" className="callout-gray body-sm mb-8">
          {t("englishOnly")}
        </p>
      )}
      <ResultsView index={index} initial={{ readAt: snapshot.readAt, race, counties: countyStatuses(snapshot) }} />
    </div>
  );
}
