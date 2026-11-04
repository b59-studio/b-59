import { parseClarity, type ClarityResults } from "./clarity";
import { harrisContests, harrisPrecincts, type HarrisPrecinctFile, type HarrisSummary } from "./harris";
import { parseSos, type SosCounty } from "./sos";
import type { CountyReading, PrecinctDetail } from "./types";
import { unzipEntry } from "./zip";

/** How often sources are re-read, at most. */
export const REFRESH_SECONDS = 120;

const UA = { "User-Agent": "Mozilla/5.0 (compatible; b-59.com election results)" };
const TIMEOUT_MS = 15_000;
const SOS_URL = "https://goelect.txelections.civixapps.com/api-ivis-system/api/s3/enr/election/countyInfo/53815";
const HARRIS_BASE = "https://appfiles.harrisvotes.com/harrisvotes/prd/Data/1126/";

type Source =
  | { county: string; system: "clarity"; slug: string; electionId: number; resultsUrl: string }
  | { county: string; system: "harris"; resultsUrl: string }
  | { county: string; system: "sos"; resultsUrl: string };

const clarity = (county: string, electionId: number): Source => {
  const slug = county.replace(/ /g, "_");
  return { county, system: "clarity", slug, electionId, resultsUrl: `https://results.enr.clarityelections.com/TX/${slug}/${electionId}/` };
};

/**
 * The 19 counties the analysis follows, each with the best source it has. Eight
 * publish Clarity results with precinct detail, Harris publishes its own JSON,
 * and the rest post PDFs, so for them the Secretary of State's county totals
 * stand in and the link goes to the county's own results page.
 */
export const SOURCES: Source[] = [
  clarity("Travis", 127492),
  { county: "Harris", system: "harris", resultsUrl: "https://app.harrisvotes.com/electionresults/electionday" },
  clarity("Dallas", 127396),
  clarity("Bexar", 127291),
  clarity("Denton", 127398),
  clarity("Williamson", 127488),
  clarity("Bell", 127475),
  clarity("El Paso", 127348),
  clarity("Hidalgo", 127350),
  { county: "Collin", system: "sos", resultsUrl: "https://www.collincountytx.gov/Elections/election-results" },
  { county: "Montgomery", system: "sos", resultsUrl: "https://elections.mctx.org/ElectionResults.asp" },
  { county: "Hays", system: "sos", resultsUrl: "https://www.hayscountytx.gov/873/November-3-2026-General-Election" },
  { county: "Ellis", system: "sos", resultsUrl: "https://www.elliscountytx.gov/1402/November-3-2026-General-and-Special-Elec" },
  { county: "Cameron", system: "sos", resultsUrl: "https://www.cameroncountytx.gov/elections/index.php/results/" },
  { county: "Webb", system: "sos", resultsUrl: "https://www.webbcountytx.gov/291/Elections-Department" },
  { county: "Starr", system: "sos", resultsUrl: "https://www.co.starr.tx.us/page/Elections.2026" },
  { county: "Willacy", system: "sos", resultsUrl: "https://www.willacy.gov/page/willacy.Elections" },
  { county: "Maverick", system: "sos", resultsUrl: "https://co.maverick.tx.us/elections" },
  { county: "Hockley", system: "sos", resultsUrl: "https://www.co.hockley.tx.us/page/ElectionsHome" },
];

export const SOS_RESULTS_URL = "https://goelect.txelections.civixapps.com/ivis-enr-ui/races";

export type Snapshot = {
  readAt: string;
  sos: SosCounty[];
  sosReadAt: string | null;
  counties: CountyReading[];
};

/**
 * How a source file may be cached in Next's shared fetch cache, which every
 * server instance sees, so one that has just started still has the last good
 * copy when a source is failing:
 * - "live": a small file that changes, held for one refresh interval;
 * - "immutable": addressed by version, so it never changes;
 * - "none": too large for the shared cache (its limit is 2 MB), read fresh.
 */
type Caching = "live" | "immutable" | "none";

const ATTEMPTS = 3;
const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch a source file, retrying a server error or a dropped connection twice
 * with a short backoff: on election night Clarity answers 502 now and then
 * under load, and the next request usually succeeds.
 */
