import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Brand } from "@/components/Brand";
import { ContactClosing } from "@/components/ContactClosing";
import { RowArrow } from "@/components/RowArrow";

const PATH = "/studio/political-consulting";

export const metadata: Metadata = {
  title: "Progressive & Democratic Political Consulting in Austin, Texas",
  description:
    "B-59 is a progressive political consulting studio in Austin, Texas, working only with Democratic and progressive campaigns: field organizing, ballot measure petitions, data and targeting, communications, and campaign design. Led by Jonathon Reise, former Field Director for the Travis County Democratic Party.",
  alternates: { canonical: PATH },
  openGraph: {
    title: "Progressive Political Consulting in Austin | B-59",
    description: "Field organizing, ballot measure petitions, data, communications and campaign design for Democratic and progressive campaigns in Texas, from Austin.",
    url: PATH,
  },
};

const brand = () => <Brand />;
const blue = (chunks: React.ReactNode) => <span className="text-b59-blue">{chunks}</span>;

export default async function PoliticalConsulting() {
  const [t, team] = await Promise.all([getTranslations("politicalConsulting"), getTranslations("team")]);

  const facts = [
    { label: t("factBasedLabel"), value: t("factBased") },
    {
      label: t("factLeadLabel"),
      value: (
        <Link href="/about/team" className="text-link">
          {team("jonName")}
        </Link>
      ),
    },
    { label: t("factForLabel"), value: t("factFor") },
  ];

  const services = [
    { title: t("fieldTitle"), body: t("fieldBody") },
    { title: t("ballotTitle"), body: t("ballotBody") },
    { title: t("targetingTitle"), body: t("targetingBody") },
    { title: t("commsTitle"), body: t("commsBody") },
    { title: t("designTitle"), body: t("designBody") },
    { title: t("toolsTitle"), body: t("toolsBody") },
  ];

  const proof = [
    { href: "/studio/ballot-measures", title: t("proofBallotTitle"), blurb: t("proofBallotBlurb") },
    { href: "/research/2026-election-analysis", title: t("proofTurnoutTitle"), blurb: t("proofTurnoutBlurb") },
    { href: "/solutions/ready2vote", title: t("proofReady2voteTitle"), blurb: t("proofReady2voteBlurb") },
    { href: "/about/team", title: t("proofTeamTitle"), blurb: t("proofTeamBlurb") },
  ];

  return (
    <div className="home about">
      <div className="home-hero">
        <div className="home-hero-lead">
          <h1 className="home-title">{t.rich("heading", { blue })}</h1>
          <p className="home-lede">{t.rich("lede", { brand })}</p>
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

      <section className="home-section about-chapter" aria-labelledby="consulting-what">
        <h2 id="consulting-what" className="home-section-heading">
          {t("whatHeading")}
        </h2>
        <ul className="about-principles">
          {services.map((service) => (
            <li key={service.title}>
              <h3 className="about-principle-title">{service.title}</h3>
              <p className="about-principle-body">{service.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="home-section about-chapter" aria-labelledby="consulting-experience">
        <h2 id="consulting-experience" className="home-section-heading">
          {t("experienceHeading")}
        </h2>
        <div className="about-prose">
          <p>{t.rich("experienceBody", { brand })}</p>
        </div>
      </section>

      <section className="home-section about-chapter" aria-labelledby="consulting-proof">
        <h2 id="consulting-proof" className="home-section-heading">
          {t("proofHeading")}
        </h2>
        <ul className="home-list">
          {proof.map((item) => (
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

      <ContactClosing id="consulting-closing" />
    </div>
  );
}
