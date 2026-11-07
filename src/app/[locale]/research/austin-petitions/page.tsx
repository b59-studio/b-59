import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Brand } from "@/components/Brand";
import { CONTACT_HREF } from "@/components/ContactClosing";
import { DataTable } from "@/components/research/election-2026/parts";
import { JsonLd } from "@/components/JsonLd";
import { Link } from "@/i18n/navigation";
import { defaultLocale } from "@/i18n/config";
import { deadlinesFor, signaturesRequired, thresholdShare, validityNeeded } from "@/lib/petition-math";
import { resolveSiteUrl } from "@/lib/site-url";
import { datasetJsonLd } from "@/lib/structured-data";

const PATH = "/research/austin-petitions";
const DESCRIPTION =
  "What Austin petition drives miss: why 20,000 signatures is the floor rather than the goal, the validity rates of recent Austin petitions, out-of-city signers, and the last safe filing dates for the 2027 elections.";

export const metadata: Metadata = {
  title: "Austin Ballot Petitions: What Campaigns Miss",
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    title: "Austin Ballot Petitions: What Campaigns Miss | B-59",
    description: "Why 20,000 signatures isn't enough, what recent Austin petitions actually achieved, and when to file for 2027.",
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

type Case = {
  year: number;
  name: string;
  submitted: string;
  valid: string;
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
    share: 25_790 / 31_062,
    certified: true,
    source: { name: "Austin Monitor", href: "https://austinmonitor.com/stories/2018/04/clerk-certifies-anti-codenext-petition/" },
  },
  {
    year: 2020,
    name: "Public camping ban (first attempt)",
    submitted: "24,201",
    valid: "19,122 (estimate)",
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
    share: 0.93,
    certified: true,
    source: {
      name: "Community Impact",
      href: "https://communityimpact.com/austin/central-austin/public-safety/2021/08/03/city-of-austin-certifies-save-austin-nows-petition-to-increase-police-staffing-adding-it-to-fall-ballot",
    },
  },
  {
    year: 2022,
    name: "Police oversight (Equity Action)",
    submitted: "32,674",
    valid: "at least 20,451",
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

/** What petition drives tend to get wrong at this step, and what the studio does about it. */
function Takeaway({ miss, b59 }: { miss: string; b59: string }) {
  return (
    <div className="ea-verdict">
      <p>
        <strong>What drives miss:</strong> {miss}
      </p>
      <p>
        <strong>
          What <Brand /> does:
        </strong>{" "}
        {b59}
      </p>
    </div>
  );
}

function Ext({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="ea-link" target="_blank" rel="noopener noreferrer">
      {children}
      <span className="sr-only"> (opens in new window)</span>
    </a>
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
      <article className="ea" lang="en" dir="ltr">
        <header className="ea-head">
          <p className="ea-dateline">Research · Austin ballot petitions · November 2026</p>
          <h1 className="ea-h1">Getting a petition on the Austin ballot: what campaigns miss</h1>
          <p className="ea-byline">
            By <Brand /> · Rules from the City Clerk and Texas law; petition figures as reported, each linked
          </p>
          <p className="ea-lede">
            Everyone knows the number is 20,000. Fewer people know that 20,000 is where a petition fails, not where it
            succeeds, that an Austin address doesn&apos;t make someone an Austin voter, or that the real deadline for
            an election arrives months before the election does. Each of those has sunk an Austin petition. Here is
            what the numbers show, and how to plan around them.
          </p>
          <div className="ea-stats">
            <div className="ea-stat">
              <span className="ea-stat-v">{num(REQUIRED)}</span>
              <span className="ea-stat-k">valid signatures required</span>
            </div>
            <div className="ea-stat">
              <span className="ea-stat-v">{pct(share, 1)}</span>
              <span className="ea-stat-k">of Austin&apos;s {num(QUALIFIED_VOTERS)} qualified voters</span>
            </div>
            <div className="ea-stat">
              <span className="ea-stat-v">
                {pct(Math.min(...shares))}–{pct(Math.max(...shares))}
              </span>
              <span className="ea-stat-k">of signatures valid in recent petitions</span>
            </div>
          </div>
        </header>

        <section className="ea-panel overflow-x-clip" aria-labelledby="pet-floor">
          <h2 id="pet-floor" className="ea-section-title">
            20,000 is the floor, not the goal
          </h2>
          <div className="ea-prose">
            <p>
              The law asks for 5% of qualified voters or 20,000, whichever is fewer. In Austin the cap wins, so the bar
              is {pct(share, 1)} of voters, not 5%. But the count that matters is valid signatures, and the City Clerk
              estimates it from a random sample of at least a quarter of the lines. Every unregistered signer,
              duplicate, incomplete line or out-of-city address comes off the top.
            </p>
            <p>So the question for a petition drive is how many valid signatures it can afford to lose:</p>
          </div>
          <DataTable
            head={
              <>
                <tr>
                  <th scope="col">Signatures submitted</th>
                  <th scope="col">Share that must be valid</th>
                  <th scope="col">Invalid lines it can absorb</th>
                </tr>
              </>
            }
          >
                {SUBMITTED_STEPS.map((n) => (
                  <tr key={n}>
                    <td>{num(n)}</td>
                    <td>{pct(validityNeeded(n, REQUIRED), 1)}</td>
                    <td>{num(n - REQUIRED)}</td>
                  </tr>
                ))}
          </DataTable>
          <p className="ea-note">
            At four in five valid, about what the drives below that fell short managed, 25,000 signatures only breaks
            even. Margin is the whole game.
          </p>
          <Takeaway
            miss="Treating 20,000 as the finish line, and learning the validity rate from the Clerk's verdict."
            b59="We set the signature goal from your validity rate, not the statute, and measure that rate from the first week."
          />
        </section>

        <section className="ea-panel overflow-x-clip" aria-labelledby="pet-cases">
          <h2 id="pet-cases" className="ea-section-title">
            What recent Austin petitions actually did
          </h2>
          <DataTable
            head={
              <>
                <tr>
                  <th scope="col">Petition</th>
                  <th scope="col">Submitted</th>
                  <th scope="col">Valid</th>
                  <th scope="col">Share valid</th>
                  <th scope="col">Result</th>
                  <th scope="col">Reported by</th>
                </tr>
              </>
            }
          >
                {CASES.map((c) => (
                  <tr key={`${c.year}-${c.name}`}>
                    <td>
                      {c.year} · {c.name}
                    </td>
                    <td>{c.submitted}</td>
                    <td>{c.valid}</td>
                    <td>{c.share ? pct(c.share) : "–"}</td>
                    <td>{c.certified ? "Certified" : "Fell short"}</td>
                    <td>
                      <Ext href={c.source.href}>{c.source.name}</Ext>
                    </td>
                  </tr>
                ))}
          </DataTable>
          <div className="ea-prose">
            <p>
              The two failures weren&apos;t unusually sloppy. The 2020 camping petition had about 79% of its signatures
              valid, close to the 83% of the CodeNEXT petition that qualified two years earlier. It simply started with
              24,201, which needed 83%. The 2025 convention center drive turned in more than 25,000 and was estimated
              at 19,506 valid, under 500 short.
            </p>
            <p>
              <strong>An Austin address isn&apos;t an Austin voter.</strong> In the convention center case, several
              hundred signers lived in the city&apos;s extraterritorial jurisdiction, just outside the city limits. Their
              signatures didn&apos;t count, and the petition&apos;s backers argued in
              court that those lines alone would have put it over 20,000.
            </p>
          </div>
          <p className="ea-note">
            Figures are as reported by the linked outlets, which quote the City Clerk except for 2021&apos;s 93%, which
            the petition&apos;s organizers announced. &quot;At least&quot; is the low end of the Clerk&apos;s estimate, not
            a total, so no share is given for it.
          </p>
          <Takeaway
            miss="Signers who aren't registered, sign twice, or live outside the city limits. None of it shows on a clipboard; all of it shows at the Clerk."
            b59="Circulators trained to confirm they have a registered Austin voter, and every batch checked against the voter roll as it comes in, so the count you track is the count the Clerk will find."
          />
        </section>

        <section className="ea-panel overflow-x-clip" aria-labelledby="pet-calendar">
          <h2 id="pet-calendar" className="ea-section-title">
            Work back from the election
          </h2>
          <div className="ea-prose">
            <p>
              A measure can only go on a uniform election date, and the Council has to order the election at least 78
              days before it. Before that, the Council gets up to 10 days after certification, and the Clerk says
              verifying a petition of 20,000 or more takes at least 30 days. Every signature on the petition has to be
              less than 180 days old on the day it&apos;s filed.
            </p>
          </div>
          <DataTable
            head={
              <>
                <tr>
                  <th scope="col">Election</th>
                  <th scope="col">Election day</th>
                  <th scope="col">Council orders it by</th>
                  <th scope="col">Clerk certifies by</th>
                  <th scope="col">File by</th>
                  <th scope="col">Oldest signature that counts</th>
                </tr>
              </>
            }
          >
                {deadlines.map((d) => (
                  <tr key={d.date}>
                    <td>{d.label}</td>
                    <td>{day(d.election)}</td>
                    <td>{day(d.orderBy)}</td>
                    <td>{day(d.certifyBy)}</td>
                    <td>{day(d.fileBy)}</td>
                    <td>{day(d.oldestSignature)}</td>
                  </tr>
                ))}
          </DataTable>
          <p className="ea-note">
            &quot;File by&quot; assumes the Clerk&apos;s stated minimum of 30 days and a Council that uses its full 10.
            Verification can take longer, so file earlier than this if you can.
          </p>
          <Takeaway
            miss="Planning from election day instead of the order deadline, and running out of road in the Clerk's office."
            b59="A calendar built back from the deadline the Council has to meet, with room for a slow verification, and a collection schedule that keeps every signature inside its 180 days."
          />
        </section>

        <section className="ea-panel" aria-labelledby="pet-rules">
          <h2 id="pet-rules" className="ea-section-title">
            Two rules that catch people out
          </h2>
          <div className="ea-prose">
            <p>
              <strong>A city charter can only be amended every two years.</strong> The Texas Constitution says no city
              charter may be amended more often than every two years. A charter amendment petition that misses the
              window waits for the next one, however many signatures it has.
            </p>
            <p>
              <strong>Texans can&apos;t petition statewide.</strong> Texas has no citizen initiative for state law or
              the state constitution; amendments start in the Legislature. City petitions like Austin&apos;s are where
              voters can write the question themselves.
            </p>
          </div>
          <Takeaway
            miss="Collecting signatures for an election the measure can't legally reach."
            b59="Before the first signature, we confirm which elections your measure can make and what it has to clear to get there."
          />
        </section>

        <section className="ea-panel" aria-labelledby="pet-cta">
          <h2 id="pet-cta" className="ea-section-title">
            Running a petition in Austin?
          </h2>
          <div className="ea-prose">
            <p>
              <Brand /> is a progressive political consulting studio in Austin. We set the signature goal, train the
              people with the clipboards, check signatures against the voter roll as they come in, and carry the measure
              through election day. Talk to us before the first signature, when the plan is still cheap to change.
            </p>
          </div>
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
