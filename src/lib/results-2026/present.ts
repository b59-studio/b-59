import { sumCounties, type SosCounty } from "./sos";
import type { Choice, Contest, CountyReading } from "./types";

/** The parts of a snapshot these views need; kept structural so they test without the network. */
export type SnapshotLike = { readAt: string; sos: SosCounty[]; sosReadAt: string | null; counties: CountyReading[] };

export type RaceSummary = { key: string; name: string; group: string; counties: string[] };

export type Column = { name: string; party: string };

export type RaceRow = {
  county: string;
  system: string;
  resultsUrl: string;
  updated: string | null;
  readAt: string;
  votes: number[];
  other: number;
  total: number;
  hasPrecincts: boolean;
};

export type RaceDetail = {
  key: string;
  name: string;
  columns: Column[];
  /**
   * The best statewide count available: each followed county from whichever of
   * its own system and the state is further along, plus every other county
   * from the state. `fromCounties` says how many followed counties came from
   * their own system.
   */
  statewide: { votes: number[]; other: number; total: number; counties: number; fromCounties: number; readAt: string | null } | null;
  rows: RaceRow[];
  rest: { votes: number[]; other: number; total: number; counties: number } | null;
};

export type CountyStatus = Omit<CountyReading, "contests">;

const STATEWIDE_ORDER = [
  "US SENATOR",
  "GOVERNOR",
  "LIEUTENANT GOVERNOR",
  "ATTORNEY GENERAL",
  "COMPTROLLER OF PUBLIC ACCOUNTS",
  "COMMISSIONER OF THE GENERAL LAND OFFICE",
  "COMMISSIONER OF AGRICULTURE",
  "RAILROAD COMMISSIONER",
];

const GROUPS = [
  "Statewide",
  "Statewide courts",
  "U.S. House",
  "Texas Senate",
  "Texas House",
  "State Board of Education",
  "Appeals courts",
  "Other state and district races",
];

function groupOf(key: string, inSos: number, totalSos: number): string {
  if (key.startsWith("US REPRESENTATIVE")) return "U.S. House";
  if (key.startsWith("STATE SENATOR")) return "Texas Senate";
  if (key.startsWith("STATE REPRESENTATIVE")) return "Texas House";
  if (key.startsWith("MEMBER STATE BOARD OF EDUCATION")) return "State Board of Education";
  if (inSos && inSos === totalSos) return /COURT|JUSTICE|JUDGE/.test(key) ? "Statewide courts" : "Statewide";
  if (/COURT OF APPEALS/.test(key)) return "Appeals courts";
  return inSos ? "Other state and district races" : "";
}

/** Sort "DISTRICT 2" before "DISTRICT 10". */
const natural = (a: string, b: string) => a.localeCompare(b, "en", { numeric: true });

const titleCase = (s: string) =>
  s
    .toLowerCase()
    .replace(/\b([a-z])/g, (c) => c.toUpperCase())
    .replace(/\bU\. S\./g, "U.S.")
    .replace(/\b(Of|The|And|For|To|In)\b/g, (w) => w.toLowerCase())
    .replace(/^(.)/, (c) => c.toUpperCase());

/**
 * Every race on the ballot in at least one of the 19 counties, grouped (statewide,
 * U.S. House, Texas Senate…, then each county's local races) and ordered within
 * each group. Names come from a county's own system where it has one, since
 * those are properly cased; otherwise from the state's capitals.
 */
export function raceIndex(s: SnapshotLike): RaceSummary[] {
  const totalSos = s.sos.length;
  const sosCount = new Map<string, number>();
  const sosName = new Map<string, string>();
  for (const c of s.sos)
    for (const r of c.contests) {
      sosCount.set(r.key, (sosCount.get(r.key) ?? 0) + 1);
      if (!sosName.has(r.key)) sosName.set(r.key, r.name);
    }

  const races = new Map<string, RaceSummary>();
  for (const county of s.counties) {
    for (const c of county.contests) {
      let race = races.get(c.key);
      if (!race) {
        const inSos = sosCount.get(c.key) ?? 0;
        const group = groupOf(c.key, inSos, totalSos) || `Local: ${county.county}`;
        race = { key: c.key, name: county.system === "Texas SOS" ? titleCase(c.name) : c.name, group, counties: [] };
        races.set(c.key, race);
      }
      if (county.system !== "Texas SOS" && race.name === titleCase(sosName.get(c.key) ?? "")) race.name = c.name;
      if (!race.counties.includes(county.county)) race.counties.push(county.county);
      if (race.group.startsWith("Local: ") && !race.group.endsWith(county.county)) race.group = "Local races in several counties";
    }
  }

  const groupRank = (g: string) => (GROUPS.includes(g) ? GROUPS.indexOf(g) : g.startsWith("Local races") ? GROUPS.length : GROUPS.length + 1);
  const statewideRank = (k: string) => (STATEWIDE_ORDER.includes(k) ? STATEWIDE_ORDER.indexOf(k) : STATEWIDE_ORDER.length);
  return [...races.values()].sort(
    (a, b) =>
      groupRank(a.group) - groupRank(b.group) ||
      natural(a.group, b.group) ||
      statewideRank(a.key) - statewideRank(b.key) ||
      natural(a.key, b.key),
  );
}

