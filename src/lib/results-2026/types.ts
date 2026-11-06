/** One candidate or ballot option in a contest. */
export type Choice = { name: string; party: string; votes: number };

/** A contest's county-level totals. `key` matches the same race across sources (see raceKey). */
export type Contest = { key: string; name: string; choices: Choice[] };

/**
 * Precinct detail for one contest in one county. `types` names the vote types
 * (early in person, mail, election day…); `rows` holds, per precinct with any
 * votes, votes[typeIndex][choiceIndex]. Precincts with no votes are left out.
 */
export type PrecinctDetail = {
  choices: { name: string; party: string }[];
  types: string[];
  rows: { precinct: string; votes: number[][] }[];
};

/** Everything one county's own results system published, as last read. */
export type CountyReading = {
  county: string;
  /** "Clarity", "HarrisVotes" or "Texas SOS". */
  system: string;
  /** The county's own results page, for readers. */
  resultsUrl: string;
  /** The source's own update stamp, as it gives it. */
  updated: string | null;
  /** When this site last read the source (ISO). */
  readAt: string;
  ballots: number | null;
  /** e.g. "730 of 914 precincts" or "412 of 623 vote centers". */
  reporting: string | null;
  contests: Contest[];
  hasPrecincts: boolean;
  /**
   * "Unofficial" until the county canvasses (lists CANVASSED in snapshot.ts),
   * then "Canvassed". The state's own canvass is Snapshot.official.
   */
  status: "Unofficial" | "Canvassed";
  /** The county's canvass report, once posted. */
  canvassUrl?: string;
  /** A precinct-by-precinct report the county has posted as a PDF, where it has no machine-readable one. */
  precinctPdf?: string;
  error?: string;
};
