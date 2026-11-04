import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { PollsPage } from "@/components/research/polls-2026/PollsPage";
import { defaultLocale } from "@/i18n/config";

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
  const [locale, t] = await Promise.all([getLocale(), getTranslations("research")]);

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {locale !== defaultLocale && (
        <p role="note" className="callout-gray body-sm mb-8">
          {t("englishOnly")}
        </p>
      )}
      <PollsPage />
    </div>
  );
}
