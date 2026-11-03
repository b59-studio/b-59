import demographics from "@/data/election-2026/demographics.json";

/**
 * County demographics from public sources, built by
 * scripts/election-2026/build_demographics.py. Shapes, as stored:
 *
 * - surname[geo][year]: [Spanish-surname registered, registered,
 *   Spanish-surname voters, voters] for each general (Texas Legislative Council)
 * - residents[geo]: Census 2024 estimates — population; Hispanic, non-Hispanic
 *   White, Black, Asian and other shares; female share; and `ages`, the shares
 *   under 20, 20–34, 35–49, 50–64 and 65+
 * - map: SVG path data per county in a width × height view box (Census
 *   cartographic boundaries, Albers projection)
 */
type Residents = {
  pop: number;
  hispanic: number;
  white: number;
  black: number;
  asian: number;
  other: number;
  female: number;
  ages: number[];
};

type Demographics = {
  surname: Record<string, Record<string, [number, number, number, number]>>;
  residents: Record<string, Residents>;
  map: { width: number; height: number; paths: Record<string, string> };
  censusYear: string;
};

export const DEMO = demographics as unknown as Demographics;

export const AGE_BRACKETS = ["Under 20", "20–34", "35–49", "50–64", "65+"];

/** Hispanic-surname turnout for one geography and general. */
export function surnameFigures(geo: string, year: string) {
  const [ssReg, reg, ssVoters, voters] = DEMO.surname[geo][year];
  return {
    shareOfRegistered: ssReg / reg,
    shareOfVoters: ssVoters / voters,
    turnout: ssVoters / ssReg,
    otherTurnout: (voters - ssVoters) / (reg - ssReg),
  };
}
