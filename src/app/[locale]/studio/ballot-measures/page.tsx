import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Brand } from "@/components/Brand";
import { ContactClosing } from "@/components/ContactClosing";
import { RowArrow } from "@/components/RowArrow";

const PATH = "/studio/ballot-measures";

export const metadata: Metadata = {
  title: "Ballot Measure & Petition Campaigns in Austin, Texas",
  description:
    "How a citizen petition reaches the Austin ballot, and the progressive consulting studio that runs them. 20,000 signatures from registered Austin voters, the fields every line needs, how the City Clerk verifies, and what happens next.",
  alternates: { canonical: PATH },
  openGraph: {
    title: "Ballot Measures & Petitions in Austin | B-59",
    description:
      "Petition drives that put progressive propositions on the Austin ballot, and a plain account of how the process works.",
    url: PATH,
  },
};

/**
 * Every rule on this page is the City Clerk's or the Secretary of State's own
 * statement of it, linked below the steps. When a rule changes, change it here
 * and update the date in `checked`.
 */
const SOURCES = [
  { key: "sourceClerkInitiative", href: "https://www.austintexas.gov/clerk/initiative-petitions" },
  { key: "sourceClerkCharter", href: "https://www.austintexas.gov/clerk/charter-amendment-petitions" },
  { key: "sourceClerkPetitions", href: "https://www.austintexas.gov/department/petitions" },
  { key: "sourceSos", href: "https://www.sos.texas.gov/elections/laws/petitions.shtml" },
  { key: "sourceConstitution", href: "https://statutes.capitol.texas.gov/Docs/CN/htm/CN.17.htm" },
] as const;

/** Past Austin propositions that reached the ballot by petition, with their outcomes. */
const EXAMPLES = [
  {
    key: "example2023",
    href: "https://www.austinchronicle.com/daily/news/2023-04-20/understanding-prop-a-and-b-and-the-policing-paradigm-shift-on-the-ballot",
  },
  {
    key: "example2022",
    href: "https://ballotpedia.org/Austin,_Texas,_Marijuana_Decriminalization_and_Prohibit_No-Knock_Warrants_Initiative_(2022)",
  },
  {
    key: "example2021",
    href: "https://ballotpedia.org/Austin,_Texas,_Proposition_B,_Prohibition_on_Sitting,_Lying,_and_Camping_and_Limiting_Solicitation_in_Public_Areas_Initiative_(May_2021)",
  },
] as const;

const brand = () => <Brand />;
const blue = (chunks: React.ReactNode) => <span className="text-b59-blue">{chunks}</span>;

export default async function BallotMeasures() {
  const t = await getTranslations("ballotMeasures");

  const facts = [
    { label: t("factSignaturesLabel"), value: t("factSignatures") },
    { label: t("factWindowLabel"), value: t("factWindow") },
    { label: t("factCheckLabel"), value: t("factCheck") },
  ];

  const steps = (["step1", "step2", "step3", "step4", "step5"] as const).map((k) => ({
    title: t(`${k}Title`),
    body: t(`${k}Body`),
  }));

  const services = (["plan", "circulators", "validation", "campaign"] as const).map((k) => ({
    title: t(`${k}Title`),
    body: t(`${k}Body`),
  }));

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

      <section className="home-section about-chapter" aria-labelledby="ballot-how">
        <h2 id="ballot-how" className="home-section-heading">
          {t("howHeading")}
        </h2>
        <div>
          <ol className="about-principles">
            {steps.map((step) => (
              <li key={step.title}>
                <h3 className="about-principle-title">{step.title}</h3>
                <p className="about-principle-body">{step.body}</p>
              </li>
            ))}
          </ol>
          <div className="about-prose mt-8">
            <p className="home-meta">{t("sourcesIntro")}</p>
            <ul className="home-meta space-y-1">
              {SOURCES.map((source) => (
                <li key={source.key}>
                  <a href={source.href} className="text-link" target="_blank" rel="noopener noreferrer">
                    {t(source.key)}
                    <span className="sr-only">{t("opensNewWindow")}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="home-section about-chapter" aria-labelledby="ballot-what">
        <h2 id="ballot-what" className="home-section-heading">
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

      <section className="home-section about-chapter" aria-labelledby="ballot-examples">
        <h2 id="ballot-examples" className="home-section-heading">
          {t("examplesHeading")}
        </h2>
        <ul className="home-list">
          {EXAMPLES.map((example) => (
            <li key={example.key}>
              <a href={example.href} className="home-row" target="_blank" rel="noopener noreferrer">
                <span className="home-row-body">
                  <span className="about-row-title">{t(`${example.key}Title`)}</span>
                  <span className="home-meta">{t(`${example.key}Body`)}</span>
                </span>
                <span className="sr-only">{t("opensNewWindow")}</span>
                <RowArrow />
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="home-section about-chapter" aria-labelledby="ballot-more">
        <h2 id="ballot-more" className="home-section-heading">
          {t("moreHeading")}
        </h2>
        <div className="about-prose">
          <p>{t.rich("moreBody", { brand })}</p>
          <Link href="/studio/political-consulting" className="home-text-action">
            {t("moreLink")}
            <RowArrow />
          </Link>
          <p className="home-meta">{t("checked")}</p>
        </div>
      </section>

      <ContactClosing id="ballot-closing" />
    </div>
  );
}
