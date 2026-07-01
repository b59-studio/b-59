import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brand Portfolio",
  description:
    "Selected brand design work by B-59 for political campaigns, PACs, law firms, and advocacy coalitions. Identity systems, brand refreshes, and field-ready collateral built for organizations where trust is the whole game.",
  // Built but not public yet: unlinked from nav and kept out of search until the
  // real client work replaces the anonymized placeholders.
  robots: { index: false, follow: false },
  alternates: { canonical: "/solutions/brand-design/portfolio" },
  openGraph: {
    title: "Brand Portfolio | B-59",
    description:
      "Selected brand design work for campaigns, PACs, law firms, and coalitions. Identity systems and collateral built for high-stakes, high-trust work.",
    url: "/solutions/brand-design/portfolio",
  },
};

/*
 * Representative work — details anonymized.
 * TODO(b-59): swap these placeholders for real client engagements as releases
 * are approved. Replace `client` with the named client (and add a logo/image
 * when one is cleared for public use). Keep `tag`, `title`, and `result`.
 */
type PortfolioItem = {
  tag: string;
  client: string;
  title: string;
  result: string;
};

const portfolio: PortfolioItem[] = [
  {
    tag: "Political campaign",
    client: "Congressional campaign",
    title: "Brand + field kit",
    result:
      "Logo, color, and a volunteer-ready collateral system deployed across canvassing, mail, and digital — coherent from yard sign to ad.",
  },
  {
    tag: "PAC",
    client: "Statewide independent-expenditure committee",
    title: "Identity system",
    result:
      "Naming, mark, and a messaging framework that stayed disciplined across a multi-race spend.",
  },
  {
    tag: "Law firm",
    client: "Trial practice",
    title: "Brand refresh",
    result:
      "Repositioned a litigation firm with a restrained identity and a typographic system built to hold up on the record.",
  },
  {
    tag: "Advocacy",
    client: "Cross-partisan policy coalition",
    title: "Visual identity",
    result:
      "A neutral, durable mark and palette for a coalition that needed to read as credible to both sides of the aisle.",
  },
  {
    tag: "Political campaign",
    client: "Down-ballot slate",
    title: "Shared identity kit",
    result:
      "A flexible system that kept a slate visually coherent without erasing what made each candidate distinct.",
  },
  {
    tag: "Nonprofit",
    client: "Public-interest organization",
    title: "Wordmark & guidelines",
    result:
      "A wordmark and a short, usable brand guide built for a small team to run on its own.",
  },
];

/*
 * Anonymized client quotes. TODO(b-59): replace with attributed testimonials
 * once a client has cleared their name for public use.
 */
const testimonials: { quote: string; attribution: string }[] = [
  {
    quote:
      "They gave us something that looked like it had been there for years — steady, serious, and easy for our whole team to actually use.",
    attribution: "Campaign manager, statewide race",
  },
  {
    quote:
      "Restraint was the point. The brand made us look like we knew exactly what we were doing, because by then we did.",
    attribution: "Managing partner, litigation firm",
  },
];

export default function BrandPortfolio() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="space-y-12">
        <section>
          <h1 className="heading-xl mb-6">
            Selected <span className="text-b59-blue">work</span>
          </h1>
          <p className="body-lg max-w-2xl">
            Brand design for organizations where trust is the whole game{" "}
            <span className="text-b59-blue">—</span> political campaigns, PACs,
            law firms, and advocacy coalitions. Identity systems, brand
            refreshes, and the field-ready collateral that carries them.
          </p>
        </section>

        <section>
          <ul className="portfolio-grid">
            {portfolio.map((item) => (
              <li key={`${item.tag}-${item.title}`} className="portfolio-card">
                <span className="portfolio-card-tag">{item.tag}</span>
                <h2 className="heading-sm">{item.title}</h2>
                <p className="text-secondary">{item.client}</p>
                <p className="body-md">{item.result}</p>
              </li>
            ))}
          </ul>
          <p className="body-sm text-secondary mt-6">
            Representative engagements; client details anonymized. Named
            references and full case studies available on request.
          </p>
        </section>

        <section>
          <h2 className="heading-lg mb-6">What clients say</h2>
          <div className="space-y-8">
            {testimonials.map(({ quote, attribution }) => (
              <figure key={attribution} className="space-y-3">
                <blockquote className="quote">{quote}</blockquote>
                <figcaption className="body-sm text-secondary">
                  — {attribution}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section>
          <div className="callout-blue">
            <p className="body-md">
              Curious how we&apos;d approach your brand? Read the{" "}
              <a href="/solutions/brand-design/philosophy" className="text-link font-semibold">
                thinking
              </a>{" "}
              behind the work, or get in touch.
            </p>
          </div>
          <a href="mailto:contact@b-59.com" className="btn-primary mt-8">
            Start a brand project
          </a>
        </section>
      </div>
    </div>
  );
}
