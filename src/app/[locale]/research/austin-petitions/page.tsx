import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { Brand } from "@/components/Brand";
import { CONTACT_HREF } from "@/components/ContactClosing";
import { JsonLd } from "@/components/JsonLd";
import { Link } from "@/i18n/navigation";
import { defaultLocale } from "@/i18n/config";
import { deadlinesFor, signaturesRequired, thresholdShare, validityNeeded } from "@/lib/petition-math";
import { resolveSiteUrl } from "@/lib/site-url";
import { datasetJsonLd } from "@/lib/structured-data";

const PATH = "/research/austin-petitions";
const DESCRIPTION =
  "What it takes to get a petition on the Austin ballot: how many signatures to collect, how the last five Austin petitions did, out-of-city signers, and the last safe filing dates for the 2027 elections.";

export const metadata: Metadata = {
  title: "Austin Ballot Petitions: What Campaigns Miss",
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    title: "Austin Ballot Petitions: What Campaigns Miss | B-59",
    description: "Why 20,000 signatures isn't enough, how the last five Austin petitions did, and when to file for 2027.",
    url: PATH,
  },
};

const DATASET = datasetJsonLd({
  siteUrl: resolveSiteUrl(),
  path: PATH,
  name: "Austin citizen petitions: validity and filing deadlines",
  description: DESCRIPTION,
  temporalCoverage: "2018/2027",
  keywords: ["Austin petition", "ballot initiative", "petition signatures", "City of Austin election", "charter amendment"],
});

/** Austin's qualified voters as the City Clerk lists them (January 2026). */
const QUALIFIED_VOTERS = 545_230;
const REQUIRED = signaturesRequired(QUALIFIED_VOTERS);

/** Signature totals to show the validity each would need. */
const SUBMITTED_STEPS = [20_000, 22_500, 25_000, 27_500, 30_000, 35_000];

/** Every bar on the page is drawn against this many signatures, so the 20,000 line sits in the same place. */
const SCALE = 35_000;

type Case = {
  year: number;
  name: string;
  /** As reported, with any qualifier ("more than"). */
  submitted: string;
  /** As reported, with any qualifier ("estimate", "at least"). */
  valid: string;
  /** Numbers used only to draw the bars; the labels above are what the page states. */
  bars: { submitted: number; valid: number };
  /** Share valid, where the reported counts give one. */
  share?: number;
  certified: boolean;
  source: { name: string; href: string };
};

/**
 * Recent Austin petitions, as reported in the press. The City Clerk's own
 * certificates were not retrieved; each figure is quoted from the linked story.
 */
const CASES: Case[] = [
  {
    year: 2018,
    name: "CodeNEXT referendum",
    submitted: "31,062",
    valid: "25,790 (estimate)",
    bars: { submitted: 31_062, valid: 25_790 },
    share: 25_790 / 31_062,
    certified: true,
    source: { name: "Austin Monitor", href: "https://austinmonitor.com/stories/2018/04/clerk-certifies-anti-codenext-petition/" },
  },
  {
    year: 2020,
    name: "Public camping ban (first try)",
    submitted: "24,201",
    valid: "19,122 (estimate)",
    bars: { submitted: 24_201, valid: 19_122 },
    share: 19_122 / 24_201,
    certified: false,
    source: {
      name: "Austin Monitor",
      href: "https://austinmonitor.com/stories/2020/08/austin-says-group-doesnt-have-signatures-to-put-homelessness-ordinances-on-the-ballot-in-november/",
    },
  },
  {
    year: 2021,
    name: "Police staffing",
    submitted: "27,778",
    valid: "93% reported valid",
    bars: { submitted: 27_778, valid: Math.round(27_778 * 0.93) },
    share: 0.93,
    certified: true,
    source: {
      name: "Community Impact",
      href: "https://communityimpact.com/austin/central-austin/public-safety/2021/08/03/city-of-austin-certifies-save-austin-nows-petition-to-increase-police-staffing-adding-it-to-fall-ballot",
    },
  },
  {
    year: 2022,
    name: "Police oversight",
    submitted: "32,674",
    valid: "at least 20,451",
    bars: { submitted: 32_674, valid: 20_451 },
    certified: true,
    source: {
      name: "Community Impact",
      href: "https://communityimpact.com/central-austin/city-county/council-eyes-stricter-limits-for-austin-political-petition-drives-after-string-of-community-initiated-elections/",
    },
  },
  {
    year: 2025,
    name: "Convention center",
    submitted: "more than 25,000",
    valid: "19,506 (estimate)",
    bars: { submitted: 25_000, valid: 19_506 },
    certified: false,
    source: {
      name: "Community Impact",
      href: "https://communityimpact.com/austin/south-central-austin/government/2026/02/16/court-sides-with-austin-in-convention-center-petition-dispute-pac-to-push-for-november-election",
    },
  },
];

