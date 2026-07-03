import type { Metadata } from "next";
import Image from "next/image";
import { Space_Grotesk } from "next/font/google";
import { getTranslations } from "next-intl/server";

// Hotline's wordmark is set in Space Grotesk — load it so the name renders in-brand.
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: "700" });

export const metadata: Metadata = {
  title: "Hotline",
  description:
    "Hotline is a scheduling product by B-59 for civic and public-interest teams, whose calendars are sensitive. Instead of exposing your whole calendar, hand-pick a few times and share one link — the other person taps one. Works with iCloud or Outlook, no Google required. Visit hotlinecal.com.",
  alternates: { canonical: "/solutions/hotline" },
  openGraph: {
    title: "Hotline | B-59",
    description:
      "Built by B-59. Scheduling for civic and public-interest teams: share a few times, not your whole calendar. Works with iCloud or Outlook, no Google required. Visit hotlinecal.com.",
    url: "/solutions/hotline",
  },
};

const blue = (chunks: React.ReactNode) => <span className="text-b59-blue">{chunks}</span>;

export default async function Hotline() {
  const t = await getTranslations("solutionsHotline");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="space-y-12">
        <section>
          <Image
            src="/hotline-signal.svg"
            alt="Hotline"
            width={72}
            height={72}
            className="mb-6"
            priority
          />
          <h1
            className={`heading-xl mb-3 ${spaceGrotesk.className}`}
            style={{ letterSpacing: "-0.02em" }}
          >
            Hotline
          </h1>
          <p className="body-md text-b59-gray mb-6">{t("tagline")}</p>
          <div className="body-lg space-y-4">
            <p>{t.rich("intro1", { blue })}</p>
            <p>{t.rich("intro2", { blue })}</p>
          </div>
        </section>

        <section>
          <h2 className="heading-md mb-4">{t("differentHeading")}</h2>
          <ul className="body-md space-y-3 list-disc pl-5">
            <li>
              <strong>{t("diff1Strong")}</strong>
              {t("diff1Body")}
            </li>
            <li>
              <strong>{t("diff2Strong")}</strong>
              {t("diff2Body")}
            </li>
            <li>
              <strong>{t("diff3Strong")}</strong>
              {t("diff3Body")}
            </li>
            <li>
              <strong>{t("diff4Strong")}</strong>
              {t("diff4Body")}
            </li>
          </ul>
        </section>

        <section>
          <h2 className="heading-md mb-4">{t("whyHeading")}</h2>
          <div className="body-lg space-y-4">
            <p>{t.rich("why1", { blue })}</p>
            <p>{t.rich("why2", { blue })}</p>
          </div>
        </section>

        <section>
          <a
            href="https://hotlinecal.com"
            className="btn-secondary mt-8"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("cta")}
          </a>
        </section>
      </div>
    </div>
  );
}
