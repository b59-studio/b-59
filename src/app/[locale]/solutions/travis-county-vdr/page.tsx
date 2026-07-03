import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Brand } from "@/components/Brand";

export const metadata: Metadata = {
  title: "Travis County VDR Toolkit",
  description:
    "A civic project by B-59. We rebuilt the Travis County Voter Registration Toolkit — the resource hub for Volunteer Deputy Registrars — migrating a legacy site into a fast, accessible, installable web app.",
  alternates: { canonical: "/solutions/travis-county-vdr" },
  openGraph: {
    title: "Travis County VDR Toolkit | B-59",
    description:
      "Built by B-59. A modern, accessible rebuild of the Travis County Voter Registration Toolkit for Volunteer Deputy Registrars.",
    url: "/solutions/travis-county-vdr",
  },
};

const brand = () => <Brand />;
const blue = (chunks: React.ReactNode) => <span className="text-b59-blue">{chunks}</span>;

export default async function TravisCountyVdr() {
  const t = await getTranslations("solutionsTravisCountyVdr");
  const strong1 = () => <strong>{t("intro1Strong")}</strong>;
  const strong3 = () => <strong>{t("item3Strong")}</strong>;
  const strong4 = () => <strong>{t("item4Strong")}</strong>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="space-y-12">
        <section>
          <h1 className="heading-xl mb-6">{t("heading")}</h1>
          <div className="body-lg space-y-4">
            <p>{t.rich("intro1", { strong: strong1 })}</p>
            <p>{t.rich("intro2", { brand })}</p>
          </div>
        </section>

        <section>
          <h2 className="heading-md mb-4">{t("whatWeDidHeading")}</h2>
          <ul className="body-md space-y-3 list-disc pl-5">
            <li>{t("item1")}</li>
            <li>{t("item2")}</li>
            <li>{t.rich("item3", { strong: strong3 })}</li>
            <li>{t.rich("item4", { strong: strong4 })}</li>
            <li>{t("item5")}</li>
          </ul>
        </section>

        <section>
          <h2 className="heading-md mb-4">{t("whyHeading")}</h2>
          <div className="body-lg space-y-4">
            <p>{t.rich("why1", { blue })}</p>
            <p>{t.rich("why2", { blue })}</p>
          </div>
          <a
            href="https://travis-county-vdr.vercel.app"
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
