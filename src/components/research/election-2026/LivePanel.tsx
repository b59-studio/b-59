"use client";

import type { LiveFigures } from "@/lib/election-2026/live";
import { fmt, hourLabel, pct, timeCentral, versus2024, wholeElectionByHour } from "@/lib/election-2026/live";
import { ballots2022, ballots2024, CORE } from "./data";
import { SortContext, SortTh, sortItems, useSortState } from "./GeoTable";
import { DataTable, Note, Panel, TrackerLink } from "./parts";

/** "A", "A and B", "A, B and C". */
const listNames = (names: string[]) =>
  names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}` : (names[0] ?? "");

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
          Unofficial tracker check-ins plus the state’s mail-ballot count, read at {timeCentral(fetched)} CT. The 2022
          and 2024 columns set every 2026 ballot so far against each year’s final total. The last two compare 2026
          with 2024 at the same hour of election day, through the last full hour: first every ballot, early vote
          included, then election-day check-ins alone.
          {reference.length
            ? ` ${listNames(reference)} ${reference.length > 1 ? "are" : "is"} not among the 17 focus counties.`
            : ""}
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

/**
 * One county's election day by hour, set against the whole of 2024: each
 * hour's check-ins, then every ballot cast so far, early vote included, in
 * 2026 and in 2024 through the same hour.
 */
function HourlyPanel({ name, live: L }: { name: string; live: LiveFigures }) {
  const at = (rows: [number, number][], h: number) => rows.find(([x]) => x === h)?.[1] ?? 0;
  const total24 = ballots2024(name);
  const hasPrior = L.priorTotal > 0;
  const whole = total24 ? wholeElectionByHour(L, total24, HOURS) : [];
  const rows = HOURS.map((h, i) => {
    const label = hourLabel(h) + (h === 19 ? "–close" : "");
    const v26 = at(L.today, h);
    const then = whole[i]?.then ?? null;
    if (h > L.doneHour && !v26) {
      return (
        <tr key={h}>
          <td>{label}</td>
          <td className="ea-muted">—</td>
          {hasPrior && <td>{fmt(at(L.prior, h))}</td>}
          <td />
          {hasPrior ? <td>{then != null ? fmt(then) : ""}</td> : null}
          <td />
        </tr>
      );
    }
    const now = whole[i]?.now ?? L.beforeElectionDay;
    // Only complete hours are compared; the hour in progress would understate 2026.
    const complete = h < L.doneHour;
    const ratio = !total24 || !complete ? null : hasPrior ? (then ? now / then : null) : now / total24;
    return (
      <tr key={h}>
        <td>{label + (h === L.doneHour ? " (partial)" : "")}</td>
        <td>{fmt(v26)}</td>
        {hasPrior && <td>{fmt(at(L.prior, h))}</td>}
        <td>
          <strong>{fmt(now)}</strong>
        </td>
        {hasPrior && <td>{then != null ? fmt(then) : ""}</td>}
        <td className={ratio != null && ratio >= 1 ? "ea-pos" : undefined}>{ratio != null ? pct(ratio) : ""}</td>
      </tr>
    );
  });

  return (
    <Panel as="h3" title={<TrackerLink label={`${name} County`} url={L.url} extra="tracker" />}>
      <Note>
        {`Before election day: ${fmt(L.beforeElectionDay)} ballots (early in person and mail). `}
        {hasPrior
          ? `“All ballots” adds each hour’s check-ins and compares the whole election so far with 2024 at the same hour, when ${fmt(total24 ?? 0)} voted in all.`
          : `This county’s 2024 hourly data is gone, so the whole election so far is compared with the 2024 total of ${fmt(total24 ?? 0)}.`}
      </Note>
      <DataTable
        head={
          <tr>
            <th>Hour</th>
            <th>Election day 2026</th>
            {hasPrior && <th>Election day 2024</th>}
            <th>All ballots 2026</th>
            {hasPrior && <th>All ballots 2024</th>}
            <th>{hasPrior ? "2026 ÷ 2024" : "% of 2024 total"}</th>
          </tr>
        }
      >
        {rows}
      </DataTable>
    </Panel>
  );
}

/** Every ballot so far against 2024 at the same hour of election day, or null without 2024 hourly data. */
function wholePace(L: LiveFigures, g: string): number | null {
  const total24 = ballots2024(g);
  if (!total24) return null;
  const { now, then } = versus2024(L, total24);
  return then ? now / then : null;
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
  of2024: (L, g) => L.total / ballots2024(g),
  wholePace: (L, g) => wholePace(L, g),
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
            <SortTh by="of2024">% of 2024 total</SortTh>
            <SortTh by="wholePace">All ballots vs 2024, same hour</SortTh>
            <SortTh by="pace">Election day vs 2024, same hour</SortTh>
          </tr>
        }
      >
        {rows.map((g) => {
          const L = live.get(g)!;
          const g22 = ballots2022(g);
          const g24 = ballots2024(g);
          const whole = wholePace(L, g);
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
              <td>{g24 ? pct(L.total / g24) : ""}</td>
              <td className={whole != null && whole >= 1 ? "ea-pos" : undefined}>{whole != null ? pct(whole) : "—"}</td>
              <td className={pace != null && pace >= 1 ? "ea-pos" : undefined}>{pace != null ? pct(pace) : "—"}</td>
            </tr>
          );
        })}
      </DataTable>
    </SortContext.Provider>
  );
}
