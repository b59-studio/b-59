import type { Metadata } from "next";
import { BASE_OPEN_GRAPH } from "@/lib/share-card";
import type { ReactNode } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { Brand } from "@/components/Brand";
import { CONTACT_HREF } from "@/components/ContactClosing";
import { JsonLd } from "@/components/JsonLd";
import { Link } from "@/i18n/navigation";
import { defaultLocale } from "@/i18n/config";
import { deadlinesFor } from "@/lib/petition-math";
import { PETITION_ELECTION, PETITION_TIMING } from "@/lib/petition-calendar";
import { resolveSiteUrl } from "@/lib/site-url";
import { datasetJsonLd } from "@/lib/structured-data";

const PATH = "/research/austin-petitions/prop-g";
const DESCRIPTION =
  "Austin's Proposition G, approved in November 2026, moves citizen initiatives and petitioned charter amendments to November elections in even-numbered years. There is no petition election in 2027; the next is November 7, 2028. The filing dates, the 180-day signature window, and what a drive that misses 2028 waits for.";

export const metadata: Metadata = {
  title: "Austin Prop G: The Next Petition Election Is November 2028",
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    ...BASE_OPEN_GRAPH,
    title: "Austin Prop G: The Next Petition Election Is November 2028 | B-59",
    description: "No citizen petition can reach Austin's ballot in 2027. The dates that matter for November 2028.",
    url: PATH,
  },
};

const DATASET = datasetJsonLd({
  siteUrl: resolveSiteUrl(),
  path: PATH,
  name: "Austin petition election dates after Proposition G (2026)",
  description: DESCRIPTION,
  temporalCoverage: "2026/2030",
  keywords: ["Austin Proposition G", "Austin petition", "initiative election", "charter amendment", "November 2028 election"],
});

/** Prop G's result on November 3, 2026, as the city and Fox 7 reported it (unofficial until canvassed). */
const PROP_G = { for: 206_286, against: 116_761 };

/** The even-year November after 2028, for a drive that misses the 2028 cutoff (Tex. Elec. Code §41.001). */
const NEXT_AFTER = "2030-11-05";

/** How long the 2026 audit petition took to verify: filed June 2, certified June 22. */
const AUDIT_VERIFY_DAYS = 20;

const SOURCES = [
  {
    name: "KUT: the Nov. 2026 charter amendments, with Prop G's ballot language",
    href: "https://www.kut.org/politics/2026-10-19/austin-tx-charter-amendments-prop-i-ballot-election-audit-propositions",
  },
  {
    name: "Fox 7: which Austin propositions passed (unofficial results)",
    href: "https://www.fox7austin.com/news/2026-election-which-city-austin-propositions-passed-failed",
  },
  {
    name: "City of Austin: voters approve seven of 10 charter amendments (Nov. 4, 2026)",
    href: "https://www.austintexas.gov/communications/news/austin-voters-approve-295-million-bond-package",
  },
  {
    name: "Community Impact: the audit petition certified 20 days after filing",
    href: "https://communityimpact.com/central-austin/government/austin-audit-measure-secures-place-on-ballot-months-after-officials-approval-of-separate-efficiency-review/",
  },
  { name: "Austin City Clerk: initiative petitions", href: "https://www.austintexas.gov/clerk/initiative-petitions" },
  {
    name: "Texas Election Code ch. 277: the 180-day rule (§277.002) and competing measures (§277.005)",
    href: "https://tcss.legis.texas.gov/resources/EL/htm/EL.277.htm",
  },
  { name: "Texas Election Code §3.005(c): order by the 78th day before the election", href: "https://tcss.legis.texas.gov/resources/EL/htm/EL.3.htm" },
  { name: "Texas Election Code §41.001: uniform election dates", href: "https://tcss.legis.texas.gov/resources/EL/htm/EL.41.htm" },
];

const num = (n: number) => new Intl.NumberFormat("en-US").format(n);
const pct = (n: number) => new Intl.NumberFormat("en-US", { style: "percent" }).format(n);
const day = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));
const longDay = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));

/** Where drives usually go wrong, beside what the studio does instead. */
function Takeaway({ miss, b59 }: { miss: string; b59: ReactNode }) {
  return (
    <div className="pet-takeaway">
      <p>
        <span className="pet-takeaway-label">Where drives go wrong</span>
        {miss}
      </p>
      <p>
        <span className="pet-takeaway-label">
          What <Brand /> does
        </span>
        {b59}
      </p>
    </div>
  );
}

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="ea-link" target="_blank" rel="noopener noreferrer">
      {children}
      <span className="sr-only"> (opens in new window)</span>
    </a>
  );
}

