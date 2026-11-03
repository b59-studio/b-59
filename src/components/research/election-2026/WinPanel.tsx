"use client";

import { useState } from "react";
import { fmt, pct } from "@/lib/election-2026/live";
import { CORE as COUNTIES, DATA, officeName, race } from "./data";
import { DataTable, FilterPick, Note, Panel, Stat } from "./parts";

const BASELINES: [string, string][] = [
  ["2024", "President"],
  ["2024", "U.S. Senate"],
  ["2024", "Railroad Comm."],
  ["2022", "Governor"],
  ["2022", "Comptroller"],
  ["2022", "Railroad Comm."],
  ["2020", "President"],
  ["2018", "U.S. Senate"],
];
const TEXAS_COUNTIES = 254;

const demShare = (geo: string, base: string) => {
  const [y, o] = base.split("|");
  const r = race(geo, y, o);
  return r ? r[5] / r[7] : null;
};

/** A typed win number: digits with optional commas, or nothing. */
function parseWin(raw: string | undefined): { value: number | null; invalid: boolean } {
  const v = (raw ?? "").replace(/[,\s]/g, "");
  if (v === "") return { value: null, invalid: false };
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? { value: n, invalid: false } : { value: null, invalid: true };
}

/**
 * A scenario tool for a statewide two-way race: set the Democratic share in
 * each county and see what the rest of the state has to deliver. Win numbers
 * start blank and live only in this page's state; nothing is saved.
 */
