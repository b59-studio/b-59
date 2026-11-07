import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AboutSectionNav } from "@/components/AboutSectionNav";
import { Brand } from "@/components/Brand";
import { ContactClosing } from "@/components/ContactClosing";
import { RowArrow } from "@/components/RowArrow";

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
  const [t, inspirations, team] = await Promise.all([
    getTranslations("about"),
    getTranslations("inspirations"),
    getTranslations("team"),
  ]);

  const facts = [
    { label: t("factBasedLabel"), value: t("factBased") },
    {
      label: t("factTeamLabel"),
      value: (
        <Link href="/about/team" className="text-link">
          {team("jonName")}
        </Link>
      ),
    },
    { label: t("factForLabel"), value: t("factFor") },
  ];

  const principles = [
    { title: t("principle1Title"), body: t("howWeWork1") },
    { title: t("principle2Title"), body: t("howWeWork2") },
    { title: t("principle3Title"), body: t("believeBody") },
  ];

  const influences = [
    { href: "/about/inspirations#tang", title: inspirations("tangHeading"), blurb: inspirations("tangSummary") },
    { href: "/about/inspirations#18f", title: inspirations("eighteenFHeading"), blurb: inspirations("eighteenFSummary") },
  ];

  return (
    <div className="home about">
      <AboutSectionNav current="story" />

      <div className="home-hero">
        <div className="home-hero-lead">
          <h1 className="home-title">{t("title")}</h1>
          <p className="home-lede">{t.rich("intro1", { blue })}</p>
        </div>

        <dl className="about-facts">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="home-meta">{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <section className="home-section about-chapter" aria-labelledby="about-mission">
        <h2 id="about-mission" className="home-section-heading">
          {t("missionHeading")}
        </h2>
        <p className="about-statement">{t.rich("missionBody", { brand, blue })}</p>
      </section>

      <section className="home-section about-chapter" aria-labelledby="about-how">
        <h2 id="about-how" className="home-section-heading">
          {t("howWeWorkHeading")}
        </h2>
        <ol className="about-principles">
          {principles.map((principle) => (
            <li key={principle.title}>
              <h3 className="about-principle-title">{principle.title}</h3>
              <p className="about-principle-body">{principle.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="home-section about-chapter" aria-labelledby="about-why">
        <h2 id="about-why" className="home-section-heading">
          {t.rich("whyHeading", { brand })}
        </h2>
        <div className="about-story">
          <p className="about-year" aria-hidden="true">
            1962
          </p>
          <div className="about-prose">
            <p>
              {t.rich("why1", {
                sub: () => (
                  <a href="https://en.wikipedia.org/wiki/Soviet_submarine_B-59" className="text-link font-semibold">
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
        </div>
      </section>

      <section className="home-section about-chapter" aria-labelledby="about-learn">
        <h2 id="about-learn" className="home-section-heading">
          {inspirations("heading")}
        </h2>
        <ul className="home-list">
          {influences.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="home-row">
                <span className="home-row-body">
                  <span className="about-row-title">{item.title}</span>
                  <span className="home-meta">{item.blurb}</span>
                </span>
                <RowArrow />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="home-section about-chapter" aria-labelledby="about-team">
        <h2 id="about-team" className="home-section-heading">
          {t("teamHeading")}
        </h2>
        <ul className="home-list">
          <li>
            <Link href="/about/team" className="home-row">
              <span className="home-row-body">
                <span className="about-row-title">{team("jonName")}</span>
                <span className="home-meta">{team("jonRole")}</span>
              </span>
              <RowArrow />
            </Link>
          </li>
        </ul>
      </section>

      <ContactClosing id="about-closing" />
    </div>
  );
}
