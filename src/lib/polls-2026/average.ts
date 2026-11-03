/**
 * The poll average: a recency- and sample-weighted mean of each pollster's
 * latest poll in a trailing window. Kept deliberately simple so the page can
 * explain it in a paragraph; the constants below are that paragraph.
 */

export type Population = "LV" | "RV" | "A";

export type Poll = {
  race: string;
  pollster: string;
  sponsor: string | null;
  /** Field dates, YYYY-MM-DD. */
  start: string;
  end: string;
  n: number;
  population: Population;
  /** Shares as published, in percent. */
  dem: number;
  rep: number;
  other: number | null;
  /** The sponsor's party for a partisan or campaign poll, else null. */
  partisan: "D" | "R" | null;
  url: string;
};

/** Polls whose fieldwork ended this many days before the date are averaged. */
export const WINDOW_DAYS = 30;
/** A poll's weight halves for every this many days since its fieldwork ended. */
export const HALF_LIFE_DAYS = 14;
/** Samples above this size count as this size, so one very large poll cannot swamp the rest. */
export const SAMPLE_CAP = 2000;

export type Weighted = { poll: Poll; weight: number; age: number };

export type Average = {
  dem: number;
  rep: number;
  /** Democratic minus Republican, in points. */
  margin: number;
  /** The polls that count, heaviest first; weights sum to 1. */
  polls: Weighted[];
};

const DAY = 86_400_000;
const dayNumber = (iso: string) => Math.round(Date.parse(`${iso}T00:00:00Z`) / DAY);

/** Whole days from `from` to `to` (both YYYY-MM-DD). */
export const daysBetween = (from: string, to: string) => dayNumber(to) - dayNumber(from);

export const addDays = (iso: string, days: number) => new Date((dayNumber(iso) + days) * DAY).toISOString().slice(0, 10);

/**
 * Whether a poll is eligible for the average at all: adults-only samples and
 * partisan or campaign polls are listed on the page but not averaged.
 */
export const countsTowardAverage = (p: Poll) => p.population !== "A" && p.partisan == null;

/** A poll's raw weight on `asOf`: √(capped sample) × ½^(age / half-life). */
export function pollWeight(p: Poll, asOf: string): number {
  const age = daysBetween(p.end, asOf);
  return Math.sqrt(Math.min(p.n, SAMPLE_CAP)) * 0.5 ** (age / HALF_LIFE_DAYS);
}

/**
 * Each pollster's latest eligible poll that ended within the window before
 * `asOf` (inclusive). A tie on end date goes to the larger sample.
 */
export function latestByPollster(polls: Poll[], asOf: string): Poll[] {
  const latest = new Map<string, Poll>();
  for (const p of polls) {
    const age = daysBetween(p.end, asOf);
    if (!countsTowardAverage(p) || age < 0 || age > WINDOW_DAYS) continue;
    const seen = latest.get(p.pollster);
    if (!seen || p.end > seen.end || (p.end === seen.end && p.n > seen.n)) latest.set(p.pollster, p);
  }
  return [...latest.values()];
}

/** The average on `asOf`, or null when no eligible poll ended in the window. */
export function pollAverage(polls: Poll[], asOf: string): Average | null {
  const used = latestByPollster(polls, asOf);
  if (!used.length) return null;
  const raw = used.map((poll) => ({ poll, weight: pollWeight(poll, asOf), age: daysBetween(poll.end, asOf) }));
  const total = raw.reduce((a, r) => a + r.weight, 0);
  const weighted = raw.map((r) => ({ ...r, weight: r.weight / total })).sort((a, b) => b.weight - a.weight);
  const dem = weighted.reduce((a, r) => a + r.poll.dem * r.weight, 0);
  const rep = weighted.reduce((a, r) => a + r.poll.rep * r.weight, 0);
  return { dem, rep, margin: dem - rep, polls: weighted };
}

export type TrendPoint = { date: string; dem: number; rep: number; margin: number };

/**
 * The average for every day from the first eligible poll's end date to
 * `asOf`. Days with no poll in the window are left out, so the line breaks
 * rather than inventing a value.
 */
export function trend(polls: Poll[], asOf: string): TrendPoint[] {
  const ends = polls.filter(countsTowardAverage).map((p) => p.end).sort();
  if (!ends.length) return [];
  const points: TrendPoint[] = [];
  for (let d = ends[0]; d <= asOf; d = addDays(d, 1)) {
    const avg = pollAverage(polls, d);
    if (avg) points.push({ date: d, dem: avg.dem, rep: avg.rep, margin: avg.margin });
  }
  return points;
}
