"use client";

import { fmt, pct } from "@/lib/election-2026/live";
import { CORE, DATA } from "./data";
import { Panel } from "./parts";

const YEARS = ["2022", "2024"] as const;
type Year = (typeof YEARS)[number];

const share = (geo: string, year: Year) => DATA.ev[geo][3] / DATA.gen[geo][year][1];

/**
 * The page's one finding, before any table: how much of each county's entire
 * 2022 and 2024 turnout the 2026 early vote has already matched. Each place
 * gets two plain lines on one scale, 2022 and 2024, each labelled with its
 * value. Lines are HTML rather than SVG so their labels stay readable at any
 * width; the numbers are also in the tables below.
 */
export function HeadlineChart() {
  const counties = CORE.map((g) => ({ g, s22: share(g, "2022"), s24: share(g, "2024") })).sort((a, b) => b.s22 - a.s22);
  const rows = [{ g: "Statewide", s22: share("Statewide", "2022"), s24: share("Statewide", "2024") }, ...counties];
  const max = Math.max(1.1, ...rows.map((r) => r.s22));
  const at = (s: number) => `${(s / max) * 100}%`;
  const focus = counties.filter((r) => r.g !== "Travis");
  const passed22 = focus.filter((r) => r.s22 >= 1).length;
  const passed24 = focus.filter((r) => r.s24 >= 1).length;
  const closest24 = [...focus].sort((a, b) => b.s24 - a.s24)[0];

  return (
    <Panel title="Early vote as a share of 2022 and 2024 turnout" expandable={false}>
      <p className="ea-note ea-note-lead">
        {passed22
          ? `${passed22} of the ${focus.length} focus counties cast more early ballots than in all of the 2022 midterm, before election day began.`
          : `None of the ${focus.length} focus counties has yet matched its 2022 midterm turnout.`}{" "}
        {passed24
          ? `${passed24} also passed their 2024 presidential turnout.`
          : `None has reached its 2024 presidential turnout; ${closest24.g} is closest, at ${pct(closest24.s24)}.`}
      </p>
      <ul className="ea-legend" aria-label="Legend">
        {YEARS.map((y) => (
          <li key={y}>
            <span className={`ea-sw ea-sw-line ea-y${y}`} />
            Share of all {y} ballots
          </li>
        ))}
      </ul>
      <figure className="ea-bars">
        <div className="ea-bars-plot" style={{ "--ea-ref": 1 / max } as React.CSSProperties}>
          <span className="ea-bars-ref" aria-hidden="true">
            <span>100%: the whole year’s turnout</span>
          </span>
          {rows.map(({ g, s22, s24 }) => (
            <div
              key={g}
              className={`ea-bars-row${g === "Statewide" ? " ea-bars-state" : ""}${g === "Travis" ? " ea-bars-bench" : ""}`}
            >
              <span className="ea-bars-name">{g}</span>
              <span className="ea-bars-pair">
                {YEARS.map((y) => {
                  const s = y === "2022" ? s22 : s24;
                  return (
                    <span key={y} className="ea-bars-track">
                      <span className={`ea-bars-line ea-y${y}`} style={{ width: at(s) }} />
                      <span className="ea-bars-val">
                        <span className="sr-only">{y}: </span>
                        {pct(s)}
                      </span>
                    </span>
                  );
                })}
              </span>
            </div>
          ))}
        </div>
        <figcaption className="ea-note">
          2026 early ballots ({fmt(DATA.ev.Statewide[3])} statewide, in person and mail) ÷ all ballots cast in the 2022
          and 2024 generals. Travis is a benchmark rather than one of the 17. Sources: Texas SOS, Texas Legislative
          Council.
        </figcaption>
      </figure>
    </Panel>
  );
}
