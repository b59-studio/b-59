"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  countsTowardAverage,
  daysBetween,
  HALF_LIFE_DAYS,
  type Poll,
  pollAverage,
  SAMPLE_CAP,
  trend,
  WINDOW_DAYS,
} from "@/lib/polls-2026/average";
import { AS_OF, pollsFor, RACES, type Race } from "@/lib/polls-2026/data";
import { SortContext, SortTh, sortItems, useSortState } from "../election-2026/GeoTable";
import { DataTable, Note, Panel, Stat } from "../election-2026/parts";

const one = (x: number) => x.toFixed(1);

/** A Democratic-minus-Republican margin in points, as D+n or R+n. */
const lead = (m: number) => (Math.abs(m) < 0.05 ? "Tied" : `${m > 0 ? "D" : "R"}+${one(Math.abs(m))}`);

/** Party shading for a margin cell: blue or red, stronger as the lead grows to 20 points. */
const shade = (m: number) => ({
  background: `color-mix(in srgb, var(--ea-${m >= 0 ? "dem" : "rep"}) ${Math.round(Math.min(1, Math.abs(m) / 20) * 45)}%, var(--ea-panel))`,
});

const dayFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const monthFormat = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });
const day = (iso: string) => dayFormat.format(new Date(`${iso}T00:00:00Z`));

/** Field dates as "Oct 20–22" or "Sep 28–Oct 2". */
function fieldDates(p: Poll) {
  if (p.start === p.end) return day(p.end);
  const [sm, ed] = [day(p.start).split(" ")[0], day(p.end).split(" ")[0]];
  return sm === ed ? `${day(p.start)}–${p.end.slice(8).replace(/^0/, "")}` : `${day(p.start)}–${day(p.end)}`;
}

/** Why a poll carries no weight in today's average, or null when it does. */
function notCounted(p: Poll, used: Set<Poll>): string | null {
  if (used.has(p)) return null;
  if (p.partisan) return `${p.partisan === "D" ? "Democratic" : "Republican"}-sponsored`;
  if (p.population === "A") return "Adults, not voters";
  if (daysBetween(p.end, AS_OF) > WINDOW_DAYS) return `Older than ${WINDOW_DAYS} days`;
  return "Pollster has a newer poll";
}

const RACE_SUMMARY = RACES.map((race) => {
  const polls = pollsFor(race.id);
  return { race, polls, avg: pollAverage(polls, AS_OF), latest: [...polls].sort((a, b) => b.end.localeCompare(a.end))[0] };
});

export function PreElectionPanel() {
  const [raceId, setRaceId] = useState(RACES[0].id);
  const race = RACES.find((r) => r.id === raceId)!;
  const name = useId();

  return (
    <>
      <SummaryPanel />
      <Panel title="One race in detail" expandable={false}>
        <fieldset className="ea-seg">
          <legend className="ea-field-label">Race</legend>
          {RACES.map((r) => (
            <label key={r.id} className="ea-seg-option">
              <input
                type="radio"
                className="sr-only"
                name={name}
                value={r.id}
                checked={raceId === r.id}
                onChange={() => setRaceId(r.id)}
              />
              <span>{r.name}</span>
            </label>
          ))}
        </fieldset>
      </Panel>
      <RaceDetail key={race.id} race={race} />
      <MethodPanel />
    </>
  );
}

function SummaryPanel() {
  return (
    <Panel title={`Where the races stand, as of ${day(AS_OF)}`}>
      <Note>
        The average of each pollster’s latest poll from the last {WINDOW_DAYS} days, weighted toward newer and larger
        polls. Margin is the Democrat’s share minus the Republican’s; blue where the Democrat leads, red where the
        Republican does.
      </Note>
      <DataTable
        head={
          <tr>
            <th>Race</th>
            <th>Margin</th>
            <th>Democrat</th>
            <th>Republican</th>
            <th>Polls averaged</th>
            <th>Latest poll ended</th>
          </tr>
        }
      >
        {RACE_SUMMARY.map(({ race, polls, avg, latest }) => (
          <tr key={race.id}>
            <td>{race.name}</td>
            <td style={avg ? shade(avg.margin) : undefined}>{avg ? lead(avg.margin) : "No recent poll"}</td>
            <td>
              {avg ? `${one(avg.dem)}%` : "–"}
              <span className="ea-cnt">{race.dem}</span>
            </td>
            <td>
              {avg ? `${one(avg.rep)}%` : "–"}
              <span className="ea-cnt">{race.rep}</span>
            </td>
            <td>
              {avg ? avg.polls.length : 0}
              <span className="ea-cnt">{`of ${polls.length} listed`}</span>
            </td>
            <td>{latest ? day(latest.end) : "None"}</td>
          </tr>
        ))}
      </DataTable>
    </Panel>
  );
}

