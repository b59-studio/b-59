import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "Our Inspirations",
  description:
    "What B-59 aspires to. Audrey Tang went from civic hacker and protester to Taiwan's first digital minister by building better government websites, and met COVID with open data. 18F made US agencies more usable by putting a design perspective in the room, and its shutdown in 2025 did not take its methods with it.",
  alternates: { canonical: "/about/inspirations" },
  openGraph: {
    title: "Our Inspirations | B-59",
    description:
      "Audrey Tang, g0v and Taiwan's open-data COVID response; 18F and the work that outlived its shutdown. The two examples B-59 takes its bearings from.",
    url: "/about/inspirations",
  },
};

const blue = (chunks: React.ReactNode) => <span className="text-b59-blue">{chunks}</span>;

export default async function OurInspirations() {
  const t = await getTranslations("inspirations");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="space-y-16">
        <section>
          <h1 className="heading-xl">{t("heading")}</h1>
        </section>

        <section>
          <h2 className="heading-lg mb-6">{t("tangHeading")}</h2>
          <div className="body-lg space-y-4">
            <p>{t.rich("tang1", { blue })}</p>
            <p>{t("tang2")}</p>
            <p>{t.rich("tang3", { blue })}</p>
          </div>
        </section>

        <section>
          <h2 className="heading-lg mb-6">{t("eighteenFHeading")}</h2>
          <div className="body-lg space-y-4">
            <p>{t("eighteenF1")}</p>
            <p>{t("eighteenF2")}</p>
            <p>{t.rich("eighteenF3", { blue })}</p>
          </div>
        </section>

        <section>
          <h2 className="heading-lg mb-6">{t("takeHeading")}</h2>
          <div className="body-lg space-y-4">
            <p>{t("take1")}</p>
            <p>{t("take2")}</p>
          </div>
          <Link href="/about/team" className="btn-primary mt-8">
            {t("cta")}
          </Link>
        </section>
      </div>
    </div>
  );
}