async function get(url: string, caching: Caching = "none"): Promise<Response> {
  const init: RequestInit & { next?: { revalidate: number } } =
    caching === "live"
      ? { next: { revalidate: REFRESH_SECONDS } }
      : caching === "immutable"
        ? { cache: "force-cache" }
        : { cache: "no-store" };
  let last: unknown;
  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    if (attempt) await pause(500 * 3 ** (attempt - 1));
    try {
      const res = await fetch(url, { ...init, headers: UA, signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (res.ok) return res;
      last = new Error(`${res.status} from ${new URL(url).host}`);
      if (res.status < 500) break; // a 4xx will not fix itself
    } catch (error) {
      last = error;
    }
  }
  throw last;
}

const now = () => new Date().toISOString();

// Last good reading per source, kept in the server instance between refreshes.
// A source that fails keeps its last good reading, marked with the error.
const clarityCache = new Map<string, { version: string; parsed: ClarityResults; readAt: string }>();
let harrisCache: { summary: HarrisSummary; readAt: string } | null = null;
let sosCache: { counties: SosCounty[]; readAt: string } | null = null;
const harrisPrecinctCache = new Map<string, PrecinctDetail>();

async function readClarity(source: Extract<Source, { system: "clarity" }>): Promise<ClarityResults & { readAt: string }> {
  const base = `https://results.enr.clarityelections.com/TX/${source.slug}/${source.electionId}/`;
  const version = (await (await get(`${base}current_ver.txt`, "live")).text()).trim();
  const cached = clarityCache.get(source.county);
  if (cached?.version === version) return { ...cached.parsed, readAt: now() };
  const zip = Buffer.from(await (await get(`${base}${version}/reports/detailxml.zip`, "immutable")).arrayBuffer());
  const parsed = parseClarity(unzipEntry(zip, "detail.xml").toString("utf8").replace(/^﻿/, ""));
  clarityCache.set(source.county, { version, parsed, readAt: now() });
  return { ...parsed, readAt: now() };
}

async function readHarris(): Promise<{ summary: HarrisSummary; readAt: string }> {
  const summary = (await (await get(`${HARRIS_BASE}resultsbyballot.json`, "live")).json()) as HarrisSummary;
  harrisCache = { summary, readAt: now() };
  return harrisCache;
}

async function readSos(): Promise<{ counties: SosCounty[]; readAt: string }> {
  const counties = parseSos((await (await get(SOS_URL)).json()) as { upload: string });
  sosCache = { counties, readAt: now() };
  return sosCache;
}

const message = (e: unknown) => (e instanceof Error ? e.message : String(e)).slice(0, 160);

async function build(): Promise<Snapshot> {
  const [sosResult, harrisResult, ...clarityResults] = await Promise.allSettled([
    readSos(),
    readHarris(),
    ...SOURCES.filter((s) => s.system === "clarity").map((s) => readClarity(s)),
  ]);
  if (sosResult.status === "rejected") console.error("Texas SOS results read failed", sosResult.reason);
  const sos = sosResult.status === "fulfilled" ? sosResult.value : sosCache;
  const sosByCounty = new Map((sos?.counties ?? []).map((c) => [c.county, c]));

  let ci = 0;
  const counties: CountyReading[] = SOURCES.map((source) => {
    if (source.system === "clarity") {
      const r = clarityResults[ci++];
      const cached = clarityCache.get(source.county);
      const parsed = r.status === "fulfilled" ? r.value : cached ? { ...cached.parsed, readAt: cached.readAt } : null;
      if (r.status === "rejected") console.error(`Clarity results read failed for ${source.county}`, r.reason);
      return {
        county: source.county,
        system: "Clarity",
        resultsUrl: source.resultsUrl,
        updated: parsed?.updated ?? null,
        readAt: parsed?.readAt ?? now(),
        ballots: parsed?.ballots ?? null,
        reporting: parsed?.reporting ?? null,
        contests: parsed?.contests ?? [],
        hasPrecincts: Boolean(parsed?.precincts.size),
        ...(r.status === "rejected" ? { error: message(r.reason) } : {}),
      };
    }
    if (source.system === "harris") {
      const h = harrisResult.status === "fulfilled" ? harrisResult.value : harrisCache;
      if (harrisResult.status === "rejected") console.error("Harris results read failed", harrisResult.reason);
      return {
        county: "Harris",
        system: "HarrisVotes",
        resultsUrl: source.resultsUrl,
        updated: h?.summary.dt ?? null,
        readAt: h?.readAt ?? now(),
        ballots: h?.summary.bc ?? null,
        reporting: h ? `${h.summary.vc} of ${h.summary.vt} vote centers` : null,
        contests: h ? harrisContests(h.summary) : [],
        hasPrecincts: Boolean(h),
        ...(harrisResult.status === "rejected" ? { error: message(harrisResult.reason) } : {}),
      };
    }
    const c = sosByCounty.get(source.county);
    return {
      county: source.county,
      system: "Texas SOS",
      resultsUrl: source.resultsUrl,
      updated: null,
      readAt: sos?.readAt ?? now(),
      ballots: c?.ballots ?? null,
      reporting: null,
      contests: c?.contests ?? [],
      hasPrecincts: false,
      ...(sosResult.status === "rejected" ? { error: message(sosResult.reason) } : {}),
    };
  });

  return { readAt: now(), sos: sos?.counties ?? [], sosReadAt: sos?.readAt ?? null, counties };
}

let current: { at: number; promise: Promise<Snapshot> } | null = null;

/**
 * Every source, read at most once per REFRESH_SECONDS per server instance.
 * Concurrent callers share one read; a failed source keeps its last good
 * reading rather than emptying the page.
 */
export function getSnapshot(): Promise<Snapshot> {
  if (!current || Date.now() - current.at > REFRESH_SECONDS * 1000) {
    const promise = build();
    current = { at: Date.now(), promise };
    promise.catch(() => {
      if (current?.promise === promise) current = null;
    });
  }
  return current.promise;
}

/** One county's precinct detail for one race, or null where the county publishes none. */
export async function getPrecincts(county: string, key: string): Promise<PrecinctDetail | null> {
  const source = SOURCES.find((s) => s.county === county);
  if (!source || source.system === "sos") return null;
  await getSnapshot();
  if (source.system === "clarity") return clarityCache.get(county)?.parsed.precincts.get(key) ?? null;

  const summary = harrisCache?.summary;
  const contest = summary && harrisContests(summary).find((c) => c.key === key);
  if (!summary || !contest) return null;
  const cacheKey = `${summary.dt}|${contest.id}`;
  const hit = harrisPrecinctCache.get(cacheKey);
  if (hit) return hit;
  const file = (await (await get(`${HARRIS_BASE}pv-${contest.id}.json`)).json()) as HarrisPrecinctFile;
  const detail = harrisPrecincts(contest, file);
  if (harrisPrecinctCache.size > 400) harrisPrecinctCache.clear();
  harrisPrecinctCache.set(cacheKey, detail);
  return detail;
}
