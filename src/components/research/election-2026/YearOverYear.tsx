"use client";

import { createContext, useContext, useId, useState } from "react";
import { fmt, margin, pct, points } from "@/lib/election-2026/live";
import type { Final2026, OfficeId, RaceVotes } from "@/lib/results-2026/final";
import { DATA, race, shade, TOP_OF_TICKET } from "./data";
import { GeoTable, SortTh } from "./GeoTable";
import { Note, Panel } from "./parts";

/** The 2026 count by geography, from the Secretary of State; null when it could not be read. */
export const FinalContext = createContext<Final2026 | null>(null);
export const useFinal = () => useContext(FinalContext);

/** 2026 turnout: ballots as a share of registered voters. */
export const turnout2026 = (f: Final2026, geo: string) => {
  const g = f.geos[geo];
  return g && g.registered ? g.ballots / g.registered : null;
};

const pastTurnout = (geo: string, year: string) => {
  const [reg, ballots] = DATA.gen[geo]?.[year] ?? [0, 0];
  return reg ? ballots / reg : null;
};

/** Points between two shares, or null when either is missing. */
const diff = (a: number | null | undefined, b: number | null | undefined) => (a == null || b == null ? null : a - b);
const growth = (a: number | null | undefined, b: number | null | undefined) => (a == null || !b ? null : a / b - 1);
const signed = (n: number | null) => (n == null ? "" : `${n >= 0 ? "+" : "−"}${fmt(Math.abs(n))}`);
const signedPct = (n: number | null) => (n == null ? "" : `${n >= 0 ? "+" : "−"}${pct(Math.abs(n))}`);

const TURNOUT_YEARS = [
  { year: "2022", label: "vs 2022 midterm" },
  { year: "2018", label: "vs 2018 midterm" },
  { year: "2024", label: "vs 2024 presidential" },
];

function TurnoutComparison({ final }: { final: Final2026 }) {
  const early = (g: string) => DATA.ev[g]?.[3];
  const statewide = final.geos.Statewide;
  const added = statewide && early("Statewide") ? statewide.ballots / early("Statewide") - 1 : null;
  return (
    <Panel title="Turnout, 2026 against past years">
      <Note>
        2026 is every county’s unofficial count from the Texas Secretary of State; past years are the Texas Legislative
        Council’s precinct data, which runs about 0.5% above certified totals. “Points” is the change in turnout as a
        share of registered voters; “ballots” is the change in the number cast.
        {added != null && ` Election day and late mail added ${pct(added)} to the early vote statewide.`}
      </Note>
      <GeoTable
        columns={1 + 3 + TURNOUT_YEARS.length * 2}
        sort={{
          ballots: (g) => final.geos[g]?.ballots,
          rate: (g) => turnout2026(final, g),
          early: (g) => (final.geos[g]?.ballots ? (early(g) ?? 0) / final.geos[g].ballots : null),
          ...Object.fromEntries(
            TURNOUT_YEARS.flatMap(({ year }) => [
              [`p${year}`, (g: string) => diff(turnout2026(final, g), pastTurnout(g, year))],
              [`b${year}`, (g: string) => growth(final.geos[g]?.ballots, DATA.gen[g]?.[year]?.[1])],
            ]),
          ),
        }}
        head={
          <>
            <tr>
              <SortTh by="name" rowSpan={2}>
                County
              </SortTh>
              <th className="ea-grp ea-sep" colSpan={3}>
                2026 <span className="ea-src-tag">unofficial, Texas SOS</span>
              </th>
              {TURNOUT_YEARS.map(({ year, label }) => (
                <th key={year} className="ea-grp ea-sep" colSpan={2}>
                  {label}
                </th>
              ))}
            </tr>
            <tr>
              <SortTh by="ballots" className="ea-sep">
                Ballots
              </SortTh>
              <SortTh by="rate">% of registered</SortTh>
              <SortTh by="early">Cast early</SortTh>
              {TURNOUT_YEARS.map(({ year }) => [
                <SortTh key={`p${year}`} by={`p${year}`} className="ea-sep">
                  Points
                </SortTh>,
                <SortTh key={`b${year}`} by={`b${year}`}>
                  Ballots
                </SortTh>,
              ])}
            </tr>
          </>
        }
        cells={(g) => {
          const f = final.geos[g];
          if (!f) return <td colSpan={3 + TURNOUT_YEARS.length * 2} className="ea-sep ea-muted">No 2026 count</td>;
          const rate = turnout2026(final, g);
          return (
            <>
              <td className="ea-sep">{fmt(f.ballots)}</td>
              <td style={shade("ink", ((rate ?? 0) - 0.2) / 0.5)}>{pct(rate)}</td>
              <td>{f.ballots ? pct((early(g) ?? 0) / f.ballots) : ""}</td>
              {TURNOUT_YEARS.map(({ year }) => [
                <td key={`p${year}`} className="ea-sep">
                  {points(diff(rate, pastTurnout(g, year)))}
                </td>,
                <td key={`b${year}`}>{signedPct(growth(f.ballots, DATA.gen[g]?.[year]?.[1]))}</td>,
              ])}
            </>
          );
        }}
      />
    </Panel>
  );
}

/**
 * What 2026 is compared with for each office. "Top of the ticket" is the U.S.
 * Senate in 2026, first on the ballot, against each past year's top race.
 */
