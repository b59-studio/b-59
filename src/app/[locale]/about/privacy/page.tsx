import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Brand } from "@/components/Brand";
import { LegalTranslationNotice } from "@/components/LegalTranslationNotice";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "B-59 Studio LLC privacy policy. How we collect, use, and protect your information when you visit our website. We do not sell personal information.",
  alternates: { canonical: "/about/privacy" },
  openGraph: {
    title: "Privacy Policy | B-59",
    description:
      "How B-59 collects, uses, and protects your information. We respect your privacy and do not sell personal data.",
    url: "/about/privacy",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const brand = () => <Brand />;

export default async function Privacy() {
  const t = await getTranslations("privacy");
  const locale = await getLocale();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h1 className="heading-xl mb-12 text-center">{t("heading")}</h1>

      <LegalTranslationNotice enHref="/about/privacy" />

      <div className="space-y-10" lang={locale}>
        <p className="body-md text-secondary">{t("lastUpdated")}</p>

        <p className="body-lg">{t.rich("intro", { brand })}</p>

        <section className="space-y-4">
          <h2 className="heading-lg">{t("collectHeading")}</h2>
          <p className="body-md">{t("collect1")}</p>
          <p className="body-md">{t("collect2")}</p>
        </section>

        <section className="space-y-4">
          <h2 className="heading-lg">{t("useHeading")}</h2>
          <p className="body-md">{t("useIntro")}</p>
          <ul className="list-disc ps-6 space-y-2 body-md">
            <li>{t("useItem1")}</li>
            <li>{t("useItem2")}</li>
            <li>{t("useItem3")}</li>
          </ul>
          <p className="body-md heading-sm">{t("noSell")}</p>
        </section>

        <section className="space-y-4">
          <h2 className="heading-lg">{t("cookiesHeading")}</h2>
          <p className="body-md">{t("cookiesBody")}</p>
        </section>

        <section className="space-y-4">
          <h2 className="heading-lg">{t("sharingHeading")}</h2>
          <p className="body-md">{t("sharingBody")}</p>
        </section>

        <section className="space-y-4">
          <h2 className="heading-lg">{t("securityHeading")}</h2>
          <p className="body-md">{t("securityBody")}</p>
        </section>

        <section className="space-y-4">
          <h2 className="heading-lg">{t("choicesHeading")}</h2>
          <p className="body-md">{t("choicesBody")}</p>
        </section>

        <section className="space-y-4">
          <h2 className="heading-lg">{t("changesHeading")}</h2>
          <p className="body-md">{t("changesBody")}</p>
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
