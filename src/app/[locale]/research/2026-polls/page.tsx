import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { PollsPage } from "@/components/research/polls-2026/PollsPage";
import { defaultLocale } from "@/i18n/config";
import type { PollResults } from "@/components/research/polls-2026/PollsVsResults";
import { CORE, DATA } from "@/components/research/election-2026/data";
import { finalByGeo, POLL_RACE_KEYS, statewideShares } from "@/lib/results-2026/final";
import { getStateResults } from "@/lib/results-2026/snapshot";

// Rendered per request: the polls are compared with the state's count as it
// moves toward canvass, read at most every two minutes per server instance.
export const dynamic = "force-dynamic";

async function pollResults(): Promise<PollResults | null> {
  const state = await getStateResults().catch((error: unknown) => {
    console.error("2026 count unavailable for the polls page", error);
    return null;
  });
  if (!state) return null;
  const final = finalByGeo(state.counties, state.official, state.readAt);
  return {
    results: Object.fromEntries(Object.entries(POLL_RACE_KEYS).map(([id, match]) => [id, statewideShares(state.counties, match)])),
    turnout: ["Statewide", ...CORE].flatMap((geo) =>
      final.geos[geo] && DATA.ev[geo] ? [{ geo, early: DATA.ev[geo][3], ballots: final.geos[geo].ballots }] : [],
    ),
    official: state.official,
    readAt: state.readAt,
  };
}

export const metadata: Metadata = {
  title: "2026 Texas Polls",
  description:
    "Public polls of the 2026 Texas statewide races, from U.S. Senate to Railroad Commissioner: a recency- and sample-weighted average, its trend, and every poll linked to its source.",
  alternates: { canonical: "/research/2026-polls" },
  openGraph: {
    title: "2026 Texas Polls | B-59",
    description: "A simple, explained average of the public polls of the 2026 Texas statewide races, with every poll linked.",
    url: "/research/2026-polls",
  },
};

export default async function Polls2026() {
  const [locale, t, results] = await Promise.all([getLocale(), getTranslations("research"), pollResults()]);

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {locale !== defaultLocale && (
        <p role="note" className="callout-gray body-sm mb-8">
          {t("englishOnly")}
        </p>
      )}
      <PollsPage results={results} />
    </div>
  );
}
