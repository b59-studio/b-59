import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { ElectionAnalysis } from "@/components/research/election-2026/ElectionAnalysis";
import { defaultLocale } from "@/i18n/config";
import { fetchLiveSnapshot } from "@/lib/election-2026/electionlink";

// The county trackers are reread at most every 15 minutes (LIVE_REVALIDATE_SECONDS).
// A literal, because Next reads this export statically.
export const revalidate = 900;

export const metadata: Metadata = {
  title: "2026 Texas Election Analysis",
  description:
    "Turnout in 17 Texas counties for the November 3, 2026 general election: early vote, live election-day tracker counts, primaries and down-ballot margins since 2016.",
  alternates: { canonical: "/research/2026-election-analysis" },
  openGraph: {
    title: "2026 Texas Election Analysis | B-59",
    description:
      "Early vote, live election-day turnout and results since 2016 for 17 Texas counties, with Travis and statewide as benchmarks.",
    url: "/research/2026-election-analysis",
  },
};

export default async function ElectionAnalysis2026() {
  const [locale, t, snapshot] = await Promise.all([getLocale(), getTranslations("research"), fetchLiveSnapshot()]);

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {locale !== defaultLocale && (
        <p role="note" className="callout-gray body-sm mb-8">
          {t("englishOnly")}
        </p>
      )}
      <ElectionAnalysis snapshot={snapshot} />
    </div>
  );
}