function RaceDetail({ race }: { race: Race }) {
  const polls = useMemo(() => pollsFor(race.id), [race.id]);
  const avg = useMemo(() => pollAverage(polls, AS_OF), [polls]);
  const points = useMemo(() => trend(polls, AS_OF), [polls]);

  return (
    <>
      <Panel title={`${race.name}: ${race.dem} (D) v. ${race.rep} (R)`} expandable={false}>
        {avg ? (
          <div className="ea-stats">
            <Stat value={`${one(avg.dem)}%`} label={race.dem} />
            <Stat value={`${one(avg.rep)}%`} label={race.rep} />
            <Stat value={lead(avg.margin)} label="Average margin" />
            <Stat value={String(avg.polls.length)} label={avg.polls.length === 1 ? "Poll averaged" : "Polls averaged"} />
          </div>
        ) : (
          <p className="ea-note ea-note-lead">
            {polls.length
              ? `No independent poll of this race ended in the ${WINDOW_DAYS} days before ${day(AS_OF)}, so there is no current average. Every listed poll is in the table below.`
              : "No public poll of this race has been found since the primaries."}
          </p>
        )}
        {points.length > 0 && <TrendChart race={race} polls={polls} points={points} />}
      </Panel>
      {polls.length > 0 && <PollTable race={race} polls={polls} used={new Set(avg?.polls.map((w) => w.poll))} weights={avg} />}
    </>
  );
}

type Point = ReturnType<typeof trend>[number];

/**
 * The daily average of each candidate's share, with every poll as a dot
 * behind it. Hollow dots are polls the average leaves out. The line breaks on
 * days with no poll in the window.
 */