/** Uniform election dates (Tex. Elec. Code §41.001) for the coming year. */
const ELECTIONS = [
  { label: "May 2027", date: "2027-05-01" },
  { label: "November 2027", date: "2027-11-02" },
];

const TIMING = { orderLeadDays: 78, councilDays: 10, clerkDays: 30, signatureLifeDays: 180 };

const SOURCES = [
  { name: "Austin City Clerk: petition types and current thresholds", href: "https://www.austintexas.gov/department/petitions" },
  { name: "Austin City Clerk: initiative petitions (sampling, verification time, Council's 10 days)", href: "https://www.austintexas.gov/clerk/initiative-petitions" },
  { name: "Texas Election Code ch. 277: petition requirements, the 180-day rule, sampling", href: "https://www.sos.texas.gov/elections/laws/petitions.shtml" },
  { name: "Texas Election Code §3.005(c): order by the 78th day before a uniform-date election", href: "https://tcss.legis.texas.gov/resources/EL/htm/EL.3.htm" },
  { name: "Texas Election Code §41.001: uniform election dates", href: "https://tcss.legis.texas.gov/resources/EL/htm/EL.41.htm" },
  { name: "Texas Local Government Code §9.004: charter amendment petitions", href: "https://tcss.legis.texas.gov/resources/LG/htm/LG.9.htm" },
  { name: "Texas Constitution art. XI, §5: charters amended no more than every two years", href: "https://tcss.legis.texas.gov/resources/CN/htm/CN.11.htm" },
];

const pct = (n: number, digits = 0) =>
  new Intl.NumberFormat("en-US", { style: "percent", minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);
const num = (n: number) => new Intl.NumberFormat("en-US").format(n);
const day = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));
/** A count as a share of the shared chart scale, for a bar's width. */
const span = (n: number) => `${((n / SCALE) * 100).toFixed(2)}%`;

/** Where drives usually go wrong at this step, beside what the studio does instead. */
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

/** The 20,000 line, drawn at the same place across every bar in a chart. */
function Threshold() {
  return (
    <span className="pet-threshold" aria-hidden="true" style={{ "--pet-at": span(REQUIRED) } as CSSProperties}>
      <span className="pet-threshold-label">{num(REQUIRED)} needed</span>
    </span>
  );
}

/** A chart's key. The dashed 20,000 line is always in it: on a phone it is the line's only label. */
function Legend({ items }: { items: { key: "valid" | "spare" | "submitted"; label: string }[] }) {
  return (
    <div className="pet-legend" aria-hidden="true">
      {items.map((item) => (
        <span key={item.key}>
          <i className={`pet-key pet-key--${item.key}`} /> {item.label}
        </span>
      ))}
      <span>
        <i className="pet-key pet-key--line" /> {num(REQUIRED)} needed
      </span>
    </div>
  );
}

