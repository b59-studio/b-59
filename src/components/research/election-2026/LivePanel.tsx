"use client";

import type { LiveFigures } from "@/lib/election-2026/live";
import { fmt, hourLabel, pct, timeCentral } from "@/lib/election-2026/live";
import { ballots2022, CORE } from "./data";
import { SortContext, SortTh, sortItems, useSortState } from "./GeoTable";
import { DataTable, Note, Panel, TrackerLink } from "./parts";

const HOURS = Array.from({ length: 13 }, (_, i) => 7 + i);

export function LivePanel({ live, order, fetched }: { live: Map<string, LiveFigures>; order: string[]; fetched: string }) {
  const names = order.filter((g) => live.has(g));
  if (!names.length) {
    return (
      <Panel title="Election day" expandable={false}>
        <p className="ea-note">The county trackers could not be read. The page tries again every 15 minutes.</p>
      </Panel>
    );
  }
  const reference = names.filter((g) => !CORE.includes(g));

  return (
    <>
      <Panel title="Election day, from county trackers">
        <Note>
          Unofficial tracker check-ins plus the state’s mail-ballot count, read at {timeCentral(fetched)} CT. The last
          column compares election-day check-ins through the last full hour with the same hour in 2024.
          {reference.length ? ` ${reference.join(" and ")} are not among the 17 focus counties.` : ""}
        </Note>
        <TrackerTotals live={live} names={names} />
      </Panel>
      <div className="ea-grid2">
        {names.map((g) => (
          <HourlyPanel key={g} name={g} live={live.get(g)!} />
        ))}
      </div>
    </>
  );
}

function HourlyPanel({ name, live: L }: { name: string; live: LiveFigures }) {
  const at = (rows: [number, number][], h: number) => rows.find(([x]) => x === h)?.[1] ?? 0;
  const hasPrior = L.priorTotal > 0;
  const running = (rows: [number, number][]) => HOURS.map((h) => rows.filter(([x]) => x <= h).reduce((a, [, v]) => a + v, 0));
  const run26 = running(L.today);
  const run24 = running(L.prior);
  const rows = HOURS.map((h, i) => {
    const v26 = at(L.today, h);
    const v24 = at(L.prior, h);
    const c26 = run26[i];
    const c24 = run24[i];
    const label = hourLabel(h) + (h === 19 ? "–close" : "");
    if (h > L.doneHour && !v26) {
      return (
        <tr key={h}>
          <td>{label}</td>
          <td className="ea-muted">—</td>
          <td />
          {hasPrior && (
            <>
              <td>{fmt(v24)}</td>
              <td>{fmt(c24)}</td>
              <td />
            </>
          )}
        </tr>
      );
    }
    const pace = hasPrior && c24 && h < L.doneHour ? c26 / c24 : null;
    return (
      <tr key={h}>
        <td>{label + (h === L.doneHour ? " (partial)" : "")}</td>
        <td>{fmt(v26)}</td>
        <td>
          <strong>{fmt(c26)}</strong>
        </td>
        {hasPrior && (
          <>
            <td>{fmt(v24)}</td>
            <td>{fmt(c24)}</td>
            <td className={pace != null && pace >= 1 ? "ea-pos" : undefined}>{pace != null ? pct(pace) : ""}</td>
          </>
        )}
      </tr>
    );
  });

  return (
    <Panel as="h3" title={<TrackerLink label={`${name} County`} url={L.url} extra="tracker" />}>
      <Note>
        {hasPrior
          ? `Election-day check-ins by hour, against the 2024 general (${fmt(L.priorTotal)} that day).`
          : "Election-day check-ins by hour. This county’s 2024 tracker data is gone, so there is no comparison."}
      </Note>
      <DataTable
        head={
          <tr>
            <th>Hour</th>
            <th>2026</th>
            <th>2026 running total</th>
            {hasPrior && (
              <>
                <th>2024</th>
                <th>2024 running total</th>
                <th>2026 ÷ 2024</th>
              </>
            )}
          </tr>
        }
      >
        {rows}
      </DataTable>
    </Panel>
  );
}

const TRACKER_SORT: Record<string, (L: LiveFigures, g: string) => number | string | null> = {
  name: (_, g) => g,
  time: (L) => L.refreshed,
  evInPerson: (L) => L.evInPerson,
  mail: (L) => L.mail,
  electionDay: (L) => L.electionDay,
  total: (L) => L.total,
  rate: (L) => L.total / L.registered,
  of2022: (L, g) => L.total / ballots2022(g),
  pace: (L) => (L.priorThrough ? L.edThrough / L.priorThrough : null),
};

/** Each tracker county's running total, sortable by any column. */
function TrackerTotals({ live, names }: { live: Map<string, LiveFigures>; names: string[] }) {
  const sort = useSortState();
  const value = sort.by ? (g: string) => TRACKER_SORT[sort.by!](live.get(g)!, g) : null;
  const rows = sortItems(names, value, sort.dir);
  return (
    <SortContext.Provider value={sort}>
      <DataTable
        head={
          <tr>
            <SortTh by="name">County</SortTh>
            <SortTh by="time">Tracker time (CT)</SortTh>
            <SortTh by="evInPerson">Early in person</SortTh>
            <SortTh by="mail">Mail</SortTh>
            <SortTh by="electionDay">Election day</SortTh>
            <SortTh by="total">Total</SortTh>
            <SortTh by="rate">% of registered</SortTh>
            <SortTh by="of2022">% of 2022 total</SortTh>
            <SortTh by="pace">Election day vs 2024</SortTh>
          </tr>
        }
      >
        {rows.map((g) => {
          const L = live.get(g)!;
          const g22 = ballots2022(g);
          const pace = L.priorThrough ? L.edThrough / L.priorThrough : null;
          return (
            <tr key={g} className={CORE.includes(g) ? undefined : "ea-sub"}>
              <td>
                <TrackerLink label={g} url={L.url} />
              </td>
              <td>{timeCentral(L.refreshed)}</td>
              <td>{fmt(L.evInPerson)}</td>
              <td>{fmt(L.mail)}</td>
              <td>{fmt(L.electionDay)}</td>
              <td>
                <strong>{fmt(L.total)}</strong>
              </td>
              <td>{pct(L.total / L.registered)}</td>
              <td>{g22 ? pct(L.total / g22) : ""}</td>
              <td className={pace != null && pace >= 1 ? "ea-pos" : undefined}>{pace != null ? pct(pace) : "—"}</td>
            </tr>
          );
        })}
      </DataTable>
    </SortContext.Provider>
  );
}
