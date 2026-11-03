"use client";

import { fmt, pct } from "@/lib/election-2026/live";
import { ballots2022, CORE, DATA } from "./data";
import { Panel } from "./parts";

/**
 * The page's one finding, before any table: how much of each county's entire
 * 2022 turnout the 2026 early vote has already matched. Bars are HTML rather
 * than SVG so their labels stay readable at any width; the numbers are also in
 * the table below.
 */
export function HeadlineChart() {
  const rows = CORE.map((g) => {
    const early = DATA.ev[g][3];
    const prior = ballots2022(g);
    return { g, early, prior, share: early / prior };
  }).sort((a, b) => b.share - a.share);
  const statewide = DATA.ev.Statewide[3] / ballots2022("Statewide");
  const max = Math.max(1.1, ...rows.map((r) => r.share));
  const at = (share: number) => `${(share / max) * 100}%`;
  const ref = (share: number) => ({ "--ea-ref": share / max }) as React.CSSProperties;
  const passed = rows.filter((r) => r.share >= 1 && r.g !== "Travis").length;

  return (
    <Panel title="Early vote as a share of 2022 turnout" expandable={false}>
      <p className="ea-note ea-note-lead">
        {passed
          ? `${passed} of the ${rows.length - 1} counties cast more early ballots than they cast in all of 2022, before election day began.`
          : "None of the counties has yet passed its entire 2022 turnout in early voting."}
      </p>
      <figure className="ea-bars">
        <div className="ea-bars-plot">
          <span className="ea-bars-ref" style={ref(1)} aria-hidden="true">
            <span>All of 2022</span>
          </span>
          <span className="ea-bars-ref ea-bars-ref-state" style={ref(statewide)} aria-hidden="true">
            <span>Statewide {pct(statewide)}</span>
          </span>
          {rows.map(({ g, early, prior, share }) => (
            <div key={g} className={`ea-bars-row${g === "Travis" ? " ea-bars-bench" : ""}`}>
              <span className="ea-bars-name">{g}</span>
              <span className="ea-bars-track">
                <span className="ea-bars-bar" style={{ width: at(share) }} />
                <span className="ea-bars-val">
                  {pct(share)}
                  <span className="ea-bars-detail">
                    {" "}
                    · {fmt(early)} of {fmt(prior)}
                  </span>
                </span>
              </span>
            </div>
          ))}
        </div>
        <figcaption className="ea-note">
          2026 early ballots (in person and mail) ÷ all ballots cast in the 2022 general. The lighter bar, Travis, is a
          benchmark rather than one of the 17. Sources: Texas SOS, Texas Legislative Council.
        </figcaption>
      </figure>
    </Panel>
  );
}
