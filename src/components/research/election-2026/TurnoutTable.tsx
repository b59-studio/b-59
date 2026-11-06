"use client";

import type { LiveFigures } from "@/lib/election-2026/live";
import { fmt, pct, timeCentral } from "@/lib/election-2026/live";
import { ballots2022, ballots2024, DATA, shade, YEARS } from "./data";
import { GeoTable, SortTh } from "./GeoTable";
import { useFinal } from "./YearOverYear";
import { Note, Panel, TrackerLink } from "./parts";

/** Past generals shown beside the 2026 numbers; the full run is under Turnout history. */
const RECENT = ["2020", "2022", "2024"];

/** Turnout shading: 20% of registered voters is unshaded, 70% is the darkest step. */
const turnoutShade = (rate: number) => shade("ink", (rate - 0.2) / 0.5);

/**
 * The headline table: each county's 2026 count (unofficial, from the state),
 * the early vote, and recent turnout. Before the state has a count, the
 * election-day trackers stand in where a county publishes one.
 */
export function TurnoutTable({ live, fetched }: { live: Map<string, LiveFigures>; fetched: string }) {
  const trackedNames = [...live.keys()];
  const final = useFinal();
  // Ballots and registration for the 2026 column group: the state's count, or a tracker reading.
  const result = (g: string): { ballots: number; registered: number; note: string } | null => {
    const f = final?.geos[g];
    if (f?.ballots) return { ballots: f.ballots, registered: f.registered, note: "unofficial" };
    const L = live.get(g);
    return L ? { ballots: L.total, registered: L.registered, note: `tracker, ${timeCentral(L.refreshed)}` } : null;
  };

  return (
    <Panel id="turnout" title="Turnout by county">
      <Note>
        {final
          ? "The 2026 count is each county’s complete election-night count from the Texas Secretary of State, unofficial until canvassed. "
          : `The 2026 columns are election-day tracker readings, read at ${timeCentral(fetched)} CT, plus the state’s mail count. `}
        The 2026 early vote is final (in person and mail, through {DATA.evAsOf.split(",")[0]}). Rates use registered voters.
        {trackedNames.length ? ` Counties with an election-day tracker: ${trackedNames.join(", ")}.` : ""}
      </Note>
      <GeoTable
        columns={1 + 3 + 3 + RECENT.length}
        sort={{
          liveBallots: (g) => result(g)?.ballots,
          liveRate: (g) => {
            const r = result(g);
            return r ? r.ballots / r.registered : null;
          },
          liveOf2024: (g) => {
            const r = result(g);
            return r ? r.ballots / ballots2024(g) : null;
          },
          earlyBallots: (g) => DATA.ev[g][3],
          earlyRate: (g) => DATA.ev[g][3] / DATA.ev[g][0],
          of2022: (g) => DATA.ev[g][3] / ballots2022(g),
          ...Object.fromEntries(RECENT.map((y) => [`t${y}`, (g: string) => DATA.gen[g][y][1] / DATA.gen[g][y][0]])),
        }}
        name={(g) => {
          const L = live.get(g);
          return L ? <TrackerLink label={g} url={L.url} /> : g;
        }}
        head={
          <>
            <tr>
              <SortTh by="name" rowSpan={2}>
                County
              </SortTh>
              <th className="ea-grp ea-sep" colSpan={3}>
                2026 result <span className="ea-src-tag">{final ? "unofficial, Texas SOS" : "county trackers, unofficial"}</span>
              </th>
              <th className="ea-grp ea-sep" colSpan={3}>
                2026 early vote <span className="ea-src-tag">Texas SOS</span>
              </th>
              <th className="ea-grp ea-sep" colSpan={RECENT.length}>
                Past turnout <span className="ea-src-tag">TLC</span>
              </th>
            </tr>
            <tr>
              <SortTh by="liveBallots" className="ea-sep">
                Ballots
              </SortTh>
              <SortTh by="liveRate">% of registered</SortTh>
              <SortTh by="liveOf2024">% of 2024 total</SortTh>
              <SortTh by="earlyBallots" className="ea-sep">
                Ballots
              </SortTh>
              <SortTh by="earlyRate">% of registered</SortTh>
              <SortTh by="of2022">% of 2022 total</SortTh>
              {RECENT.map((y, i) => (
                <SortTh key={y} by={`t${y}`} className={i === 0 ? "ea-sep" : undefined}>
                  {y}
                </SortTh>
              ))}
            </tr>
          </>
        }
        cells={(g) => {
          const [reg, , , total] = DATA.ev[g];
          const r = result(g);
          return (
            <>
              {r ? (
                <>
                  <td className="ea-sep">
                    <strong>{fmt(r.ballots)}</strong>
                    {!final && <span className="ea-cnt">{r.note}</span>}
                  </td>
                  <td style={turnoutShade(r.ballots / r.registered)}>{pct(r.ballots / r.registered)}</td>
                  <td>{pct(r.ballots / ballots2024(g))}</td>
                </>
              ) : (
                <>
                  <td className="ea-sep ea-muted">—</td>
                  <td />
                  <td />
                </>
              )}
              <td className="ea-sep">{fmt(total)}</td>
              <td style={turnoutShade(total / reg)}>{pct(total / reg)}</td>
              <td>{pct(total / ballots2022(g))}</td>
              {RECENT.map((y, yi) => {
                const [r, v] = DATA.gen[g][y];
                return (
                  <td key={y} className={yi === 0 ? "ea-sep" : undefined} style={turnoutShade(v / r)}>
                    {pct(v / r)}
                  </td>
                );
              })}
            </>
          );
        }}
      />
    </Panel>
  );
}

