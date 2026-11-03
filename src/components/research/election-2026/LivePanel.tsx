"use client";

import type { LiveFigures } from "@/lib/election-2026/live";
import { fmt, hourLabel, pct, timeCentral } from "@/lib/election-2026/live";
import { ballots2022, DATA } from "./data";
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
  const reference = names.filter((g) => !DATA.gen[g]);

  return (
    <>
      <Panel title="Election day, from county trackers">
        <Note>
          Unofficial tracker check-ins plus the state’s mail-ballot count, read at {timeCentral(fetched)} CT. The last
          column compares election-day check-ins through the last full hour with the same hour in 2024.
          {reference.length ? ` ${reference.join(" and ")} are not among the 17 and are shown for reference.` : ""}
        </Note>
        <DataTable
          head={
            <tr>
              <th>County</th>
              <th>Tracker time (CT)</th>
              <th>Early in person</th>
              <th>Mail</th>
              <th>Election day</th>
              <th>Total</th>
              <th>% of registered</th>
              <th>% of 2022 total</th>
              <th>Election day vs 2024</th>
            </tr>
          }
        >
          {names.map((g) => {
            const L = live.get(g)!;
            const g22 = ballots2022(g);
            const pace = L.priorThrough ? L.edThrough / L.priorThrough : null;
            return (
              <tr key={g} className={DATA.gen[g] ? undefined : "ea-sub"}>
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
