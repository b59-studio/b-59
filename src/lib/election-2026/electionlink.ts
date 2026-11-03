/**
 * The county ElectionLink turnout trackers for the 2026 general, read on the
 * server so the page refreshes from the deployment rather than from a laptop.
 *
 * Each tracker publishes two widgets: a summary page (registered voters,
 * ballots cast, last refresh) and an hourly check-in CSV. Both count in-person
 * poll-book check-ins only, which is why each county also carries the state's
 * early-vote figures: the mail count is added on top to reach a running total.
 */

export const ELECTION_DAY = "2026-11-03";
export const PRIOR_ELECTION_DAY = "2024-11-05";

/** How long a fetched tracker answer stands before the next request refetches it. */
export const LIVE_REVALIDATE_SECONDS = 900;

const BASE = "https://updates.electionlink.net/widgets";
const TIMEOUT_MS = 20_000;

/** The Secretary of State's early-vote figures for a county, final as of Oct 30. */
export type StateEarlyVote = { registered: number; evInPerson: number; mail: number };

export type Tracker = { slug: string; name: string; sos: StateEarlyVote };

/** Hour of day (0–23, Central) and the check-ins recorded in it. */
export type HourCount = [hour: number, checkins: number];

export type TrackerReading = {
  name: string;
  /** In-person check-ins, early and election day; null when the summary could not be read. */
  ballots: number | null;
  /** When the county last refreshed its tracker (ISO, UTC). */
  refreshed: string | null;
  today: HourCount[];
  prior: HourCount[];
  sos: StateEarlyVote;
  url: string;
};

export type LiveSnapshot = { fetched: string; counties: TrackerReading[] };

// Ordered as the page lists them. McLennan and Madison are not target counties
// and are carried for reference.
export const TRACKERS: Tracker[] = [
  { slug: "travistx", name: "Travis", sos: { registered: 945505, evInPerson: 427686, mail: 16221 } },
  { slug: "belltx", name: "Bell", sos: { registered: 246817, evInPerson: 80141, mail: 3252 } },
  { slug: "montgomerytx", name: "Montgomery", sos: { registered: 487323, evInPerson: 183345, mail: 8532 } },
  { slug: "ellistx", name: "Ellis", sos: { registered: 159133, evInPerson: 68519, mail: 648 } },
  { slug: "hockleytx", name: "Hockley", sos: { registered: 14373, evInPerson: 4407, mail: 162 } },
  { slug: "mclennantx", name: "McLennan", sos: { registered: 161164, evInPerson: 56006, mail: 2692 } },
  { slug: "madisontx", name: "Madison", sos: { registered: 8576, evInPerson: 2879, mail: 103 } },
];

export function widgetUrl(slug: string, date: string, file = ""): string {
  return `${BASE}/${slug}/${date}/${file}`;
}

/** Ballots cast and last-refresh time from a tracker's BallotTypeTurnout.html. */
export function parseSummary(html: string): { ballots: number | null; refreshed: string | null } {
  const text = decodeEntities(
    html
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, "")
      .replace(/<[^>]+>/g, " "),
  ).replace(/\s+/g, " ");
  const ballots = text.match(/BALLOTS CAST\s+([\d,]+)/i);
  const stamp = html.match(/var lastRefreshed = ([\d.]+)/);
  return {
    ballots: ballots ? Number(ballots[1].replace(/,/g, "")) : null,
    refreshed: stamp ? new Date(Number(stamp[1])).toISOString().replace(/\.\d{3}Z$/, "Z") : null,
  };
}

/**
 * Check-ins per hour on `date` (YYYY-MM-DD) from a tracker's
 * CheckinsPerHourTable.csv. The file holds one block per voting day, headed by
 * an MM/DD/YYYY line; a day can appear in more than one block, so its hours
 * are summed.
 */
export function parseHourly(csv: string, date: string): HourCount[] {
  const [y, m, d] = date.split("-");
  const want = `${m}/${d}/${y}`;
  const byHour = new Map<number, number>();
  let inDay = false;
  for (const line of csv.replace(/^﻿/, "").split(/\r?\n/)) {
    const s = line.trim();
    if (/^\d\d\/\d\d\/\d{4}$/.test(s)) {
      inDay = s === want;
      continue;
    }
    const row = inDay && s.match(/^(\d{1,2})(?::\d\d)?\s*(AM|PM)\b[^,]*,\s*(\d+)/);
    if (!row) continue;
    const hour = (Number(row[1]) % 12) + (row[2] === "PM" ? 12 : 0);
    byHour.set(hour, (byHour.get(hour) ?? 0) + Number(row[3]));
  }
  return [...byHour.entries()].sort(([a], [b]) => a - b);
}

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

async function getText(url: string, revalidate: number): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; b-59.com research)" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    next: { revalidate },
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

async function hourly(slug: string, date: string, revalidate: number): Promise<HourCount[]> {
  try {
    return parseHourly(await getText(widgetUrl(slug, date, "CheckinsPerHourTable.csv"), revalidate), date);
  } catch {
    // A county whose tracker has no hourly table, or whose 2024 tracker was wiped.
    return [];
  }
}

async function readTracker({ slug, name, sos }: Tracker): Promise<TrackerReading> {
  // The 2024 table no longer changes, so it is held for a day rather than refetched with the live one.
  const [summary, today, prior] = await Promise.all([
    getText(widgetUrl(slug, ELECTION_DAY, "BallotTypeTurnout.html"), LIVE_REVALIDATE_SECONDS)
      .then(parseSummary)
      .catch((error: unknown) => {
        console.error(`ElectionLink summary for ${name} failed`, error);
        return { ballots: null, refreshed: null };
      }),
    hourly(slug, ELECTION_DAY, LIVE_REVALIDATE_SECONDS),
    hourly(slug, PRIOR_ELECTION_DAY, 86_400),
  ]);
  return { name, ...summary, today, prior, sos, url: widgetUrl(slug, ELECTION_DAY, "BallotTypeTurnout.html") };
}

/** Every tracker, read in parallel. A county that fails comes back with null ballots, not an error. */
export async function fetchLiveSnapshot(): Promise<LiveSnapshot> {
  const counties = await Promise.all(TRACKERS.map(readTracker));
  return { fetched: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"), counties };
}
