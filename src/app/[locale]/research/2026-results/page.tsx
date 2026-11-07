import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { ResultsView } from "@/components/research/results-2026/ResultsView";
import { JsonLd } from "@/components/JsonLd";
import { defaultLocale } from "@/i18n/config";
import { countyStatuses, defaultRace, raceDetail, raceIndex } from "@/lib/results-2026/present";
import { getSnapshot } from "@/lib/results-2026/snapshot";
import { resolveSiteUrl } from "@/lib/site-url";
import { datasetJsonLd } from "@/lib/structured-data";

// Rendered per request: the sources are read live, at most every two minutes
// per server instance (REFRESH_SECONDS in snapshot.ts), and the page refreshes
// itself in the browser on the same beat. Static rendering would bake in
// whatever was counted at build time.
export const dynamic = "force-dynamic";

const PATH = "/research/2026-results";
const DESCRIPTION =
  "Results of the November 3, 2026 Texas general election, unofficial until canvassed, race by race: statewide totals, 19 counties from their own results systems, and precinct detail where counties publish it.";

export const metadata: Metadata = {
  title: "2026 Texas Election Results",
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    title: "2026 Texas Election Results | B-59",
    description: "Race-by-race results for Texas, by county and precinct, refreshed every two minutes.",
    url: PATH,
  },
};

const DATASET = datasetJsonLd({
  siteUrl: resolveSiteUrl(),
  path: PATH,
  name: "2026 Texas Election Results",
  description: DESCRIPTION,
  temporalCoverage: "2026-11-03",
  keywords: ["Texas election results", "2026 Texas general election", "county results", "precinct results"],
});

export default async function Results2026() {
  const [locale, t, snapshot] = await Promise.all([getLocale(), getTranslations("research"), getSnapshot()]);
  const index = raceIndex(snapshot);
  const key = defaultRace(index);
  const race = key ? raceDetail(snapshot, key) : null;

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <JsonLd data={DATASET} />
      {locale !== defaultLocale && (
        <p role="note" className="callout-gray body-sm mb-8">
          {t("englishOnly")}
        </p>
      )}
      <ResultsView index={index} initial={{ readAt: snapshot.readAt, official: snapshot.official, race, counties: countyStatuses(snapshot) }} />
    </div>
  );
}