export default async function PropG() {
  const [locale, t] = await Promise.all([getLocale(), getTranslations("research")]);
  const d = deadlinesFor(PETITION_ELECTION.date, PETITION_TIMING);
  const share = PROP_G.for / (PROP_G.for + PROP_G.against);

  return (
    <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <JsonLd data={DATASET} />
      {locale !== defaultLocale && (
        <p role="note" className="callout-gray body-sm mb-8">
          {t("englishOnly")}
        </p>
      )}
      <article className="ea pet" lang="en" dir="ltr">
        <header className="ea-head pet-head">
          <p className="ea-dateline">Research · Austin ballot petitions · November 2026</p>
          <h1 className="ea-h1 pet-h1">Austin&apos;s next petition election is November 2028</h1>
          <p className="ea-byline">
            By <Brand /> · Results unofficial until the Council canvasses them; sources linked below
          </p>
          <p className="ea-lede">
            On November 3, Austin voters approved Proposition G. Citizen initiatives and petitioned charter amendments now
            go on the ballot only in November of an even-numbered year. No petition can reach the ballot in 2027, and a
            drive that misses the 2028 cutoff waits until 2030.
          </p>
          <dl className="pet-stats">
            <div className="pet-stat pet-stat--lead">
              <dt>next petition election</dt>
              <dd>{day(d.election)}</dd>
            </div>
            <div className="pet-stat">
              <dt>last safe day to file</dt>
              <dd>{day(d.fileBy)}</dd>
            </div>
            <div className="pet-stat">
              <dt>oldest signature that counts then</dt>
              <dd>{day(d.oldestSignature)}</dd>
            </div>
          </dl>
        </header>

        <section className="ea-panel pet-panel" aria-labelledby="pg-change">
          <h2 id="pg-change" className="ea-section-title">
            What Prop G changed
          </h2>
          <div className="pet-rules">
            <div className="pet-rule">
              <p className="pet-rule-big">Before</p>
              <p>
                A certified petition went to the next election state law allowed: May or November, in any year. Which one
                depended on when the Clerk certified it.
              </p>
            </div>
            <div className="pet-rule">
              <p className="pet-rule-big">Now</p>
              <p>
                The next November election in an even-numbered year that leaves enough time to meet the rest of the law.
                That&apos;s the presidential and midterm ballots, when turnout is highest.
              </p>
            </div>
          </div>
          <p className="ea-note">
            Prop G passed {num(PROP_G.for)} to {num(PROP_G.against)} ({pct(share)}), by unofficial count. It takes
            effect once the Council canvasses the vote and declares it adopted. Its ballot language names initiatives and
            petitioned charter amendments; it doesn&apos;t mention referendum petitions, which challenge an ordinance the
            Council has passed, so check their timing with the Clerk.
          </p>
          <Takeaway
            miss="Planning a 2027 drive on the old rule, which the Clerk's website still describes."
            b59="We plan against the rules as they stand on the day you start, and recheck them as they change."
          />
        </section>

        <section className="ea-panel pet-panel" aria-labelledby="pg-calendar">
          <h2 id="pg-calendar" className="ea-section-title">
            Count back from November 2028
          </h2>
          <p className="ea-prose">
            The Council has to order a November election 78 days ahead and gets up to 10 days after the Clerk certifies.
            The Clerk says verification takes at least 30 days for a petition this size.
          </p>
          <div className="pet-timelines">
            <section className="pet-timeline-block" aria-label={`${PETITION_ELECTION.label} election`}>
              <h3 className="pet-timeline-title">{PETITION_ELECTION.label}</h3>
              <ol className="pet-timeline">
                <li>
                  <span className="pet-step-date">{day(d.oldestSignature)}</span>
                  <span className="pet-step-what">Oldest signature that still counts</span>
                </li>
                <li className="pet-step--key">
                  <span className="pet-step-date">{day(d.fileBy)}</span>
                  <span className="pet-step-what">Last safe day to file</span>
                </li>
                <li>
                  <span className="pet-step-date">{day(d.certifyBy)}</span>
                  <span className="pet-step-what">Clerk certifies</span>
                </li>
                <li>
                  <span className="pet-step-date">{day(d.orderBy)}</span>
                  <span className="pet-step-what">Council orders the election</span>
                </li>
                <li>
                  <span className="pet-step-date">{day(d.election)}</span>
                  <span className="pet-step-what">Election day</span>
                </li>
              </ol>
            </section>
            <div className="ea-prose self-start">
              <p>
                Miss {longDay(d.fileBy)} by much and the petition can still be certified, but there is no election for it
                until {longDay(NEXT_AFTER)}. That&apos;s two years of waiting with the signatures already counted.
              </p>
              <p>
                The Clerk can be faster than 30 days: the 2026 audit petition was certified {AUDIT_VERIFY_DAYS} days after
                it was filed. Plan on the slower number anyway.
              </p>
            </div>
          </div>
          <p className="ea-note">
            Dates assume the Clerk takes the stated 30 days and the Council uses its full 10. Prop G&apos;s &quot;enough
            time to comply&quot; isn&apos;t defined further, so treat {day(d.fileBy)} as a planning date, not a legal one.
          </p>
          <Takeaway
            miss="Treating 2028 as far off, then filing in August with the Council's window already closing."
            b59="A calendar built back from the Council's deadline, with slack for a slow count."
          />
        </section>

        <section className="ea-panel pet-panel" aria-labelledby="pg-window">
          <h2 id="pg-window" className="ea-section-title">
            You can&apos;t bank signatures for two years
          </h2>
          <div className="ea-prose">
            <p>
              A signature counts only if it&apos;s no more than 180 days old on the day the petition is filed. Filed on{" "}
              {longDay(d.fileBy)}, nothing signed before {longDay(d.oldestSignature)} counts. Collecting in 2027 for a
              July 2028 filing throws the 2027 work away.
            </p>
            <p>That leaves two ways to run it.</p>
          </div>
          <div className="pet-rules">
            <div className="pet-rule">
              <p className="pet-rule-big">File early</p>
              <p>
                Collect within any 180-day stretch, file, and let the certified petition wait for November 2028. The
                text is fixed from the day you file, and opponents get the whole wait to organize.
              </p>
            </div>
            <div className="pet-rule">
              <p className="pet-rule-big">Collect in 2028</p>
              <p>
                Every signature from {day(d.oldestSignature)} to {day(d.fileBy)} counts, and the campaign runs straight
                into the general election. It&apos;s a six-month sprint with no room to recover from a bad week.
              </p>
            </div>
          </div>
          <p className="ea-prose">
            Either way, the Council can still adopt a certified ordinance exactly as written within 10 days. Only the
            election waits for November.
          </p>
          <Takeaway
            miss="Starting a drive whenever the issue is hot, then finding half the signatures expired at filing."
            b59="We choose when to start collecting from the filing date, so no signature ages out before it's turned in."
          />
        </section>

        <section className="ea-panel pet-panel" aria-labelledby="pg-ballot">
          <h2 id="pg-ballot" className="ea-section-title">
            On a busier ballot
          </h2>
          <div className="ea-prose">
            <p>
              Every petition now shares a ballot with a presidential or midterm race. Turnout is higher, so more voters
              decide the measure, many of whom heard nothing about it until they read the ballot.
            </p>
            <p>
              One state rule helps petitioners: since September 2025, a city can&apos;t put its own competing or
              conflicting measure on the same ballot as a petition-initiated one (Texas Election Code §277.005).
            </p>
          </div>
          <Takeaway
            miss="Spending everything on signatures and having nothing left to reach November's electorate."
            b59="We budget the campaign with the drive, so qualifying doesn't leave you broke for the race that matters."
          />
        </section>

        <section className="ea-panel pet-panel pet-cta" aria-labelledby="pg-cta">
          <h2 id="pg-cta" className="ea-section-title">
            Planning a petition for 2028?
          </h2>
          <p className="ea-prose">
            <Brand /> is a progressive political consulting studio in Austin. We pick the collection window, set the
            signature goal, check signatures against the voter roll as they come in, and run the campaign through election
            day. The rest of what it takes, including how the last five Austin petitions did, is in{" "}
            <Link href="/research/austin-petitions" className="ea-link">
              our petitions research
            </Link>
            .
          </p>
          <div className="ea-bar">
            <a href={CONTACT_HREF} className="btn-secondary">
              Email the studio
            </a>
            <Link href="/studio/ballot-measures" className="ea-link">
              How we run ballot measure campaigns
            </Link>
          </div>
        </section>

        <section className="ea-panel" aria-labelledby="pg-sources">
          <h2 id="pg-sources" className="ea-section-title">
            Sources
          </h2>
          <ul className="ea-prose">
            {SOURCES.map((s) => (
              <li key={s.href}>
                <Ext href={s.href}>{s.name}</Ext>
              </li>
            ))}
          </ul>
          <p className="ea-note">
            Checked November 7, 2026. This is research on how the process works, not legal advice.
          </p>
        </section>
      </article>
    </div>
  );
}
