import turnout from "@/data/election-2026/turnout.json";

/**
 * Turnout and results for every Texas county, built by
 * scripts/election-2026/build_data.py from Texas Legislative Council precinct
 * data (2016–2024, summed to county), the Secretary of State's early-voting
 * files (2026) and the Census Bureau's 2024 county estimates. Shapes, as stored:
 *
 * - geos: [name, group, isIndentedUnderValley, 2024 population], in display
 *   order: the state, the Travis benchmark, the 17 focus counties (the Valley
 *   row with its four counties beneath it), then every other county by size
 * - gen[geo][year]: [registered, ballots] for each general
 * - prim[geo][year]: [Democratic, Republican, registered] primary ballots
 * - ev[geo]: [registered, in person, mail, total] for the 2026 early vote
 * - raceMeta["year|office"]: [Democrat, Republican]
 * - races[geo]["year|office"]: [D votes, R votes, all votes]
 */
export type Group = "statewide" | "benchmark" | "focus" | "other";
export type Geo = [name: string, group: Group, isSub: boolean, population: number];
export type Race = [geo: string, year: string, office: string, dem: string, rep: string, d: number, r: number, total: number];

type TurnoutData = {
  geos: Geo[];
  gen: Record<string, Record<string, [number, number]>>;
  prim: Record<string, Record<string, [number, number, number]>>;
  ev: Record<string, [number, number, number, number]>;
  raceMeta: Record<string, [string, string]>;
  races: Record<string, Record<string, [number, number, number]>>;
  evAsOf: string;
};

export const DATA = turnout as unknown as TurnoutData;

/** Every row a table lists under its pinned Statewide row, in display order. */
export const ROWS = DATA.geos.filter(([, group]) => group !== "statewide");

/** What each group of rows is called where a table labels it. */
export const GROUP_LABEL: Record<Exclude<Group, "statewide">, string> = {
  benchmark: "Benchmark",
  focus: "The 17 focus counties",
  other: "Every other county, by population",
};

export const YEARS = ["2016", "2018", "2020", "2022", "2024"];
export const MIDTERMS = ["2018", "2022"];
export const TOP_OF_TICKET: Record<string, string> = {
  "2016": "President",
  "2018": "U.S. Senate",
  "2020": "President",
  "2022": "Governor",
  "2024": "President",
};
export const SHORT_OFFICE: Record<string, string> = {
  Governor: "Governor",
  "U.S. Senate": "Senate",
  President: "President",
  "Railroad Comm.": "Railroad Comm.",
  Comptroller: "Comptroller",
};
export const officeName = (office: string) => (office === "Railroad Comm." ? "Railroad Commissioner" : office);

/** The 17 focus counties, as single counties (the Valley row is their sum, not a county). */
export const FOCUS = ROWS.filter(([g, group]) => group === "focus" && g !== "Valley").map(([g]) => g);
/** Where each focus county sits, for sections that group places by geography. */
const REGION: Record<string, string> = {
  "El Paso": "Border", Valley: "Border", Hidalgo: "Border", Cameron: "Border", Starr: "Border", Willacy: "Border",
  Webb: "Border", Maverick: "Border",
  Harris: "Metro", Dallas: "Metro", Bexar: "Metro",
  Collin: "Suburban", Denton: "Suburban", Williamson: "Suburban", Bell: "Suburban", Montgomery: "Suburban",
  Ellis: "Suburban",
  Hockley: "Rural",
};
const SECTIONS = ["Statewide", "Benchmark", "Border", "Metro", "Suburban", "Rural", "Other counties, by population"];

/** Every geography grouped by geography: the state, Travis, the 17 by region, then the rest by size. */
export const BY_GEOGRAPHY = DATA.geos
  .map(([g, group]) => ({
    geo: g,
    section:
      group === "statewide" ? "Statewide" : group === "benchmark" ? "Benchmark" : REGION[g] ?? "Other counties, by population",
  }))
  .sort((a, b) => SECTIONS.indexOf(a.section) - SECTIONS.indexOf(b.section));

/** The focus counties and the Travis benchmark: the set the win calculator works over. */
export const CORE = [...FOCUS, "Travis"];

export const race = (geo: string, year: string, office: string): Race | undefined => {
  const key = `${year}|${office}`;
  const votes = DATA.races[geo]?.[key];
  const names = DATA.raceMeta[key];
  return votes && names ? [geo, year, office, names[0], names[1], ...votes] : undefined;
};

/** Democratic minus Republican share of all votes cast in the race. */
export const raceMargin = (r: Race | undefined) => (r ? (r[5] - r[6]) / r[7] : null);

/** 2022 general ballots, the turnout yardstick most columns compare with. */
export const ballots2022 = (geo: string) => DATA.gen[geo]?.["2022"]?.[1];

/** 2024 general ballots, the last presidential election, for whole-election comparisons. */
export const ballots2024 = (geo: string) => DATA.gen[geo]?.["2024"]?.[1];

/**
 * A cell fill, 0 to 1. Party colours mark partisan measures only (margins,
 * primary share); turnout, which has no party, shades in neutral ink.
 */
export const shade = (color: "dem" | "rep" | "ink", strength: number) => {
  const s = Math.max(0, Math.min(1, strength));
  return {
    background:
      color === "ink"
        ? `color-mix(in srgb, var(--ea-fg) ${Math.round(s * 18)}%, var(--ea-panel))`
        : `color-mix(in srgb, var(--ea-${color}) ${Math.round(s * 45)}%, var(--ea-panel))`,
  };
};

/** The four Rio Grande Valley counties the tables sum as "Valley". */
export const VALLEY = ["Hidalgo", "Cameron", "Starr", "Willacy"];
