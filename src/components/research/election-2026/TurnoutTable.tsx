"use client";

import { Fragment } from "react";
import type { LiveFigures } from "@/lib/election-2026/live";
import { fmt, pct, timeCentral } from "@/lib/election-2026/live";
import { ballots2022, DATA, shade, YEARS } from "./data";
import { DataTable, Note, Panel, TrackerLink } from "./parts";

/** Past generals shown beside the 2026 numbers; the full run is under Turnout history. */
const RECENT = ["2020", "2022", "2024"];

/** Turnout shading: 20% of registered voters is unshaded, 70% is the darkest step. */
const turnoutShade = (rate: number) => shade("ink", (rate - 0.2) / 0.5);

/** The headline table: live tracker counties first, then everything else in regional order. */
export function TurnoutTable({
  live,
  liveOrder,
  fetched,
}: {
  live: Map<string, LiveFigures>;
  liveOrder: string[];
  fetched: string;
}) {
  const tracked = liveOrder.flatMap((g) => DATA.geos.filter(([x]) => x === g && live.has(g)));
  const rest = DATA.geos.filter(([g]) => !live.has(g));
  const columns = 1 + 2 + 3 + RECENT.length;
  const trackedNames = tracked.map(([g]) => g);

  const head = (
    <>
      <tr>
        <th rowSpan={2}>County</th>
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
        <th className="ea-sep">Ballots</th>
        <th>% of registered</th>
        <th className="ea-sep">Ballots</th>
        <th>% of registered</th>
        <th>% of 2022 total</th>
        {RECENT.map((y, i) => (
          <th key={y} className={i === 0 ? "ea-sep" : undefined}>
            {y}
          </th>
        ))}
      </tr>
    </>
  );

  const groups: [string | null, typeof DATA.geos][] = tracked.length
    ? [
        [`Counties with a live tracker · read ${timeCentral(fetched)} CT`, tracked],
        ["Early vote only", rest],
      ]
    : [[null, rest]];

  return (
    <Panel id="turnout" title="Turnout by county">
      <Note>
        Live figures add the state’s mail-ballot count to each tracker’s in-person check-ins, early and election day.
        2026 early vote is final (in person and mail, through {DATA.evAsOf.split(",")[0]}). Rates use registered voters.
        {trackedNames.length ? ` Live trackers: ${trackedNames.join(", ")}.` : ""}
      </Note>
      <DataTable head={head}>
        {groups.map(([label, rows]) => (
          <Fragment key={label ?? "all"}>
            {label && (
              <tr className="ea-grp-row">
                <td colSpan={columns}>{label}</td>
              </tr>
            )}
            {rows.map(([g, region, isSub], i) => {
              const [reg, , , total] = DATA.ev[g];
              const L = live.get(g);
              return (
                <tr key={g} className={rowClass(region, isSub, i > 0 && rows[i - 1][1] !== region)}>
                  <td>{L ? <TrackerLink label={g} url={L.url} /> : g}</td>
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
                </tr>
              );
            })}
          </Fragment>
        ))}
      </DataTable>
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
      <DataTable
        head={
          <>
            <tr>
              <th rowSpan={2}>County</th>
              <th className="ea-grp ea-sep" colSpan={4}>
                2026 early vote <span className="ea-src-tag">Texas SOS</span>
              </th>
              <th className="ea-grp ea-sep" colSpan={YEARS.length}>
                Past generals <span className="ea-src-tag">TLC</span>
              </th>
            </tr>
            <tr>
              <th className="ea-sep">Registered</th>
              <th>In person</th>
              <th>Mail</th>
              <th>Total</th>
              {YEARS.map((y, i) => (
                <th key={y} className={i === 0 ? "ea-sep" : undefined}>
                  {y}
                </th>
              ))}
            </tr>
          </>
        }
      >
        {DATA.geos.map(([g, region, isSub], i) => {
          const [reg, inPerson, mail, total] = DATA.ev[g];
          return (
            <tr key={g} className={rowClass(region, isSub, i > 0 && DATA.geos[i - 1][1] !== region)}>
              <td>{g}</td>
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
            </tr>
          );
        })}
      </DataTable>
    </Panel>
  );
}

export function rowClass(region: string, isSub: boolean, startsRegion: boolean) {
  return [isSub ? "ea-sub" : "", region === "Benchmark" ? "ea-bench" : "", startsRegion ? "ea-group-start" : ""]
    .join(" ")
    .trim() || undefined;
}
