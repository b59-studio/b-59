/**
 * schema.org descriptions of the studio and its research, emitted as JSON-LD.
 *
 * Search engines and answer engines read these to decide what B-59 is, where it
 * works and who made a page. Every fact here must also be true on the visible
 * site: structured data that claims more than the page shows is ignored at best
 * and penalised at worst.
 */

export const ORGANIZATION_DESCRIPTION =
  "B-59 Studio is a civic technology design and strategy studio in Austin, Texas. It builds civic software, publishes Texas election research, and advises on complex decisions. Human-centered. Public-first.";

const PROFILES = {
  github: "https://github.com/b59-studio",
  linkedIn: "https://www.linkedin.com/company/b59studio",
  founderLinkedIn: "https://www.linkedin.com/in/jonvthon",
};

/** Stable node id, so other pages can name the studio as creator without repeating it. */
export function organizationId(siteUrl: string): string {
  return `${siteUrl}/#organization`;
}

const TEXAS = { "@type": "State", name: "Texas", containedInPlace: { "@type": "Country", name: "United States" } };

export function organizationJsonLd(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": organizationId(siteUrl),
        name: "B-59 Studio",
        alternateName: ["B-59", "B59", "B59 Studio"],
        url: siteUrl,
        logo: `${siteUrl}/v2-yeah.png`,
        image: `${siteUrl}/v2-yeah.png`,
        description: ORGANIZATION_DESCRIPTION,
        slogan: "Deliberate design for imperfect systems.",
        email: "contact@b-59.com",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Austin",
          addressRegion: "TX",
          addressCountry: "US",
        },
        areaServed: [{ "@type": "City", name: "Austin", containedInPlace: TEXAS }, TEXAS],
        knowsAbout: [
          "Political consulting",
          "Civic technology",
          "Election data analysis",
          "Texas elections",
          "Voter registration",
          "Campaign field organizing",
          "Voter turnout targeting",
          "Human-centered design",
          "Public-sector software",
        ],
        founder: {
          "@type": "Person",
          name: "Jonathon Reise",
          jobTitle: "Principal",
          url: `${siteUrl}/about/team`,
          sameAs: [PROFILES.founderLinkedIn],
          homeLocation: { "@type": "City", name: "Austin", containedInPlace: TEXAS },
        },
        sameAs: [PROFILES.linkedIn, PROFILES.github],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: "B-59 Studio",
        url: siteUrl,
        publisher: { "@id": organizationId(siteUrl) },
        inLanguage: ["en", "es", "zh", "hi", "he"],
      },
    ],
  };
}

type Dataset = {
  siteUrl: string;
  path: string;
  name: string;
  description: string;
  /** ISO 8601 date or interval, e.g. "2026-11-03" or "2016/2026". */
  temporalCoverage: string;
  keywords: string[];
};

/** A research page described as a dataset, credited to the studio. */
export function datasetJsonLd({ siteUrl, path, name, description, temporalCoverage, keywords }: Dataset) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name,
    description,
    url: `${siteUrl}${path}`,
    creator: { "@id": organizationId(siteUrl), "@type": "Organization", name: "B-59 Studio" },
    publisher: { "@id": organizationId(siteUrl) },
    isAccessibleForFree: true,
    inLanguage: "en",
    spatialCoverage: TEXAS,
    temporalCoverage,
    keywords,
  };
}
