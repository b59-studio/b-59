import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Brand } from "@/components/Brand";
import { LegalTranslationNotice } from "@/components/LegalTranslationNotice";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "B-59 website terms of use. Use of the site, intellectual property, limitations of liability, and governing law. By using this site you agree to these terms.",
  alternates: { canonical: "/about/terms" },
  openGraph: {
    title: "Terms of Use | B-59",
    description:
      "Terms of use for the B-59 website. Informational use, intellectual property, and legal information.",
    url: "/about/terms",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const brand = () => <Brand />;

export default async function Terms() {
  const t = await getTranslations("terms");
  const locale = await getLocale();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h1 className="heading-xl mb-12 text-center">{t("heading")}</h1>

      <LegalTranslationNotice enHref="/about/terms" />

      <div className="space-y-10" lang={locale}>
        <p className="body-md text-secondary">{t("lastUpdated")}</p>

        <p className="body-lg">{t("intro")}</p>

        <section className="space-y-4">
          <h2 className="heading-lg">{t("useOfSiteHeading")}</h2>
          <p className="body-md">{t("useOfSiteBody")}</p>
        </section>

        <section className="space-y-4">
          <h2 className="heading-lg">{t("ipHeading")}</h2>
          <p className="body-md">{t.rich("ipBody", { brand })}</p>
        </section>

        <section className="space-y-4">
          <h2 className="heading-lg">{t("noWarrantiesHeading")}</h2>
          <p className="body-md">{t("noWarrantiesBody")}</p>
        </section>

        <section className="space-y-4">
          <h2 className="heading-lg">{t("liabilityHeading")}</h2>
          <p className="body-md">{t.rich("liabilityBody", { brand })}</p>
        </section>

        <section className="space-y-4">
          <h2 className="heading-lg">{t("externalLinksHeading")}</h2>
          <p className="body-md">{t("externalLinksBody")}</p>
        </section>

        <section className="space-y-4">
          <h2 className="heading-lg">{t("changesHeading")}</h2>
          <p className="body-md">{t("changesBody")}</p>
        </section>

        <section className="space-y-4">
          <h2 className="heading-lg">{t("governingLawHeading")}</h2>
          <p className="body-md">{t("governingLawBody")}</p>
        </section>

        <section className="space-y-4">
          <h2 className="heading-lg">{t("contactHeading")}</h2>
          <p className="body-md mb-8">
            {t.rich("contactBody", {
              email: (chunks) => (
                <a href="mailto:contact@b-59.com" className="text-link" dir="ltr">
                  {chunks}
                </a>
              ),
            })}
          </p>
        </section>
      </div>
    </div>
  );
}