function TrendChart({ race, polls, points }: { race: Race; polls: Poll[]; points: Point[] }) {
  const box = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(600);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => setW(Math.max(300, el.clientWidth || 600));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const H = 300;
  const [top, bottom, left, right] = [14, 30, 40, 12];
  const first = [points[0].date, ...polls.map((p) => p.end)].sort()[0];
  const span = Math.max(1, daysBetween(first, AS_OF));
  const shares = [...points.flatMap((p) => [p.dem, p.rep]), ...polls.flatMap((p) => [p.dem, p.rep])];
  const lo = Math.floor((Math.min(...shares) - 2) / 5) * 5;
  const hi = Math.ceil((Math.max(...shares) + 2) / 5) * 5;
  const ticks: number[] = [];
  for (let t = lo; t <= hi; t += hi - lo > 30 ? 10 : 5) ticks.push(t);
  // Rounded so the server and the browser draw the same path (their float maths can differ in the last digit).
  const round = (v: number) => Math.round(v * 10) / 10;
  const xS = (iso: string) => round(left + (daysBetween(first, iso) / span) * (W - left - right));
  const yS = (v: number) => round(top + ((hi - v) / (hi - lo)) * (H - top - bottom));

  // One label per month, at the first of the month, where there is room.
  const months: string[] = [];
  for (let d = `${first.slice(0, 7)}-01`; d <= AS_OF; d = new Date(Date.UTC(+d.slice(0, 4), +d.slice(5, 7), 1)).toISOString().slice(0, 10)) {
    if (d >= first) months.push(d);
  }
  const monthStep = Math.ceil(months.length / Math.max(1, Math.floor((W - left - right) / 48)));

  // Consecutive days form one stretch of line; a gap starts a new one.
  const path = (pick: (p: Point) => number) =>
    points.map((p, i) => `${i && daysBetween(points[i - 1].date, p.date) === 1 ? "L" : "M"}${xS(p.date)},${yS(pick(p))}`).join(" ");

  const pointAt = (e: React.PointerEvent<SVGRectElement>) => {
    const r = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
    const mx = ((e.clientX - r.left) / r.width) * W;
    let best = 0;
    points.forEach((p, i) => {
      if (Math.abs(xS(p.date) - mx) < Math.abs(xS(points[best].date) - mx)) best = i;
    });
    setHover(best);
  };

  const h = hover == null ? null : points[hover];
  const series = [
    { key: "dem" as const, color: "var(--ea-dem)", label: race.dem },
    { key: "rep" as const, color: "var(--ea-rep)", label: race.rep },
  ];

  return (
    <figure className="ea-head">
      <ul className="ea-legend" aria-label="Legend">
        {series.map((s) => (
          <li key={s.key}>
            <span className="ea-sw" style={{ background: s.color }} />
            {`${s.label}, average`}
          </li>
        ))}
        <li>
          <span className="ea-sw ea-sw-dot" />
          One poll (hollow: not averaged)
        </li>
      </ul>
      <div ref={box} className="ea-chart">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`${race.name}: the poll average from ${day(first)} to ${day(AS_OF)}. Latest: ${race.dem} ${one(points.at(-1)!.dem)}%, ${race.rep} ${one(points.at(-1)!.rep)}%.`}
        >
          {ticks.map((t) => (
            <g key={t}>
              <line x1={left} x2={W - right} y1={yS(t)} y2={yS(t)} stroke="var(--ea-line)" strokeWidth={1} />
              <text x={left - 6} y={yS(t)} dy="0.32em" textAnchor="end" fontSize={13} fill="var(--ea-muted)">
                {`${t}%`}
              </text>
            </g>
          ))}
          {months
            .filter((_, i) => i % monthStep === 0)
            .map((m) => (
              <text key={m} x={xS(m)} y={H - 8} textAnchor="middle" fontSize={13} fill="var(--ea-muted)">
                {monthFormat.format(new Date(`${m}T00:00:00Z`))}
              </text>
            ))}
          {polls.flatMap((p, i) =>
            series.map((s) => (
              <circle
                key={`${i}${s.key}`}
                cx={xS(p.end)}
                cy={yS(p[s.key])}
                r={3.5}
                fill={countsTowardAverage(p) ? s.color : "none"}
                fillOpacity={0.35}
                stroke={s.color}
                strokeOpacity={0.6}
                strokeWidth={1}
              />
            )),
          )}
          {series.map((s) => (
            <path key={s.key} d={path((p) => p[s.key])} fill="none" stroke={s.color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          ))}
          {h && (
            <g>
              <line x1={xS(h.date)} x2={xS(h.date)} y1={top} y2={H - bottom} stroke="var(--color-b59-blue)" strokeWidth={1} />
              {series.map((s) => (
                <circle key={s.key} cx={xS(h.date)} cy={yS(h[s.key])} r={4.5} fill={s.color} stroke="var(--ea-panel)" strokeWidth={2} />
              ))}
            </g>
          )}
          <rect
            x={left}
            y={0}
            width={W - left - right}
            height={H}
            fill="transparent"
            onPointerMove={pointAt}
            onPointerDown={pointAt}
            onPointerLeave={() => setHover(null)}
          />
        </svg>
        {h && (
          <div className="ea-tip" style={{ left: `max(0px, min(calc(100% - 13rem), ${(xS(h.date) / W) * 100}% + 12px))` }}>
            <div className="ea-muted">{`Average on ${day(h.date)}`}</div>
            {series.map((s) => (
              <div key={s.key}>
                <span className="ea-sw" style={{ background: s.color }} />
                {`${s.label}: ${one(h[s.key])}%`}
              </div>
            ))}
            <div>{lead(h.margin)}</div>
          </div>
        )}
      </div>
      <figcaption className="ea-note">
        Each day’s line is the average as it stood that day, from the polls published by then. Point at or tap the chart
        for a day’s figures.
      </figcaption>
    </figure>
  );
}

