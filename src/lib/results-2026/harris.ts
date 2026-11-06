import { cleanChoice, raceKey } from "./normalize";
import type { Contest, PrecinctDetail } from "./types";

/** Harris County's resultsbyballot.json, the fields used here. */
export type HarrisSummary = {
  dt: string;
  bc: number;
  vc: number;
  vt: number;
  /** tuv and tov: the contest's undervotes and overvotes, repeated once per candidate. */
  contests: { i: number; t: string; ca: string[]; tv?: number[]; tuv?: number[]; tov?: number[] }[];
};

/** A per-contest precinct file, pv-<id>.json: per-precinct arrays of per-candidate votes. */
export type HarrisPrecinctFile = {
  p: string[];
  AbsenteeVotes?: number[][];
  EarlyVotes?: number[][];
  ElectionVotes?: number[][];
};

const TYPES: [keyof HarrisPrecinctFile, string][] = [
  ["EarlyVotes", "Early in person"],
  ["AbsenteeVotes", "Mail"],
  ["ElectionVotes", "Election Day"],
];

/** County totals per contest. Candidate labels carry their party in parentheses, which is split off. */
export function harrisContests(summary: HarrisSummary): (Contest & { id: number })[] {
  return summary.contests.map((c) => ({
    id: c.i,
    key: raceKey(c.t),
    name: c.t,
    choices: c.ca.map((label, j) => {
      const [name, party] = cleanChoice(label, "");
      return { name, party, votes: c.tv?.[j] ?? 0 };
    }),
  }));
}

/**
 * Ballots counted. Harris publishes a field for it (bc) but leaves it at 0, so
 * when it is empty the count comes from the U.S. Senate contest, which is on
 * every ballot in the county: its votes, plus its undervotes and overvotes,
 * are one per ballot.
 */
export function harrisBallots(summary: HarrisSummary): number | null {
  if (summary.bc > 0) return summary.bc;
  const senate = summary.contests.find((c) => raceKey(c.t) === "US SENATOR");
  if (!senate?.tv) return null;
  const ballots = senate.tv.reduce((a, b) => a + b, 0) + (senate.tuv?.[0] ?? 0) + (senate.tov?.[0] ?? 0);
  return ballots || null;
}

/** One contest's precinct detail, leaving out precincts with no votes. */
export function harrisPrecincts(contest: Contest, file: HarrisPrecinctFile): PrecinctDetail {
  const rows = file.p
    .map((precinct, pi) => ({
      precinct,
      votes: TYPES.map(([field]) => (file[field] as number[][] | undefined)?.[pi] ?? contest.choices.map(() => 0)),
    }))
    .filter((r) => r.votes.some((byChoice) => byChoice.some((v) => v)));
  return {
    choices: contest.choices.map(({ name, party }) => ({ name, party })),
    types: TYPES.map(([, label]) => label),
    rows,
  };
}
