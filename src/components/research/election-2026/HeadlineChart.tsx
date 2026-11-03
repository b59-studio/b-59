"use client";

import { useId, useState } from "react";
import { fmt, pct } from "@/lib/election-2026/live";
import { CORE, DATA } from "./data";
import { Panel } from "./parts";

/** The two generals the early vote can be measured against: the last midterm and the last presidential year. */
const BASES = ["2022", "2024"] as const;
type Base = (typeof BASES)[number];

const ballots = (geo: string, year: Base) => DATA.gen[geo][year][1];

/**
 * The page's one finding, before any table: how much of each county's entire
 * 2022 or 2024 turnout the 2026 early vote has already matched. Bars are HTML
 * rather than SVG so their labels stay readable at any width; the numbers are
 * also in the tables below.
 */
export function HeadlineChart() {
  const [base, setBase] = useState<Base>("2022");
  const name = useId();

  const rows = CORE.map((g) => {
    const early = DATA.ev[g][3];
    const prior = ballots(g, base);
    return { g, early, prior, share: early / prior };
  }).sort((a, b) => b.share - a.share);
  const statewide = DATA.ev.Statewide[3] / ballots("Statewide", base);
  const max = Math.max(1.1, ...rows.map((r) => r.share));
  const at = (share: number) => `${(share / max) * 100}%`;
  const ref = (share: number) => ({ "--ea-ref": share / max }) as React.CSSProperties;
  const focusRows = rows.filter((r) => r.g !== "Travis");
  const passed = focusRows.filter((r) => r.share >= 1).length;
  const closest = focusRows[0];
  const kind = base === "2024" ? "the 2024 presidential election" : "the 2022 midterm";

  return (
    <Panel title={`Early vote as a share of ${base} turnout`} expandable={false}>
      <fieldset className="ea-seg">
        <legend className="ea-field-label">Compare the 2026 early vote with</legend>
        {BASES.map((y) => (
          <label key={y} className="ea-seg-option">
            <input
              type="radio"
              className="sr-only"
              name={name}
              value={y}
              checked={base === y}
              onChange={() => setBase(y)}
            />
            <span>All of {y}</span>
          </label>
        ))}
      </fieldset>
      <p className="ea-note ea-note-lead">
        {passed
          ? `${passed} of the ${rows.length - 1} focus counties cast more early ballots than they cast in all of ${kind}, before election day began.`
          : `No focus county’s early vote has yet matched its turnout in ${kind}; ${closest.g} is closest, at ${pct(closest.share)}.`}
      </p>
      <figure className="ea-bars">
        <div className="ea-bars-plot">
          <span className="ea-bars-ref" style={ref(1)} aria-hidden="true">
            <span>All of {base}</span>
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
          2026 early ballots (in person and mail) ÷ all ballots cast in the {base} general. The lighter bar, Travis, is
          a benchmark rather than one of the 17. Sources: Texas SOS, Texas Legislative Council.
        </figcaption>
      </figure>
    </Panel>
  );
}