export function WinPanel() {
  const [edPct, setEdPct] = useState(25);
  const [thirdPct, setThirdPct] = useState(2);
  const [base, setBase] = useState("2024|President");
  const [shares, setShares] = useState<Record<string, number>>({});
  const [wins, setWins] = useState<Record<string, string>>({});

  const projected = (g: string) => Math.round(DATA.ev[g][3] * (1 + edPct / 100));
  const share = (g: string) => shares[g] ?? demShare(g, base) ?? 0;
  const winOf = (g: string) => parseWin(wins[g]).value;

  const stateProj = Math.round(DATA.ev.Statewide[3] * (1 + edPct / 100));
  const toWin = Math.floor((stateProj * (1 - thirdPct / 100)) / 2) + 1;
  let ours = 0;
  let projSum = 0;
  for (const g of COUNTIES) {
    ours += Math.round(projected(g) * share(g));
    projSum += projected(g);
  }
  const restProj = stateProj - projSum;
  const need = toWin - ours;
  const reqShare = need / restProj;
  const [by, bo] = base.split("|");
  const statewide = race("Statewide", by, bo)!;
  const inCounties = COUNTIES.map((g) => race(g, by, bo)).filter((r) => r != null);
  const restBase =
    (statewide[5] - inCounties.reduce((a, r) => a + r[5], 0)) / (statewide[7] - inCounties.reduce((a, r) => a + r[7], 0));
  const gapPts = (reqShare - restBase) * 100;
  const verdictClass = need <= 0 || gapPts <= 0 ? "ea-good" : gapPts > 5 ? "ea-hard" : "";
  const anyWins = COUNTIES.some((g) => winOf(g));

  const baseOptions = BASELINES.map(([y, o]) => ({
    value: `${y}|${o}`,
    label: `${y} ${officeName(o)}`,
    detail: race("Statewide", y, o)![3],
  }));

  return (
    <Panel title="What the rest of the state needs">
      <Note>
        Two-way statewide race. Turnout = 2026 early vote + your election-day bump. Set the D share by county; the
        result is the share the other {TEXAS_COUNTIES - COUNTIES.length} counties need. Win numbers stay in your
        browser. A scenario, not a forecast.
      </Note>
      <div className="ea-calc-top">
        <NumberField
          label="E-day bump (% of early vote)"
          value={edPct}
          min={0}
          max={150}
          step={1}
          onChange={setEdPct}
          help="Travis: +21% in 2024, +42% in 2022."
        />
        <NumberField
          label="Third party / write-in (%)"
          value={thirdPct}
          min={0}
          max={10}
          step={0.5}
          onChange={setThirdPct}
          help="About 2% recently."
        />
        <div className="ea-field">
          <FilterPick
            label="Baseline race"
            options={baseOptions}
            value={base}
            onChange={(v) => {
              setBase(v);
              setShares({});
            }}
          />
          <span className="ea-cnt">Sliders start here.</span>
        </div>
      </div>

      <div className="ea-stats">
        <Stat value={fmt(stateProj)} label="Projected, statewide" />
        <Stat value={fmt(toWin)} label="Needed to win" />
        <Stat value={fmt(ours)} label={`D votes, these ${COUNTIES.length}`} />
        <Stat value={fmt(Math.max(0, need))} label={`Still needed, other ${TEXAS_COUNTIES - COUNTIES.length}`} />
      </div>

      <div className={`ea-verdict ${verdictClass}`} role="status">
        <span className="ea-verdict-big">
          {need <= 0
            ? "These counties alone clear 50%."
            : `Rest of state needs ${pct(reqShare)} D.`}
        </span>
        <span>
          {need <= 0
            ? `${fmt(-need)} votes to spare.`
            : `~${fmt(restProj)} ballots there. ${by} ${officeName(bo)}: ${pct(restBase)} D. Gap: ${gapPts > 0 ? "+" : "−"}${Math.abs(gapPts).toFixed(1)} pts.`}
        </span>
      </div>

      <div className="ea-bar">
        <button type="button" className="ea-btn" onClick={() => setShares({})}>
          Reset
        </button>
        <button
          type="button"
          className="ea-btn"
          disabled={!anyWins}
          onClick={() => {
            const next = { ...shares };
            for (const g of COUNTIES) {
              const w = winOf(g);
              if (w) next[g] = Math.min(1, w / projected(g));
            }
            setShares(next);
          }}
        >
          Use win numbers
        </button>
        {!anyWins && <span className="ea-muted">Enter a win number below first.</span>}
      </div>

      <DataTable
        head={
          <tr>
            <th>County</th>
            <th>Projected</th>
            <th>Baseline</th>
            <th>Set D share</th>
            <th>D share</th>
            <th>D votes</th>
            <th>vs baseline</th>
            <th>Win #</th>
            <th>% of win #</th>
          </tr>
        }
      >
        {COUNTIES.map((g) => {
          const pj = projected(g);
          const start = demShare(g, base);
          const sh = share(g);
          const votes = Math.round(pj * sh);
          const delta = votes - Math.round(pj * (start ?? 0));
          const win = parseWin(wins[g]);
          return (
            <tr key={g} className={g === "Travis" ? "ea-bench ea-group-start" : undefined}>
              <td>{g}</td>
              <td>{fmt(pj)}</td>
              <td>{pct(start)}</td>
              <td className="ea-slider">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={0.5}
                  value={(sh * 100).toFixed(1)}
                  aria-label={`Democratic share of the vote in ${g}`}
                  onChange={(e) => setShares((s) => ({ ...s, [g]: Number(e.target.value) / 100 }))}
                />
              </td>
              <td>{pct(sh)}</td>
              <td>{fmt(votes)}</td>
              <td className={delta > 0 ? "ea-pos" : undefined}>{`${delta >= 0 ? "+" : "−"}${fmt(Math.abs(delta))}`}</td>
              <td>
                <input
                  className="ea-input ea-win-in"
                  type="text"
                  inputMode="numeric"
                  placeholder="—"
                  aria-label={`Win number for ${g}`}
                  aria-invalid={win.invalid || undefined}
                  value={wins[g] ?? ""}
                  onChange={(e) => setWins((w) => ({ ...w, [g]: e.target.value }))}
                />
                {win.invalid && <span className="ea-cnt ea-error">Whole number</span>}
              </td>
              <td>{win.value ? pct(votes / win.value) : ""}</td>
            </tr>
          );
        })}
      </DataTable>
    </Panel>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  step,
  onChange,
  help,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  help: string;
}) {
  const [text, setText] = useState(String(value));
  return (
    <label className="ea-field">
      <span className="ea-field-label">{label}</span>
      <input
        className="ea-input"
        type="number"
        min={min}
        max={max}
        step={step}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          const v = Number(e.target.value);
          if (e.target.value !== "" && Number.isFinite(v)) onChange(v);
        }}
      />
      <span className="ea-cnt">{help}</span>
    </label>
  );
}
