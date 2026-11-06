import type { SosCounty } from "./sos";

/**
 * The 2026 count by geography, from the Secretary of State's county-by-race
 * file, in the shapes the research pages compare against earlier years and
 * against the polls. Unofficial until the state marks the election official.
 */

/** Offices compared across years, with their Secretary of State race key. */
export const OFFICES = [
  { id: "senate", sosKey: "US SENATOR", label: "U.S. Senate" },
  { id: "governor", sosKey: "GOVERNOR", label: "Governor" },
  { id: "railroad", sosKey: "RAILROAD COMMISSIONER", label: "Railroad Commissioner" },
  { id: "comptroller", sosKey: "COMPTROLLER OF PUBLIC ACCOUNTS", label: "Comptroller" },
] as const;
export type OfficeId = (typeof OFFICES)[number]["id"];

/** Democratic votes, Republican votes, and all votes in a race. */
export type RaceVotes = [dem: number, rep: number, total: number];

export type FinalGeo = { registered: number; ballots: number; races: Partial<Record<OfficeId, RaceVotes>> };

export type Final2026 = {
  /** County name, plus "Statewide" and "Valley". */
  geos: Record<string, FinalGeo>;
  /** Whether the state has marked the election official (canvassed). */
  official: boolean;
  /** When the state's file was read (ISO). */
  readAt: string | null;
};

const VALLEY = ["Hidalgo", "Cameron", "Starr", "Willacy"];

/** A race's Democratic, Republican and total votes; parties as normalised by parseSos. */
export function partyVotes(choices: { party: string; votes: number }[]): RaceVotes {
  let dem = 0;
  let rep = 0;
  let total = 0;
  for (const c of choices) {
    total += c.votes;
    if (c.party === "DEM") dem += c.votes;
    else if (c.party === "REP") rep += c.votes;
  }
  return [dem, rep, total];
}

const add = (a: RaceVotes | undefined, b: RaceVotes): RaceVotes => (a ? [a[0] + b[0], a[1] + b[1], a[2] + b[2]] : [...b]);

/** Every county, the Valley and the state, with turnout and the compared offices. */
export function finalByGeo(sos: SosCounty[], official: boolean, readAt: string | null): Final2026 {
  const geos: Record<string, FinalGeo> = {};
  const into = (name: string, county: SosCounty, races: Partial<Record<OfficeId, RaceVotes>>) => {
    const g = (geos[name] ??= { registered: 0, ballots: 0, races: {} });
    g.registered += county.registered;
    g.ballots += county.ballots;
    for (const [id, v] of Object.entries(races) as [OfficeId, RaceVotes][]) g.races[id] = add(g.races[id], v);
  };
  for (const county of sos) {
    const races: Partial<Record<OfficeId, RaceVotes>> = {};
    for (const office of OFFICES) {
      const race = county.contests.find((r) => r.key === office.sosKey);
      if (race) races[office.id] = partyVotes(race.choices);
    }
    into(county.county, county, races);
    into("Statewide", county, races);
    if (VALLEY.includes(county.county)) into("Valley", county, races);
  }
  return { geos, official, readAt };
}

/**
 * Statewide Democratic and Republican shares of all votes for a set of races,
 * in percent, as polls report them. The generic ballot is every U.S. House
 * race added together.
 */
export function statewideShares(sos: SosCounty[], match: (key: string) => boolean): { dem: number; rep: number; margin: number; total: number } | null {
  let sum: RaceVotes = [0, 0, 0];
  for (const county of sos) for (const race of county.contests) if (match(race.key)) sum = add(sum, partyVotes(race.choices));
  if (!sum[2]) return null;
  const dem = (sum[0] / sum[2]) * 100;
  const rep = (sum[1] / sum[2]) * 100;
  return { dem, rep, margin: dem - rep, total: sum[2] };
}

/** The Secretary of State race key, or a matcher, behind each poll race. */
export const POLL_RACE_KEYS: Record<string, (key: string) => boolean> = {
  "us-senate": (k) => k === "US SENATOR",
  governor: (k) => k === "GOVERNOR",
  "lt-governor": (k) => k === "LIEUTENANT GOVERNOR",
  "attorney-general": (k) => k === "ATTORNEY GENERAL",
  comptroller: (k) => k === "COMPTROLLER OF PUBLIC ACCOUNTS",
  "railroad-commissioner": (k) => k === "RAILROAD COMMISSIONER",
  "generic-ballot": (k) => k.startsWith("US REPRESENTATIVE"),
};