export default async function AustinPetitions() {
  const [locale, t] = await Promise.all([getLocale(), getTranslations("research")]);
  const share = thresholdShare(QUALIFIED_VOTERS);
  const shares = CASES.flatMap((c) => (c.share ? [c.share] : []));
  const deadlines = ELECTIONS.map((e) => ({ ...e, ...deadlinesFor(e.date, TIMING) }));

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
          <h1 className="ea-h1 pet-h1">What it takes to get a petition on the Austin ballot</h1>
          <p className="ea-byline">
            By <Brand /> · Rules from the City Clerk and Texas law; petition figures as reported, each linked
          </p>
          <p className="ea-lede">
            You need {num(REQUIRED)} valid signatures. Turn in {num(REQUIRED)} and you&apos;ll fall short, because the
            City Clerk throws out every line from someone who isn&apos;t a registered Austin voter. Two of the last five
            Austin petitions failed that way.
          </p>
          <dl className="pet-stats">
            <div className="pet-stat pet-stat--lead">
              <dt>valid signatures needed</dt>
              <dd>{num(REQUIRED)}</dd>
            </div>
            <div className="pet-stat">
              <dt>of Austin&apos;s {num(QUALIFIED_VOTERS)} voters</dt>
              <dd>{pct(share, 1)}</dd>
            </div>
            <div className="pet-stat">
              <dt>of signatures valid in recent drives</dt>
              <dd>
                {pct(Math.min(...shares))}–{pct(Math.max(...shares))}
              </dd>
            </div>
          </dl>
        </header>

        <section className="ea-panel pet-panel" aria-labelledby="pet-floor">
          <h2 id="pet-floor" className="ea-section-title">
            Collect well past 20,000
          </h2>
          <p className="ea-prose">
            The Clerk checks a random sample of at least a quarter of the lines and estimates the valid total from it.
            Unregistered signers, people who signed twice, incomplete lines and addresses outside the city limits all
            come off.
          </p>
          <ol className="pet-chart" aria-label="How many bad lines each total can absorb">
            {SUBMITTED_STEPS.map((n) => (
              <li key={n} className="pet-row">
                <span className="pet-row-label">{num(n)} signed</span>
                <span className="pet-bar" aria-hidden="true">
                  <span className="pet-bar-track" style={{ width: span(n) }}>
                    <span className="pet-bar-fill" style={{ width: `${(REQUIRED / n) * 100}%` }} />
                  </span>
                  <Threshold />
                </span>
                <span className="pet-row-value">
                  <strong>{pct(validityNeeded(n, REQUIRED))}</strong> must be valid
                  {n > REQUIRED && <> · {num(n - REQUIRED)} can be bad</>}
                </span>
              </li>
            ))}
          </ol>
          <Legend
            items={[
              { key: "valid", label: "must hold up" },
              { key: "spare", label: "room for bad lines" },
            ]}
          />
          <p className="ea-note">
            The drives that fell short got about four lines in five right. At that rate, 25,000 signatures only just gets
            you there.
          </p>
          <Takeaway
            miss="Aiming for 20,000, and finding out the error rate when the Clerk reports it."
            b59="We set the goal from your own error rate, measured from the first week of collecting."
          />
        </section>

        <section className="ea-panel pet-panel" aria-labelledby="pet-cases">
          <h2 id="pet-cases" className="ea-section-title">
            The last five Austin petitions
          </h2>
          <ol className="pet-chart pet-chart--cases" aria-label="Signatures submitted and found valid">
            {CASES.map((c) => (
              <li key={`${c.year}-${c.name}`} className="pet-row">
                <span className="pet-row-label">
                  <span className="pet-case-year">{c.year}</span> {c.name}
                </span>
                <span className="pet-bar" aria-hidden="true">
                  <span className="pet-bar-track pet-bar-track--submitted" style={{ width: span(c.bars.submitted) }} />
                  <span className="pet-bar-valid" style={{ width: span(c.bars.valid) }} />
                  <Threshold />
                </span>
                <span className="pet-row-value">
                  <span className={c.certified ? "pet-result pet-result--made" : "pet-result pet-result--short"}>
                    {c.certified ? "Made the ballot" : "Fell short"}
                  </span>{" "}
                  {c.submitted} signed, {c.valid}
                  {c.share ? ` (${pct(c.share)})` : ""} ·{" "}
                  <Ext href={c.source.href}>{c.source.name}</Ext>
                </span>
              </li>
            ))}
          </ol>
          <Legend
            items={[
              { key: "valid", label: "valid" },
              { key: "submitted", label: "thrown out" },
            ]}
          />
          <div className="ea-prose">
            <p>
              The two that failed weren&apos;t sloppy. The 2020 camping petition had about 79% valid, close to
              CodeNEXT&apos;s 83% two years earlier. It just started from 24,201, which needed 83%. The 2025 convention
              center drive came in under 500 short.
            </p>
            <p>
              Several hundred of the convention center signers lived just outside the city limits, in Austin&apos;s
              extraterritorial jurisdiction. They had Austin addresses, but their signatures didn&apos;t count. The drive&apos;s backers
              argued in court that those lines alone would have put it over 20,000.
            </p>
          </div>
          <p className="ea-note">
            Figures as reported by the linked outlets, which quote the City Clerk, except 2021&apos;s 93%, which the
            organizers announced. For 2022 the Clerk gave only a floor (&quot;at least&quot;), so no share is shown; the
            2025 bar is drawn at 25,000, the low end of what was reported.
          </p>
          <Takeaway
            miss="Nobody checks registration at the clipboard, so the problems first show up at the Clerk's office."
            b59="Circulators confirm each signer is a registered Austin voter, and we check every batch against the voter roll as it comes in."
          />
        </section>

        <section className="ea-panel pet-panel" aria-labelledby="pet-calendar">
          <h2 id="pet-calendar" className="ea-section-title">
            Count back from the election
          </h2>
          <p className="ea-prose">
            Measures go on uniform election dates. The Council has to order the election 78 days out and gets up to 10
            days after the Clerk certifies; the Clerk needs at least 30 days to verify. No signature can be more than 180
            days old on the day you file.
          </p>
          <div className="pet-timelines">
            {deadlines.map((d) => (
              <section key={d.date} className="pet-timeline-block" aria-label={`${d.label} election`}>
                <h3 className="pet-timeline-title">{d.label}</h3>
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
            ))}
          </div>
          <p className="ea-note">
            Assumes the Clerk takes the stated minimum of 30 days and the Council uses its full 10. Verification can run
            longer, so file earlier if you can.
          </p>
          <Takeaway
            miss="Planning from election day, then running out of time while the Clerk verifies."
            b59="A calendar built back from the Council's deadline, with slack for a slow count, and collection timed so no signature expires."
          />
        </section>

        <section className="ea-panel pet-panel" aria-labelledby="pet-rules">
          <h2 id="pet-rules" className="ea-section-title">
            Two more rules
          </h2>
          <div className="pet-rules">
            <div className="pet-rule">
              <p className="pet-rule-big">Every 2 years</p>
              <p>
                The most often a Texas city charter can be amended. A charter petition that misses the window waits for
                the next one, however many signatures it has.
              </p>
            </div>
            <div className="pet-rule">
              <p className="pet-rule-big">No statewide petitions</p>
              <p>
                Texas has no citizen initiative for state law; amendments start in the Legislature. City petitions are
                where voters get to write the question.
              </p>
            </div>
          </div>
          <Takeaway
            miss="Collecting signatures for an election the measure can't legally be on."
            b59="Before the first signature, we check which elections your measure can make."
          />
        </section>

        <section className="ea-panel pet-panel pet-cta" aria-labelledby="pet-cta">
          <h2 id="pet-cta" className="ea-section-title">
            Running a petition in Austin?
          </h2>
          <p className="ea-prose">
            <Brand /> is a progressive political consulting studio in Austin. We set the signature goal, train
            circulators, check signatures against the voter roll as they come in, and run the campaign through election
            day. Talk to us before the first signature, while the plan is still cheap to change.
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

        <section className="ea-panel" aria-labelledby="pet-sources">
          <h2 id="pet-sources" className="ea-section-title">
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
            Rules checked November 2026. This is research on how the process works, not legal advice.
          </p>
        </section>
      </article>
    </div>
  );
}
