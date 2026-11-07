import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AboutSectionNav } from "@/components/AboutSectionNav";
import { RowArrow } from "@/components/RowArrow";

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
    <div className="home about">
      <AboutSectionNav current="inspirations" />

      <div className="home-hero">
        <div className="home-hero-lead">
          <h1 className="home-title">{t("heading")}</h1>
          <p className="home-lede">{t("lede")}</p>
        </div>
      </div>

      <section id="tang" className="home-section about-chapter" aria-labelledby="inspirations-tang">
        <h2 id="inspirations-tang" className="about-chapter-title">
          {t("tangHeading")}
        </h2>
        <div className="about-prose">
          <p>{t.rich("tang1", { blue })}</p>
          <p>{t("tang2")}</p>
          <p>{t.rich("tang3", { blue })}</p>
        </div>
      </section>

      <section id="18f" className="home-section about-chapter" aria-labelledby="inspirations-18f">
        <h2 id="inspirations-18f" className="about-chapter-title">
          {t("eighteenFHeading")}
        </h2>
        <div className="about-prose">
          <p>{t("eighteenF1")}</p>
          <p>{t("eighteenF2")}</p>
          <p>{t.rich("eighteenF3", { blue })}</p>
        </div>
      </section>

      <section className="home-section about-chapter" aria-labelledby="inspirations-take">
        <h2 id="inspirations-take" className="home-section-heading">
          {t("takeHeading")}
        </h2>
        <div>
          <p className="about-statement">{t("take1")}</p>
          <p className="about-statement about-statement--quiet">{t("take2")}</p>
        </div>
      </section>

      <section className="home-section" aria-label={t("cta")}>
        <ul className="home-list">
          <li>
            <Link href="/about/team" className="home-row">
              <span className="about-row-title">{t("cta")}</span>
              <RowArrow />
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