function PollTable({
  race,
  polls,
  used,
  weights,
}: {
  race: Race;
  polls: Poll[];
  used: Set<Poll>;
  weights: ReturnType<typeof pollAverage>;
}) {
  const { by, dir, toggle, reset } = useSortState();
  const weightOf = (p: Poll) => weights?.polls.find((w) => w.poll === p)?.weight ?? null;
  const keys: Record<string, (p: Poll) => number | string | null> = {
    name: (p) => p.pollster,
    end: (p) => p.end,
    n: (p) => p.n,
    dem: (p) => p.dem,
    rep: (p) => p.rep,
    margin: (p) => p.dem - p.rep,
    weight: weightOf,
  };
  const newestFirst = [...polls].sort((a, b) => b.end.localeCompare(a.end) || a.pollster.localeCompare(b.pollster));
  const rows = sortItems(newestFirst, by ? keys[by] : null, dir);

  return (
    <Panel title={`Every ${race.name} poll`}>
      <Note>
        Newest first. Shares are as each pollster published them; the rest of each sample was undecided or chose
        another candidate. Weight is each poll’s share of today’s average. Population: LV likely voters, RV registered
        voters, A all adults.
      </Note>
      {by && (
        <button type="button" className="ea-btn ea-sort-reset" onClick={reset}>
          Back to the default order
        </button>
      )}
      <SortContext.Provider value={{ by, dir, toggle }}>
        <DataTable
          head={
            <tr>
              <SortTh by="name">Pollster</SortTh>
              <SortTh by="end">Field dates</SortTh>
              <SortTh by="n">Sample</SortTh>
              <SortTh by="dem">{race.dem.split(" ").at(-1)}</SortTh>
              <SortTh by="rep">{race.rep.split(" ").at(-1)}</SortTh>
              <SortTh by="margin">Margin</SortTh>
              <SortTh by="weight">Weight</SortTh>
            </tr>
          }
        >
          {rows.map((p) => {
            const w = weightOf(p);
            const why = notCounted(p, used);
            return (
              <tr key={`${p.pollster}${p.end}${p.n}`}>
                <td>
                  <a className="ea-link" href={p.url} target="_blank" rel="noopener noreferrer">
                    {p.pollster}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                  {p.sponsor && <span className="ea-cnt">{`for ${p.sponsor}`}</span>}
                </td>
                <td>{fieldDates(p)}</td>
                <td>
                  {p.n.toLocaleString("en-US")}
                  <span className="ea-cnt">{p.population}</span>
                </td>
                <td>{`${one(p.dem)}%`}</td>
                <td>{`${one(p.rep)}%`}</td>
                <td style={shade(p.dem - p.rep)}>{lead(p.dem - p.rep)}</td>
                <td>{w != null ? `${Math.round(w * 100)}%` : <span className="ea-muted ea-why">{why}</span>}</td>
              </tr>
            );
          })}
        </DataTable>
      </SortContext.Provider>
    </Panel>
  );
}

function MethodPanel() {
  return (
    <Panel title="How the average works" expandable={false}>
      <div className="ea-prose">
        <p>
          The average is deliberately simple, so it can be checked by hand. For each race, on each day, it takes every
          poll whose fieldwork ended in the previous {WINDOW_DAYS} days and keeps only each pollster’s most recent one,
          so a pollster that releases often does not outvote one that releases rarely.
        </p>
        <p>
          Each poll’s weight is the square root of its sample size (samples above {SAMPLE_CAP.toLocaleString("en-US")}{" "}
          count as {SAMPLE_CAP.toLocaleString("en-US")}), halved for every {HALF_LIFE_DAYS} days since its fieldwork
          ended. The average share is the weighted mean of the published shares, and the margin is the Democrat’s
          average minus the Republican’s. Nothing is adjusted for a pollster’s record or lean.
        </p>
        <p>
          Polls of all adults, and polls sponsored by a party, a campaign or a partisan group, are listed but not
          averaged. Where a poll reports both likely and registered voters, the likely-voter figures are used. When no
          independent poll ended within {WINDOW_DAYS} days, the page shows no average rather than a stale one.
        </p>
        <p>
          Polls are entered by hand from each pollster’s own release, which every row links to. A poll is a snapshot
          with a margin of error of several points for each candidate, and an average narrows that error without
          removing it; a lead of a few points in the average is not a forecast of the result.
        </p>
      </div>
    </Panel>
  );
}
