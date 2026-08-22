import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { getTranslations } from "next-intl/server";
import { ProjectMark } from "@/components/ProjectMark";

// Hotline's wordmark is set in Geist — load it so the name renders in-brand.
const geist = Geist({ subsets: ["latin"], weight: "700" });

export const metadata: Metadata = {
  title: "Hotline",
  description:
    "Scheduling and workforce management by B-59 for civic and public-interest teams: hand-pick a few times and share one link instead of exposing your whole calendar, then run shifts, coverage and hours in the same place. Visit hotlinecal.com.",
  alternates: { canonical: "/solutions/hotline" },
  openGraph: {
    title: "Hotline | B-59",
    description:
      "Built by B-59. Share a few times, not your whole calendar — then run the rota, coverage and hours in the same product. Works with Google, Outlook, Apple iCloud or any ICS feed. Visit hotlinecal.com.",
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
          {/* The mark beats here and only here — this is Hotline's page, and its
              own design system reserves the heartbeat for the hero. */}
          <ProjectMark project="hotline" size={72} beat className="project-mark-hero" />
          <h1 className={`heading-xl mb-3 ${geist.className}`} style={{ letterSpacing: "-0.02em" }}>
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
          <h2 className="heading-md mb-4">{t("orgHeading")}</h2>
          <p className="body-lg mb-4">{t.rich("orgIntro", { blue })}</p>
          <ul className="body-md space-y-3 list-disc pl-5">
            <li>
              <strong>{t("org1Strong")}</strong>
              {t("org1Body")}
            </li>
            <li>
              <strong>{t("org2Strong")}</strong>
              {t("org2Body")}
            </li>
            <li>
              <strong>{t("org3Strong")}</strong>
              {t("org3Body")}
            </li>
            <li>
              <strong>{t("org4Strong")}</strong>
              {t("org4Body")}
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
