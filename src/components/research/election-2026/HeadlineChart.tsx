"use client";

import { fmt, pct } from "@/lib/election-2026/live";
import { CORE, DATA } from "./data";
import { Panel } from "./parts";

const ballots = (geo: string, year: "2022" | "2024") => DATA.gen[geo][year][1];

/**
 * The page's one finding, before any table: how much of each county's entire
 * 2022 and 2024 turnout the 2026 early vote has already matched. The bar is
 * the share of 2022 (the last midterm); the line across it is the share of
 * 2024 (the last presidential year), on the same scale. Bars are HTML rather
 * than SVG so their labels stay readable at any width; the numbers are also in
 * the tables below.
 */
export function HeadlineChart() {
  const rows = CORE.map((g) => {
    const early = DATA.ev[g][3];
    return { g, early, of22: early / ballots(g, "2022"), of24: early / ballots(g, "2024") };
  }).sort((a, b) => b.of22 - a.of22);
  const statewide = DATA.ev.Statewide[3] / ballots("Statewide", "2022");
  const max = Math.max(1.1, ...rows.map((r) => r.of22));
  const at = (share: number) => `${(share / max) * 100}%`;
  const frac = (share: number) => ({ "--ea-ref": share / max }) as React.CSSProperties;
  const focus = rows.filter((r) => r.g !== "Travis");
  const passed22 = focus.filter((r) => r.of22 >= 1).length;
  const passed24 = focus.filter((r) => r.of24 >= 1).length;
  const closest24 = [...focus].sort((a, b) => b.of24 - a.of24)[0];

  return (
    <Panel title="Early vote as a share of 2022 and 2024 turnout" expandable={false}>
      <p className="ea-note ea-note-lead">
        {passed22
          ? `${passed22} of the ${focus.length} focus counties cast more early ballots than in all of the 2022 midterm, before election day began.`
          : `None of the ${focus.length} focus counties has yet matched its 2022 midterm turnout.`}{" "}
        {passed24
          ? `${passed24} also passed their 2024 presidential turnout.`
          : `None has reached its 2024 presidential turnout; ${closest24.g} is closest, at ${pct(closest24.of24)}.`}
      </p>
      <ul className="ea-legend" aria-label="Legend">
        <li>
          <span className="ea-sw ea-sw-bar" />
          Share of all 2022 ballots
        </li>
        <li>
          <span className="ea-sw ea-sw-tick" />
          Share of all 2024 ballots
        </li>
      </ul>
      <figure className="ea-bars">
        <div className="ea-bars-plot">
          <span className="ea-bars-ref" style={frac(1)} aria-hidden="true">
            <span>Matched the full total</span>
          </span>
          <span className="ea-bars-ref ea-bars-ref-state" style={frac(statewide)} aria-hidden="true">
            <span>Statewide {pct(statewide)}</span>
          </span>
          {rows.map(({ g, early, of22, of24 }) => (
            <div key={g} className={`ea-bars-row${g === "Travis" ? " ea-bars-bench" : ""}`} tabIndex={0}>
              <span className="ea-bars-name">{g}</span>
              <span className="ea-bars-track">
                <span className="ea-bars-bar" style={{ width: at(of22) }} />
                <span className="ea-bars-tick" style={frac(of24)} aria-hidden="true" />
                <span className="ea-bars-val">
                  {pct(of22)}
                  <span className="ea-bars-detail">
                    {" "}
                    · 2024: {pct(of24)} · {fmt(early)} early ballots
                  </span>
                </span>
              </span>
            </div>
          ))}
        </div>
        <figcaption className="ea-note">
          2026 early ballots (in person and mail) ÷ all ballots cast in the 2022 general (bar) and the 2024 general
          (line). Point at or tap a county for both values. The lighter bar, Travis, is a benchmark rather than one of
          the 17. Sources: Texas SOS, Texas Legislative Council.
        </figcaption>
      </figure>
    </Panel>
  );
}
