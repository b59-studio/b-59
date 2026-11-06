import type { HourCount, LiveSnapshot, TrackerReading } from "./electionlink";

/** A tracker reading turned into the figures the page shows. */
export type LiveFigures = {
  /** In-person check-ins (early and election day) plus the state's mail count. */
  total: number;
  /** Election-day check-ins so far. */
  electionDay: number;
  /** Ballots cast before election day: early in-person check-ins plus mail. */
  beforeElectionDay: number;
  registered: number;
  mail: number;
  evInPerson: number;
  refreshed: string | null;
  url: string;
  /** The hour (Central) the tracker was refreshed in; hours before it are complete. */
  doneHour: number;
  /** Election-day check-ins through the last complete hour. */
  edThrough: number;
  /** The 2024 general's election-day check-ins through the same hour, or null with no 2024 data. */
  priorThrough: number | null;
  priorTotal: number;
  today: HourCount[];
  prior: HourCount[];
};

const sum = (rows: HourCount[]) => rows.reduce((a, [, v]) => a + v, 0);

/** The hour of day in Central time, 0–23. */
export function hourCentral(iso: string): number {
  const hour = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    hour: "numeric",
    hourCycle: "h23",
  }).format(new Date(iso));
  return Number(hour);
}

export function liveFigures(reading: TrackerReading | undefined): LiveFigures | null {
  if (!reading?.ballots) return null;
  const doneHour = reading.refreshed ? hourCentral(reading.refreshed) : 24;
  const through = (rows: HourCount[]) => sum(rows.filter(([h]) => h < doneHour));
  const priorTotal = sum(reading.prior);
  return {
    total: reading.ballots + reading.sos.mail,
    electionDay: sum(reading.today),
    beforeElectionDay: reading.ballots + reading.sos.mail - sum(reading.today),
    registered: reading.sos.registered,
    mail: reading.sos.mail,
    evInPerson: reading.sos.evInPerson,
    refreshed: reading.refreshed,
    url: reading.url,
    doneHour,
    edThrough: through(reading.today),
    priorThrough: priorTotal ? through(reading.prior) : null,
    priorTotal,
    today: reading.today,
    prior: reading.prior,
  };
}

/** The whole election so far, early vote included, against the 2024 general. */
export type YearComparison = {
  /** 2026 ballots through the last complete hour of election day. */
  now: number;
  /**
   * 2024 ballots through the same hour: the 2024 total less its election-day
   * check-ins after that hour. Null without a 2024 hourly table.
   */
  then: number | null;
  /** Every 2026 ballot so far as a share of every 2024 ballot. */
  ofTotal: number;
};

export function versus2024(L: LiveFigures, ballots2024: number): YearComparison {
  return {
    now: L.beforeElectionDay + L.edThrough,
    then: L.priorThrough != null ? ballots2024 - L.priorTotal + L.priorThrough : null,
    ofTotal: L.total / ballots2024,
  };
}

/**
 * Running totals for the whole election by hour of election day, 2026 and
 * 2024: everything cast before election day, plus that day's check-ins
 * through the hour. The 2024 base is its final total less its election-day
 * check-ins, so its last hour lands on the 2024 total.
 */
export function wholeElectionByHour(L: LiveFigures, ballots2024: number, hours: number[]) {
  const through = (rows: HourCount[], h: number) => sum(rows.filter(([x]) => x <= h));
  const base24 = ballots2024 - L.priorTotal;
  return hours.map((h) => ({
    hour: h,
    now: L.beforeElectionDay + through(L.today, h),
    then: L.priorTotal ? base24 + through(L.prior, h) : null,
  }));
}

/** Live figures by county name, for the counties whose tracker could be read. */
export function liveByCounty(snapshot: LiveSnapshot): Map<string, LiveFigures> {
  const out = new Map<string, LiveFigures>();
  for (const reading of snapshot.counties) {
    const figures = liveFigures(reading);
    if (figures) out.set(reading.name, figures);
  }
  return out;
}

// Formatting. The research is published in English, so numbers are en-US
// whatever locale the page is served in.
const numberFormat = new Intl.NumberFormat("en-US");
const timeFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Chicago",
  hour: "numeric",
  minute: "2-digit",
});

export const fmt = (x: number) => numberFormat.format(x);

/** A time of day in Central, e.g. "4:05 PM". */
export const timeCentral = (iso: string | null) => (iso ? timeFormat.format(new Date(iso)) : "");

const dateTimeFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Chicago",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

/** A date and time in Central, e.g. "Nov 4, 3:37 AM". For figures read days after the election. */
export const dateTimeCentral = (iso: string | null) => (iso ? dateTimeFormat.format(new Date(iso)) : "");

export const hourLabel = (h: number) => `${h % 12 || 12} ${h < 12 ? "AM" : "PM"}`;

const finite = (x: number | null | undefined): x is number => x != null && Number.isFinite(x);

export const pct = (x: number | null | undefined) => (finite(x) ? `${(x * 100).toFixed(1)}%` : "");

/** A Democratic-minus-Republican margin as D+n or R+n. */
export const margin = (m: number | null | undefined) =>
  finite(m) ? `${m >= 0 ? "D+" : "R+"}${Math.abs(m * 100).toFixed(1)}` : "";

/** A signed difference in points. */
export const points = (g: number | null | undefined) =>
  finite(g) ? `${g >= 0 ? "+" : "−"}${Math.abs(g * 100).toFixed(1)}` : "";
