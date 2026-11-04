"use client";

import { fmt, pct } from "@/lib/election-2026/live";
import { CORE, DATA } from "./data";
import { Panel } from "./parts";

const share = (geo: string, year: "2022" | "2024") => DATA.ev[geo][3] / DATA.gen[geo][year][1];

/**
 * The page's one finding, before any table: how much of each county's entire
 * 2022 turnout the 2026 early vote has already matched. 2022 is the yardstick
 * because it was the last midterm, so the comparison is like for like; the
 * 2024 presidential comparison is a sentence here and a column in the tables.
 * Bars are HTML rather than SVG so their labels stay readable at any width.
 */
export function HeadlineChart() {
  const counties = CORE.map((g) => ({ g, s: share(g, "2022") })).sort((a, b) => b.s - a.s);
  const rows = [{ g: "Statewide", s: share("Statewide", "2022") }, ...counties];
  const max = Math.max(1.1, ...rows.map((r) => r.s));
  const at = (s: number) => `${(s / max) * 100}%`;
  const focus = counties.filter((r) => r.g !== "Travis");
  const passed = focus.filter((r) => r.s >= 1).length;

  return (
    <Panel title="Early vote compared with all of 2022" expandable={false}>
      <p className="ea-note ea-note-lead">
        {passed
          ? `${passed} of the ${focus.length} focus counties cast more early ballots than in the whole 2022 midterm, before election day began.`
          : `None of the ${focus.length} focus counties has yet matched its whole 2022 midterm turnout.`}{" "}
        Against the 2024 presidential election, a higher bar, the state’s early vote stands at{" "}
        {pct(share("Statewide", "2024"))} of the total.
      </p>
      <figure className="ea-bars">
        <div className="ea-bars-plot" style={{ "--ea-ref": 1 / max } as React.CSSProperties}>
          <span className="ea-bars-ref" aria-hidden="true">
            <span>All of 2022</span>
          </span>
          {rows.map(({ g, s }) => (
            <div
              key={g}
              className={`ea-bars-row${g === "Statewide" ? " ea-bars-state" : ""}${g === "Travis" ? " ea-bars-bench" : ""}`}
            >
              <span className="ea-bars-name">{g}</span>
              <span className="ea-bars-track">
                <span className="ea-bars-bar" style={{ width: at(s) }} />
                <span className="ea-bars-val">{pct(s)}</span>
              </span>
            </div>
          ))}
        </div>
        <figcaption className="ea-note">
          2026 early ballots ({fmt(DATA.ev.Statewide[3])} statewide, in person and mail) as a share of every ballot cast
          in the 2022 general. Past 100%, a county has already beaten its whole 2022 turnout. Travis is a benchmark
          rather than one of the 17. Sources: Texas SOS, Texas Legislative Council.
        </figcaption>
      </figure>
    </Panel>
  );
}