/** Every general since 2016, with the 2026 early vote broken out by method. */
export function TurnoutHistory() {
  return (
    <Panel title="Turnout history">
      <Note>
        2026 is the final early vote. Each past general shows turnout as a share of registered voters, with ballots cast
        below.
      </Note>
      <GeoTable
        columns={1 + 4 + YEARS.length}
        sort={{
          registered: (g) => DATA.ev[g][0],
          inPerson: (g) => DATA.ev[g][1],
          mail: (g) => DATA.ev[g][2],
          total: (g) => DATA.ev[g][3],
          ...Object.fromEntries(YEARS.map((y) => [`t${y}`, (g: string) => DATA.gen[g][y][1] / DATA.gen[g][y][0]])),
        }}
        head={
          <>
            <tr>
              <SortTh by="name" rowSpan={2}>
                County
              </SortTh>
              <th className="ea-grp ea-sep" colSpan={4}>
                2026 early vote <span className="ea-src-tag">Texas SOS</span>
              </th>
              <th className="ea-grp ea-sep" colSpan={YEARS.length}>
                Past generals <span className="ea-src-tag">TLC</span>
              </th>
            </tr>
            <tr>
              <SortTh by="registered" className="ea-sep">
                Registered
              </SortTh>
              <SortTh by="inPerson">In person</SortTh>
              <SortTh by="mail">Mail</SortTh>
              <SortTh by="total">Total</SortTh>
              {YEARS.map((y, i) => (
                <SortTh key={y} by={`t${y}`} className={i === 0 ? "ea-sep" : undefined}>
                  {y}
                </SortTh>
              ))}
            </tr>
          </>
        }
        cells={(g) => {
          const [reg, inPerson, mail, total] = DATA.ev[g];
          return (
            <>
              <td className="ea-sep">{fmt(reg)}</td>
              <td>{fmt(inPerson)}</td>
              <td>{fmt(mail)}</td>
              <td>
                <strong>{fmt(total)}</strong>
              </td>
              {YEARS.map((y, yi) => {
                const [r, v] = DATA.gen[g][y];
                return (
                  <td key={y} className={yi === 0 ? "ea-sep" : undefined} style={turnoutShade(v / r)}>
                    {pct(v / r)}
                    <span className="ea-cnt">{fmt(v)}</span>
                  </td>
                );
              })}
            </>
          );
        }}
      />
    </Panel>
  );
}
