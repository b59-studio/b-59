import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Brand Design Philosophy",
  description:
    "How B-59 approaches brand design. A brand is a set of decisions about how an organization shows up — clarity before polish, restraint as strategy, systems built to be used, and neutrality by default. For campaigns, committees, firms, and institutions where trust is the whole game.",
  alternates: { canonical: "/solutions/brand-design/philosophy" },
  openGraph: {
    title: "Brand Design Philosophy | B-59",
    description:
      "A brand is not a logo. It's a set of decisions about how an organization shows up. How B-59 designs brands for campaigns, committees, firms, and institutions where trust is the whole game.",
    url: "/solutions/brand-design/philosophy",
  },
};

const blue = (chunks: React.ReactNode) => <span className="text-b59-blue">{chunks}</span>;

export default async function BrandPhilosophy() {
  const t = await getTranslations("brandPhilosophy");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="space-y-16">
        <section>
          <h1 className="heading-xl mb-6">{t("heading")}</h1>
          <div className="body-lg space-y-4">
            <p>{t.rich("intro", { blue })}</p>
          </div>
        </section>

        <section>
          <h2 className="heading-lg mb-6">{t("clarityHeading")}</h2>
          <div className="body-lg space-y-4">
            <p>{t.rich("clarityBody", { blue })}</p>
          </div>
        </section>

        <section>
          <h2 className="heading-lg mb-6">{t("restraintHeading")}</h2>
          <div className="body-lg space-y-4">
            <p>{t.rich("restraintBody", { blue })}</p>
          </div>
        </section>

        <section>
          <h2 className="heading-lg mb-6">{t("builtHeading")}</h2>
          <div className="body-lg space-y-4">
            <p>{t.rich("builtBody", { blue })}</p>
          </div>
        </section>

        <section>
          <h2 className="heading-lg mb-6">{t("alignedHeading")}</h2>
          <div className="body-lg space-y-4">
            <p>{t.rich("alignedBody", { blue })}</p>
          </div>
          <a href="mailto:contact@b-59.com" className="btn-primary mt-8">
            {t("cta")}
          </a>
        </section>
      </div>
    </div>
  );
}
