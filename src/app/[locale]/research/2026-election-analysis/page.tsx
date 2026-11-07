import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { ElectionAnalysis } from "@/components/research/election-2026/ElectionAnalysis";
import { defaultLocale } from "@/i18n/config";
import { fetchLiveSnapshot } from "@/lib/election-2026/electionlink";
import { finalByGeo } from "@/lib/results-2026/final";
import { getStateResults } from "@/lib/results-2026/snapshot";

// Rendered per request: the 2026 count is read from the Secretary of State as
// it moves toward canvass (at most every two minutes per server instance), and
// the tracker readings are cached for 15 minutes in the fetch cache.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "2026 Texas Turnout Comparison",
  description:
    "Turnout and results in every Texas county for the November 3, 2026 general election, against 2018, 2022 and 2024: early vote, election-day trackers, margins for the top of the ticket and down-ballot races, and primaries since 2016.",
  alternates: { canonical: "/research/2026-election-analysis" },
  openGraph: {
    title: "2026 Texas Turnout Comparison | B-59",
    description:
      "Early vote, live election-day turnout and results since 2016 for every Texas county, led by 17 focus counties.",
    url: "/research/2026-election-analysis",
  },
};

export default async function ElectionAnalysis2026() {
  const [locale, t, snapshot, state] = await Promise.all([
    getLocale(),
    getTranslations("research"),
    fetchLiveSnapshot(),
    getStateResults().catch((error: unknown) => {
      console.error("2026 count unavailable for the analysis page", error);
      return null;
    }),
  ]);
  const final = state ? finalByGeo(state.counties, state.official, state.readAt) : null;

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {locale !== defaultLocale && (
        <p role="note" className="callout-gray body-sm mb-8">
          {t("englishOnly")}
        </p>
      )}
      <ElectionAnalysis snapshot={snapshot} final={final} />
    </div>
  );
}