/** A candidate's identity across sources: the surname, letters only, and the party when given. */
const surname = (name: string) => {
  const words = name
    .toUpperCase()
    .replace(/"[^"]*"|\([^)]*\)/g, " ")
    .replace(/\b(JR|SR|II|III|IV)\b\.?/g, " ")
    .replace(/[^A-Z\s-]/g, "")
    .trim()
    .split(/\s+/);
  return words[words.length - 1] ?? "";
};

/**
 * Votes for each column, matching a source's choices to the columns by surname
 * (and party where both give one). Anything that matches no column, such as
 * write-ins, goes to `other`.
 */
function align(columns: Column[], choices: Choice[]): { votes: number[]; other: number; total: number } {
  const votes = columns.map(() => 0);
  let other = 0;
  for (const ch of choices) {
    const s = surname(ch.name);
    const i = columns.findIndex((c) => surname(c.name) === s && (!c.party || !ch.party || c.party === ch.party));
    if (i >= 0 && s) votes[i] += ch.votes;
    else other += ch.votes;
  }
  return { votes, other, total: votes.reduce((a, b) => a + b, 0) + other };
}

const isWriteIn = (c: Choice) => /write[- ]?in/i.test(c.name) || c.party === "W" || c.party === "NON";

const totalVotes = (c: Contest) => c.choices.reduce((a, x) => a + x.votes, 0);

/**
 * A county's figures for a race: its own system, unless the state has counted
 * more of that county's votes (an own system that has not posted yet, or
 * stalled), in which case the state's.
 */
function contestFor(s: SnapshotLike, county: CountyReading, key: string): { contest: Contest; reading: CountyReading } | null {
  const own = county.contests.find((c) => c.key === key);
  const sos = s.sos.find((c) => c.county === county.county)?.contests.find((c) => c.key === key);
  const sosReading = { ...county, system: "Texas SOS", updated: null, readAt: s.sosReadAt ?? county.readAt, hasPrecincts: false };
  if (own && (!sos || totalVotes(own) >= totalVotes(sos))) return { contest: own, reading: county };
  if (sos) return { contest: sos, reading: own ? { ...sosReading, hasPrecincts: county.hasPrecincts } : sosReading };
  return null;
}

/**
 * One race: the statewide sum from the Secretary of State, each of the 19
 * counties from its own system, and the rest of Texas as one row.
 */
export function raceDetail(s: SnapshotLike, key: string): RaceDetail | null {
  const statewideSum = sumCounties(s.sos, key);
  const found = s.counties.map((c) => contestFor(s, c, key)).filter((x) => x != null);
  const base = statewideSum?.contest ?? found[0]?.contest;
  if (!base) return null;

  const columns: Column[] = base.choices
    .filter((c) => !isWriteIn(c))
    .sort((a, b) => b.votes - a.votes)
    .map(({ name, party }) => {
      const display = found.flatMap((f) => f.contest.choices).find((c) => surname(c.name) === surname(name) && c.name !== c.name.toUpperCase());
      return { name: display?.name ?? titleCase(name), party };
    });

  const rows: RaceRow[] = found.map(({ contest, reading }) => ({
    county: reading.county,
    system: reading.system,
    resultsUrl: reading.resultsUrl,
    updated: reading.updated,
    readAt: reading.readAt,
    hasPrecincts: reading.hasPrecincts && reading.contests.some((c) => c.key === key),
    ...align(columns, contest.choices),
  }));

  const followed = new Set(s.counties.map((c) => c.county));
  const restCounties = s.sos.filter((c) => !followed.has(c.county));
  const restSum = sumCounties(restCounties, key);
  const rest = restSum ? { ...align(columns, restSum.contest.choices), counties: restSum.counties } : null;

  const statewide =
    rows.length || rest
      ? {
          votes: columns.map((_, i) => rows.reduce((a, r) => a + r.votes[i], 0) + (rest?.votes[i] ?? 0)),
          other: rows.reduce((a, r) => a + r.other, 0) + (rest?.other ?? 0),
          total: rows.reduce((a, r) => a + r.total, 0) + (rest?.total ?? 0),
          counties: rows.length + (rest?.counties ?? 0),
          fromCounties: rows.filter((r) => r.system !== "Texas SOS").length,
          readAt: s.sosReadAt,
        }
      : null;

  return {
    key,
    name: found.find((f) => f.reading.system !== "Texas SOS")?.contest.name ?? titleCase(base.name),
    columns,
    statewide,
    rows,
    rest,
  };
}

/** Each followed county's source status, without its contests. */
export function countyStatuses(s: SnapshotLike): CountyStatus[] {
  return s.counties.map((c) => {
    const status: Partial<CountyReading> = { ...c };
    delete status.contests;
    return status as CountyStatus;
  });
}

/** The default race: the U.S. Senate if it is on the ballot, else the first race listed. */
export function defaultRace(index: RaceSummary[]): string | null {
  return index.find((r) => r.key === "US SENATOR")?.key ?? index[0]?.key ?? null;
}
