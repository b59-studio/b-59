import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Brand } from "@/components/Brand";

export const metadata: Metadata = {
  title: "About",
  description:
    "B-59 designs and builds civic software that works—for voter access, courts, administrative processes, and public transparency. We modernize civic infrastructure thoughtfully. Learn our mission, how we work, and why we're named B-59.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About B-59",
    description:
      "We design and build civic software that actually works. Democracy isn't something you improvise—it's something you design. Mission, values, and the story behind the name.",
    url: "/about",
  },
};

const blue = (chunks: React.ReactNode) => <span className="text-b59-blue">{chunks}</span>;
const brand = () => <Brand />;

export default async function About() {
  const t = await getTranslations("about");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="space-y-16">
        <section>
          <h1 className="heading-xl mb-6">{t.rich("heading", { brand })}</h1>
          <div className="body-lg space-y-4">
            <p>{t.rich("intro1", { blue })}</p>
            <p>{t("intro2")}</p>
          </div>
        </section>

        <section>
          <h2 className="heading-lg mb-6">{t("missionHeading")}</h2>
          <div className="body-lg space-y-4">
            <p>{t.rich("missionBody", { brand, blue })}</p>
          </div>
        </section>

        <section>
          <h2 className="heading-lg mb-6">{t("howWeWorkHeading")}</h2>
          <div className="body-lg space-y-4">
            <p>{t("howWeWork1")}</p>
            <p>{t("howWeWork2")}</p>
            <p>{t("howWeWork3")}</p>
          </div>
        </section>

        <section>
          <h2 className="heading-lg mb-6">{t.rich("whyHeading", { brand })}</h2>
          <div className="body-lg space-y-4">
            <p>
              {t.rich("why1", {
                sub: () => (
                  <a
                    href="https://en.wikipedia.org/wiki/Soviet_submarine_B-59"
                    className="text-link font-semibold"
                  >
                    {t.rich("whySubLink", { brand })}
                  </a>
                ),
                arkhipov: () => (
                  <a href="https://en.wikipedia.org/wiki/Vasily_Arkhipov" className="text-link font-semibold">
                    {t("whyArkhipovLink")}
                  </a>
                ),
              })}
            </p>
            <p>{t("why2")}</p>
          </div>
        </section>

        <section>
          <h2 className="heading-lg mb-6">{t("believeHeading")}</h2>
          <div className="body-lg space-y-4">
            <p>{t("believeBody")}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