const MARGIN_VIEWS: { id: string; label: string; office2026: OfficeId; past: { year: string; office: string }[] }[] = [
  {
    id: "top",
    label: "Top of the ticket",
    office2026: "senate",
    past: ["2024", "2022", "2018"].map((year) => ({ year, office: TOP_OF_TICKET[year] })),
  },
  { id: "senate", label: "U.S. Senate", office2026: "senate", past: ["2024", "2020", "2018"].map((year) => ({ year, office: "U.S. Senate" })) },
  { id: "governor", label: "Governor", office2026: "governor", past: ["2022", "2018"].map((year) => ({ year, office: "Governor" })) },
  {
    id: "railroad",
    label: "Railroad Commissioner",
    office2026: "railroad",
    past: ["2024", "2022", "2018"].map((year) => ({ year, office: "Railroad Comm." })),
  },
  { id: "comptroller", label: "Comptroller", office2026: "comptroller", past: ["2022", "2018"].map((year) => ({ year, office: "Comptroller" })) },
];

const marginOf = (v: RaceVotes | undefined) => (v && v[2] ? (v[0] - v[1]) / v[2] : null);
const partyShade = (m: number | null, scale: number) => (m == null ? undefined : shade(m >= 0 ? "dem" : "rep", Math.abs(m) / scale));

function MarginComparison({ final }: { final: Final2026 }) {
  const [viewId, setViewId] = useState(MARGIN_VIEWS[0].id);
  const name = useId();
  const view = MARGIN_VIEWS.find((v) => v.id === viewId)!;
  const latest = view.past[0];
  const now = (g: string) => final.geos[g]?.races[view.office2026];
  const then = (g: string, year: string, office: string) => {
    const r = race(g, year, office);
    return r ? ([r[5], r[6], r[7]] as RaceVotes) : undefined;
  };

  return (
    <Panel title="Margins, 2026 against past years">
      <fieldset className="ea-seg">
        <legend className="ea-field-label">Race</legend>
        {MARGIN_VIEWS.map((v) => (
          <label key={v.id} className="ea-seg-option">
            <input type="radio" className="sr-only" name={name} checked={viewId === v.id} onChange={() => setViewId(v.id)} />
            <span>{v.label}</span>
          </label>
        ))}
      </fieldset>
      <Note>
        Margin is the Democratic share minus the Republican share of all votes in the race. “Shift” is 2026’s margin minus
        that year’s, so a positive shift moved toward the Democrats. The vote columns compare 2026 with {latest.year}.
        {view.id === "top" &&
          " The 2026 top of the ticket is the U.S. Senate, first on the ballot; earlier years use the President (2024), Governor (2022) and U.S. Senate (2018)."}
        {" "}2026 figures are unofficial.
      </Note>
      <GeoTable
        columns={1 + 1 + view.past.length * 2 + 2}
        sort={{
          m2026: (g) => marginOf(now(g)),
          ...Object.fromEntries(
            view.past.flatMap(({ year, office }) => [
              [`m${year}`, (g: string) => marginOf(then(g, year, office))],
              [`s${year}`, (g: string) => diff(marginOf(now(g)), marginOf(then(g, year, office)))],
            ]),
          ),
          dDem: (g) => diff(now(g)?.[0], then(g, latest.year, latest.office)?.[0]),
          dRep: (g) => diff(now(g)?.[1], then(g, latest.year, latest.office)?.[1]),
        }}
        head={
          <>
            <tr>
              <SortTh by="name" rowSpan={2}>
                County
              </SortTh>
              <SortTh by="m2026" rowSpan={2} className="ea-sep">
                2026 margin
              </SortTh>
              {view.past.map(({ year, office }) => (
                <th key={year} className="ea-grp ea-sep" colSpan={2}>
                  {year} <span className="ea-src-tag">{office === "Railroad Comm." ? "Railroad Commissioner" : office}</span>
                </th>
              ))}
              <th className="ea-grp ea-sep" colSpan={2}>
                Votes vs {latest.year}
              </th>
            </tr>
            <tr>
              {view.past.map(({ year }) => [
                <SortTh key={`m${year}`} by={`m${year}`} className="ea-sep">
                  Margin
                </SortTh>,
                <SortTh key={`s${year}`} by={`s${year}`}>
                  Shift
                </SortTh>,
              ])}
              <SortTh by="dDem" className="ea-sep">
                Democratic
              </SortTh>
              <SortTh by="dRep">Republican</SortTh>
            </tr>
          </>
        }
        cells={(g) => {
          const m = marginOf(now(g));
          const prev = then(g, latest.year, latest.office);
          return (
            <>
              <td className="ea-sep" style={partyShade(m, 0.7)}>
                {margin(m)}
              </td>
              {view.past.map(({ year, office }) => {
                const pm = marginOf(then(g, year, office));
                const shift = diff(m, pm);
                return [
                  <td key={`m${year}`} className="ea-sep" style={partyShade(pm, 0.7)}>
                    {margin(pm)}
                  </td>,
                  <td key={`s${year}`} style={partyShade(shift, 0.2)}>
                    {points(shift)}
                  </td>,
                ];
              })}
              <td className="ea-sep">{signed(diff(now(g)?.[0], prev?.[0]))}</td>
              <td>{signed(diff(now(g)?.[1], prev?.[1]))}</td>
            </>
          );
        }}
      />
    </Panel>
  );
}

/** The "2026 vs past years" tab: turnout and margins against earlier cycles. */
export function YearOverYearPanel() {
  const final = useFinal();
  if (!final) {
    return (
      <Panel title="2026 against past years" expandable={false}>
        <p className="ea-note">The Secretary of State’s 2026 count could not be read just now. The page tries again shortly.</p>
      </Panel>
    );
  }
  return (
    <>
      <TurnoutComparison final={final} />
      <MarginComparison final={final} />
    </>
  );
}
