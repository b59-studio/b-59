import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

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

type PortfolioItem = {
  tagKey: string;
  clientKey: string;
  titleKey: string;
  resultKey: string;
};

/*
 * Representative work — details anonymized.
 * TODO(b-59): swap these placeholders for real client engagements as releases
 * are approved. Replace `clientKey` content with the named client (and add a
 * logo/image when one is cleared for public use). Keep `tagKey`/`titleKey`/`resultKey`.
 */
const portfolio: PortfolioItem[] = [
  { tagKey: "tagPoliticalCampaign", clientKey: "item1Client", titleKey: "item1Title", resultKey: "item1Result" },
  { tagKey: "tagPac", clientKey: "item2Client", titleKey: "item2Title", resultKey: "item2Result" },
  { tagKey: "tagLawFirm", clientKey: "item3Client", titleKey: "item3Title", resultKey: "item3Result" },
  { tagKey: "tagAdvocacy", clientKey: "item4Client", titleKey: "item4Title", resultKey: "item4Result" },
  { tagKey: "tagPoliticalCampaign", clientKey: "item5Client", titleKey: "item5Title", resultKey: "item5Result" },
  { tagKey: "tagNonprofit", clientKey: "item6Client", titleKey: "item6Title", resultKey: "item6Result" },
];

/*
 * Anonymized client quotes. TODO(b-59): replace with attributed testimonials
 * once a client has cleared their name for public use.
 */
const testimonials: { quoteKey: string; attributionKey: string }[] = [
  { quoteKey: "quote1", attributionKey: "attribution1" },
  { quoteKey: "quote2", attributionKey: "attribution2" },
];

const blue = (chunks: React.ReactNode) => <span className="text-b59-blue">{chunks}</span>;

export default async function BrandPortfolio() {
  const t = await getTranslations("brandPortfolio");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="space-y-12">
        <section>
          <h1 className="heading-xl mb-6">{t.rich("heading", { blue })}</h1>
          <p className="body-lg max-w-2xl">{t.rich("intro", { blue })}</p>
        </section>

        <section>
          <ul className="portfolio-grid">
            {portfolio.map((item) => (
              <li key={`${item.tagKey}-${item.titleKey}`} className="portfolio-card">
                <span className="portfolio-card-tag">{t(item.tagKey)}</span>
                <h2 className="heading-sm">{t(item.titleKey)}</h2>
                <p className="text-secondary">{t(item.clientKey)}</p>
                <p className="body-md">{t(item.resultKey)}</p>
              </li>
            ))}
          </ul>
          <p className="body-sm text-secondary mt-6">{t("disclaimer")}</p>
        </section>

        <section>
          <h2 className="heading-lg mb-6">{t("whatClientsSayHeading")}</h2>
          <div className="space-y-8">
            {testimonials.map(({ quoteKey, attributionKey }) => (
              <figure key={attributionKey} className="space-y-3">
                <blockquote className="quote">{t(quoteKey)}</blockquote>
                <figcaption className="body-sm text-secondary">— {t(attributionKey)}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section>
          <div className="callout-blue">
            <p className="body-md">
              {t.rich("closingBody", {
                link: () => (
                  <Link href="/solutions/brand-design/philosophy" className="text-link font-semibold">
                    {t("closingLinkText")}
                  </Link>
                ),
              })}
            </p>
          </div>
          <a href="mailto:contact@b-59.com" className="btn-primary mt-8">
            {t("cta")}
          </a>
        </section>
      </div>
    </div>
  );
}
