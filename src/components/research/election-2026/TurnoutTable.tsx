"use client";

import type { LiveFigures } from "@/lib/election-2026/live";
import { fmt, pct, timeCentral } from "@/lib/election-2026/live";
import { ballots2022, DATA, shade, YEARS } from "./data";
import { GeoTable, SortTh } from "./GeoTable";
import { Note, Panel, TrackerLink } from "./parts";

/** Past generals shown beside the 2026 numbers; the full run is under Turnout history. */
const RECENT = ["2020", "2022", "2024"];

/** Turnout shading: 20% of registered voters is unshaded, 70% is the darkest step. */
const turnoutShade = (rate: number) => shade("ink", (rate - 0.2) / 0.5);

/** The headline table: live tracker counts where a county publishes one, the early vote, recent turnout. */
export function TurnoutTable({ live, fetched }: { live: Map<string, LiveFigures>; fetched: string }) {
  const trackedNames = [...live.keys()];

  return (
    <Panel id="turnout" title="Turnout by county">
      <Note>
        Live figures add the state’s mail-ballot count to each tracker’s in-person check-ins, early and election day,
        read at {timeCentral(fetched)} CT. 2026 early vote is final (in person and mail, through{" "}
        {DATA.evAsOf.split(",")[0]}). Rates use registered voters.
        {trackedNames.length ? ` Live trackers: ${trackedNames.join(", ")}.` : ""}
      </Note>
      <GeoTable
        columns={1 + 2 + 3 + RECENT.length}
        sort={{
          liveBallots: (g) => live.get(g)?.total,
          liveRate: (g) => {
            const L = live.get(g);
            return L ? L.total / L.registered : null;
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
              <th className="ea-grp ea-sep" colSpan={2}>
                Live <span className="ea-src-tag">county trackers, unofficial</span>
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
          const L = live.get(g);
          return (
            <>
              {L ? (
                <>
                  <td className="ea-sep">
                    <strong>{fmt(L.total)}</strong>
                    <span className="ea-cnt">as of {timeCentral(L.refreshed)}</span>
                  </td>
                  <td style={turnoutShade(L.total / L.registered)}>{pct(L.total / L.registered)}</td>
                </>
              ) : (
                <>
                  <td className="ea-sep ea-muted">—</td>
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
