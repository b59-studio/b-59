import type { HourCount, LiveSnapshot, TrackerReading } from "./electionlink";

/** A tracker reading turned into the figures the page shows. */
export type LiveFigures = {
  /** In-person check-ins (early and election day) plus the state's mail count. */
  total: number;
  /** Election-day check-ins so far. */
  electionDay: number;
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

export const hourLabel = (h: number) => `${h % 12 || 12} ${h < 12 ? "AM" : "PM"}`;

const finite = (x: number | null | undefined): x is number => x != null && Number.isFinite(x);

export const pct = (x: number | null | undefined) => (finite(x) ? `${(x * 100).toFixed(1)}%` : "");

/** A Democratic-minus-Republican margin as D+n or R+n. */
export const margin = (m: number | null | undefined) =>
  finite(m) ? `${m >= 0 ? "D+" : "R+"}${Math.abs(m * 100).toFixed(1)}` : "";

/** A signed difference in points. */
export const points = (g: number | null | undefined) =>
  finite(g) ? `${g >= 0 ? "+" : "−"}${Math.abs(g * 100).toFixed(1)}` : "";
