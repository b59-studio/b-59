import type { RaceDetail } from "./present";
import type { SosCounty } from "./sos";
import type { PrecinctDetail } from "./types";

const HEADER = ["level", "county", "precinct", "vote_type", "candidate", "party", "votes", "source", "as_of"];

const cell = (v: string | number) => {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/**
 * One race as CSV: the statewide sum, every county the Secretary of State
 * reports, the followed counties from their own systems, and precinct rows by
 * vote type wherever a county publishes them. Rows with no votes are left out
 * of the precinct section, which would otherwise be mostly zeros.
 */
export function raceCsv(
  detail: RaceDetail,
  sos: SosCounty[],
  sosReadAt: string | null,
  precincts: { county: string; system: string; readAt: string; detail: PrecinctDetail }[],
): string {
  const rows: (string | number)[][] = [HEADER];
  const names = [...detail.columns.map((c) => [c.name, c.party]), ["Other", ""]];

  if (detail.statewide) {
    const sw = detail.statewide;
    [...sw.votes, sw.other].forEach((v, i) => rows.push(["statewide", "", "", "total", names[i][0], names[i][1], v, "best available: followed counties' own systems where ahead, Texas SOS for the rest", sosReadAt ?? ""]));
  }
  for (const c of sos) {
    const race = c.contests.find((r) => r.key === detail.key);
    if (!race) continue;
    for (const ch of race.choices) rows.push(["county", c.county, "", "total", ch.name, ch.party, ch.votes, "Texas SOS", sosReadAt ?? ""]);
  }
  for (const r of detail.rows) {
    if (r.system === "Texas SOS") continue;
    [...r.votes, r.other].forEach((v, i) => rows.push(["county", r.county, "", "total", names[i][0], names[i][1], v, r.system, r.readAt]));
  }
  for (const p of precincts) {
    for (const row of p.detail.rows) {
      row.votes.forEach((byChoice, ti) =>
        byChoice.forEach((v, ci) => {
          if (v) rows.push(["precinct", p.county, row.precinct, p.detail.types[ti], p.detail.choices[ci].name, p.detail.choices[ci].party, v, p.system, p.readAt]);
        }),
      );
    }
  }
  return rows.map((r) => r.map(cell).join(",")).join("\n") + "\n";
}

/** A file name for a race's CSV, e.g. tx-2026-results-us-senator.csv. */
export function csvFileName(name: string): string {
  return `tx-2026-results-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.csv`;
}
