import turnout from "@/data/election-2026/turnout.json";

/**
 * Turnout and results for the target counties, built from Texas Legislative
 * Council precinct data (2014–2024, summed to county) and the Secretary of
 * State's early-voting feed (2026). Shapes, as stored:
 *
 * - geos: [name, region, isIndentedUnderValley]
 * - gen[geo][year]: [registered, ballots] for each general
 * - prim[geo][year]: [Democratic, Republican, registered] primary ballots
 * - ev[geo]: [registered, in person, mail, total] for the 2026 early vote
 * - races: [geo, year, office, Democrat, Republican, D votes, R votes, all votes]
 */
type Geo = [name: string, region: string, isSub: boolean];
export type Race = [geo: string, year: string, office: string, dem: string, rep: string, d: number, r: number, total: number];

type TurnoutData = {
  geos: Geo[];
  gen: Record<string, Record<string, [number, number]>>;
  prim: Record<string, Record<string, [number, number, number]>>;
  ev: Record<string, [number, number, number, number]>;
  races: Race[];
  evAsOf: string;
};

export const DATA = turnout as unknown as TurnoutData;

export const YEARS = ["2014", "2016", "2018", "2020", "2022", "2024"];
export const MIDTERMS = ["2014", "2018", "2022"];
export const TOP_OF_TICKET: Record<string, string> = {
  "2014": "Governor",
  "2016": "President",
  "2018": "U.S. Senate",
  "2020": "President",
  "2022": "Governor",
  "2024": "President",
};
export const SHORT_OFFICE: Record<string, string> = {
  Governor: "Gov",
  "U.S. Senate": "Sen",
  President: "Pres",
  "Railroad Comm.": "RRC",
  Comptroller: "Comp",
};
export const officeName = (office: string) => (office === "Railroad Comm." ? "Railroad Commissioner" : office);

/** Single counties only: the Valley and Statewide rows are sums of others. */
export const COUNTIES = DATA.geos.map(([g]) => g).filter((g) => g !== "Valley" && g !== "Statewide");
/** Target counties, without the Travis benchmark. */
export const TARGETS = COUNTIES.filter((g) => g !== "Travis");

const raceIndex = new Map(DATA.races.map((r) => [`${r[0]}|${r[1]}|${r[2]}`, r]));
export const race = (geo: string, year: string, office: string) => raceIndex.get(`${geo}|${year}|${office}`);

/** Democratic minus Republican share of all votes cast in the race. */
export const raceMargin = (r: Race | undefined) => (r ? (r[5] - r[6]) / r[7] : null);

/** 2022 general ballots, the turnout yardstick most columns compare with. */
export const ballots2022 = (geo: string) => DATA.gen[geo]?.["2022"]?.[1];

/** A cell fill shading toward a data colour, 0 to 1. */
export const shade = (color: "dem" | "rep", strength: number) => ({
  background: `color-mix(in srgb, var(--ea-${color}) ${Math.round(Math.max(0, Math.min(1, strength)) * 45)}%, var(--ea-panel))`,
});
