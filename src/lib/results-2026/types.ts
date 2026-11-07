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
  /** Set where the detail was parsed from a county's PDF report rather than read from a results system. */
  parsed?: ParsedReport;
};

/** A county's precinct PDF, parsed here: when the county ran it, and how far its sums sit from the state's total. */
export type ParsedReport = {
  pdf: string;
  /** The report's own run stamp, as printed ("11/04/2026 1:08 AM"). */
  reportStamp: string;
  /** Largest gap between a race's precinct sum and the state's county total, as a fraction. */
  largestGap: number;
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
   * "Unofficial" until the county canvasses, then "Canvassed". Read from the
   * county's own results system or elections page, or from the state's
   * official flag (see canvass.ts); CANVASSED in snapshot.ts overrides.
   */
  status: "Unofficial" | "Canvassed";
  /** The county's canvass report, once posted. */
  canvassUrl?: string;
  /** Where the canvass was seen. */
  canvassVia?: "county page" | "county results system" | "state" | "checked by hand";
  /** A precinct-by-precinct report the county has posted as a PDF, where it has no machine-readable one. */
  precinctPdf?: string;
  /** Set when that PDF has been parsed into the precinct tables. */
  parsed?: ParsedReport;
  /** The county's site refuses automated requests, so nothing here can read it. */
  blocksReads?: boolean;
  error?: string;
};
