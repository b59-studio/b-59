"use client";

import { Fragment } from "react";
import type { LiveFigures } from "@/lib/election-2026/live";
import { fmt, pct, timeCentral } from "@/lib/election-2026/live";
import { ballots2022, DATA, shade, YEARS } from "./data";
import { DataTable, Note, Panel, TrackerLink } from "./parts";

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
  const columns = 1 + 3 + 5 + YEARS.length;
  const trackedNames = tracked.map(([g]) => g);

  const head = (
    <>
      <tr>
        <th rowSpan={2}>County</th>
        <th className="ea-grp ea-sep" colSpan={3}>
          Live (county trackers)
        </th>
        <th className="ea-grp ea-sep" colSpan={5}>
          2026 early vote
        </th>
        <th className="ea-grp ea-sep" colSpan={YEARS.length}>
          Past generals
        </th>
      </tr>
      <tr>
        <th className="ea-sep">Total</th>
        <th>% of reg.</th>
        <th>E-day</th>
        <th className="ea-sep">Registered</th>
        <th>In person</th>
        <th>Mail</th>
        <th>Total</th>
        <th>% of reg.</th>
        {YEARS.map((y, i) => (
          <th key={y} className={i === 0 ? "ea-sep" : undefined}>
            {y}
          </th>
        ))}
      </tr>
    </>
  );

  const groups: [string | null, typeof DATA.geos][] = tracked.length
    ? [
        [`Live trackers · ${timeCentral(fetched)} CT`, tracked],
        ["No live tracker", rest],
      ]
    : [[null, rest]];

  return (
    <Panel id="turnout" title="Turnout by county">
      <Note>
        2026 is early vote only (in person + mail, through {DATA.evAsOf.split(",")[0]}). Past years: turnout rate,
        ballots below.
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
              const [reg, inPerson, mail, total] = DATA.ev[g];
              const L = live.get(g);
              const startsRegion = i > 0 && rows[i - 1][1] !== region;
              return (
                <tr key={g} className={rowClass(region, isSub, startsRegion)}>
                  <td>{L ? <TrackerLink label={g} url={L.url} /> : g}</td>
                  {L ? (
                    <>
                      <td className="ea-sep">
                        <strong>{fmt(L.total)}</strong>
                        <span className="ea-cnt">as of {timeCentral(L.refreshed)}</span>
                      </td>
                      <td style={shade("dem", (L.total / L.registered - 0.2) / 0.35)}>{pct(L.total / L.registered)}</td>
                      <td>{fmt(L.electionDay)}</td>
                    </>
                  ) : (
                    <>
                      <td className="ea-sep" title="No live tracker for this county">
                        —
                      </td>
                      <td />
                      <td />
                    </>
                  )}
                  <td className="ea-sep">{fmt(reg)}</td>
                  <td>{fmt(inPerson)}</td>
                  <td>{fmt(mail)}</td>
                  <td>
                    <strong>{fmt(total)}</strong>
                    <span className="ea-cnt">{pct(total / ballots2022(g))} of 2022</span>
                  </td>
                  <td style={shade("dem", (total / reg - 0.2) / 0.35)}>{pct(total / reg)}</td>
                  {YEARS.map((y, yi) => {
                    const [r, v] = DATA.gen[g][y];
                    return (
                      <td key={y} className={yi === 0 ? "ea-sep" : undefined} style={shade("dem", (v / r - 0.15) / 0.65)}>
                        {pct(v / r)}
                        <span className="ea-cnt">{fmt(v)}</span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </Fragment>
        ))}
      </DataTable>
      <Note>
        Live = tracker check-ins (early + election day) plus the state’s mail count. Unofficial.
        {trackedNames.length ? ` Trackers: ${trackedNames.join(", ")}.` : ""} Percentages use state registration. Valley =
        Hidalgo, Cameron, Starr, Willacy.
      </Note>
    </Panel>
  );
}

export function rowClass(region: string, isSub: boolean, startsRegion: boolean) {
  return [isSub ? "ea-sub" : "", region === "Benchmark" ? "ea-bench" : "", startsRegion ? "ea-group-start" : ""]
    .join(" ")
    .trim() || undefined;
}
