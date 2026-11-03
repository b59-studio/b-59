"use client";

import { useEffect, useRef, useState } from "react";
import { fmt, margin, pct, points } from "@/lib/election-2026/live";
import { BY_GEOGRAPHY, DATA, MIDTERMS, race, raceMargin, shade, SHORT_OFFICE, TOP_OF_TICKET, YEARS } from "./data";
import { FilterPick, Note, Panel, usePanelExpanded } from "./parts";
import { GeoTable } from "./GeoTable";

/** A one-row header of `columns` after the County title, over every geography. */
function GeoColumns({ columns, cells }: { columns: React.ReactNode[]; cells: (geo: string) => React.ReactNode }) {
  return (
    <GeoTable
      columns={1 + columns.length}
      head={
        <tr>
          <th>County</th>
          {columns}
        </tr>
      }
      cells={cells}
    />
  );
}

function Legend({ items }: { items: [color: string, label: string][] }) {
  return (
    <div className="ea-legend">
      {items.map(([color, label]) => (
        <span key={label}>
          <span className="ea-sw" style={{ background: color }} />
          {label}
        </span>
      ))}
    </div>
  );
}

const PRIMARY_YEARS = [...YEARS, "2026"];

export function PrimariesPanel() {
  const P = DATA.prim;
  return (
    <>
      <Panel title="Democratic share of primary ballots">
        <Note>
          Democratic primary ballots as a share of all major-party primary ballots, with counts below. 2026 is early
          vote only, so read it for direction, not size.
        </Note>
        <Legend
          items={[
            ["color-mix(in srgb, var(--ea-dem) 45%, var(--ea-panel))", "More Democratic ballots"],
            ["color-mix(in srgb, var(--ea-rep) 45%, var(--ea-panel))", "More Republican ballots"],
          ]}
        />
        <GeoColumns
          columns={PRIMARY_YEARS.map((y) => (
            <th key={y} className={y === "2026" ? "ea-sep" : undefined}>
              {y === "2026" ? "2026 (early vote)" : y}
            </th>
          ))}
          cells={(g) =>
            PRIMARY_YEARS.map((y) => {
              const [d, r] = P[g][y];
              const s = d / (d + r);
              return (
                <td key={y} className={y === "2026" ? "ea-sep" : undefined} style={shade(s >= 0.5 ? "dem" : "rep", Math.abs(s - 0.5) * 2)}>
                  {pct(s)}
                  <span className="ea-cnt">{`${fmt(d)} D · ${fmt(r)} R`}</span>
                </td>
              );
            })
          }
        />
      </Panel>
      <Panel title="Primary turnout">
        <Note>
          D + R primary ballots ÷ registered voters. Presidential years run higher.
        </Note>
        <GeoColumns
          columns={YEARS.map((y) => (
            <th key={y}>{y}</th>
          ))}
          cells={(g) =>
            YEARS.map((y) => {
              const [d, r, reg] = P[g][y];
              return (
                <td key={y}>
                  {pct((d + r) / reg)}
                  <span className="ea-cnt">{fmt(d + r)}</span>
                </td>
              );
            })
          }
        />
      </Panel>
    </>
  );
}

const DOWN_BALLOT = [
  { office: "Railroad Comm.", name: "Railroad Comm.", color: "var(--ea-series-2)", years: YEARS },
  { office: "Comptroller", name: "Comptroller", color: "var(--ea-series-3)", years: MIDTERMS },
];

function GapTable({ office, years }: { office: string; years: string[] }) {
  const gap = (g: string, y: string) => {
    const top = raceMargin(race(g, y, TOP_OF_TICKET[y]));
    const down = raceMargin(race(g, y, office));
    return top == null || down == null ? null : down - top;
  };
  return (
    <GeoColumns
      columns={years.map((y) => (
        <th key={y}>{`${y} vs ${SHORT_OFFICE[TOP_OF_TICKET[y]]}`}</th>
      ))}
      cells={(g) =>
        years.map((y) => {
          const v = gap(g, y);
          return (
            <td key={y} style={v == null ? undefined : shade(v >= 0 ? "dem" : "rep", Math.abs(v) / 0.2)}>
              {points(v)}
            </td>
          );
        })
      }
    />
  );
}

export function TicketPanel() {
  const [geo, setGeo] = useState("Statewide");
  return (
    <>
      <p className="ea-note">
        Margin is the Democratic share minus the Republican share. Top of the ticket is the Governor in 2022, the U.S.
        Senate in 2018 and the President in 2016, 2020 and 2024. The Comptroller is elected in midterm years only. A
        positive gap means the down-ballot Democrat ran ahead of the top of the ticket.
      </p>
      <Panel title="Margin over time">
        <div className="ea-bar ea-bar-start">
          <FilterPick label="Place" options={BY_GEOGRAPHY.map(({ geo: g, section }) => ({ value: g, label: g, group: section }))} value={geo} onChange={setGeo} />
        </div>
        <Legend
          items={[
            ["var(--ea-accent)", "Top of ticket"],
            ...DOWN_BALLOT.map((d): [string, string] => [d.color, d.name + (d.years === MIDTERMS ? " (midterms)" : "")]),
          ]}
        />
        <TrendChart geo={geo} />
      </Panel>
      <div className="ea-grid2">
        <Panel title="Railroad Commissioner vs top of ticket">
          <Note>Gap in percentage points. Blue where the Democrat ran ahead of the top of the ticket, red where behind.</Note>
          <GapTable office="Railroad Comm." years={YEARS} />
        </Panel>
        <Panel title="Comptroller vs top of ticket">
          <Note>
            Gap in percentage points, midterm years only: Chevalier (2018) and Dudding (2022).
          </Note>
          <GapTable office="Comptroller" years={MIDTERMS} />
        </Panel>
      </div>
    </>
  );
}

function TrendChart({ geo }: { geo: string }) {
  const box = useRef<HTMLDivElement>(null);
  const expanded = usePanelExpanded();
  const [size, setSize] = useState({ w: 600, h: 300 });
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () =>
      setSize({ w: Math.max(320, el.clientWidth || 600), h: expanded ? Math.max(300, el.clientHeight - 8) : 300 });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [expanded]);

  const { w: W, h: H } = size;
  const top = 14;
  const bottom = 30;
  const left = 48;
  const right = 16;
  const series = [
    { name: "Top of ticket", color: "var(--ea-accent)", pts: YEARS.map((y) => ({ office: TOP_OF_TICKET[y], v: raceMargin(race(geo, y, TOP_OF_TICKET[y])) })) },
    ...DOWN_BALLOT.map((d) => ({
      name: d.name,
      color: d.color,
      pts: YEARS.map((y) => ({ office: d.office, v: d.years.includes(y) ? raceMargin(race(geo, y, d.office)) : null })),
    })),
  ];
  const vals = series.flatMap((s) => s.pts.map((p) => p.v)).filter((v): v is number => v != null).concat([0]);
  let lo = Math.min(...vals);
  let hi = Math.max(...vals);
  const pad = Math.max(0.04, (hi - lo) * 0.1);
  lo -= pad;
  hi += pad;
  const step = hi - lo > 0.8 ? 0.2 : hi - lo > 0.35 ? 0.1 : 0.05;
  const ticks: number[] = [];
  for (let t = Math.ceil(lo / step) * step; t <= hi + 1e-9; t += step) ticks.push(Math.round(t * 100) / 100);
  const yS = (v: number) => top + ((hi - v) / (hi - lo)) * (H - top - bottom);
  const xS = (i: number) => left + 10 + (i * (W - left - right - 20)) / (YEARS.length - 1);

  const pointAt = (e: React.PointerEvent<SVGRectElement>) => {
    const r = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
    const mx = ((e.clientX - r.left) / r.width) * W;
    let i = 0;
    YEARS.forEach((_, j) => {
      if (Math.abs(xS(j) - mx) < Math.abs(xS(i) - mx)) i = j;
    });
    setHover(i);
  };

  return (
    <div ref={box} className="ea-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${geo}: top-of-ticket, Railroad Commissioner and Comptroller margins, 2016 to 2024`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={left} x2={W - right} y1={yS(t)} y2={yS(t)} stroke={t === 0 ? "var(--ea-muted)" : "var(--ea-line)"} strokeWidth={1} />
            <text x={left - 8} y={yS(t)} dy="0.32em" textAnchor="end" fontSize={13} fill="var(--ea-muted)">
              {t === 0 ? "0" : `${t > 0 ? "D+" : "R+"}${Math.round(Math.abs(t) * 100)}`}
            </text>
          </g>
        ))}
        {YEARS.map((y, i) => (
          <text key={y} x={xS(i)} y={H - 8} textAnchor="middle" fontSize={13} fill="var(--ea-muted)">
            {y}
          </text>
        ))}
        {series.map((s) => (
          <g key={s.name}>
            <path
              d={"M" + s.pts.map((p, i) => (p.v == null ? null : `${xS(i)},${yS(p.v)}`)).filter(Boolean).join(" L")}
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {s.pts.map((p, i) => (p.v == null ? null : <circle key={i} cx={xS(i)} cy={yS(p.v)} r={4.5} fill={s.color} stroke="var(--ea-panel)" strokeWidth={2} />))}
          </g>
        ))}
        {hover != null && <line x1={xS(hover)} x2={xS(hover)} y1={top} y2={H - bottom} stroke="var(--ea-muted)" strokeWidth={1} />}
        <rect x={left} y={0} width={W - left} height={H} fill="transparent" onPointerMove={pointAt} onPointerDown={pointAt} onPointerLeave={() => setHover(null)} />
      </svg>
      {hover != null && (
        <div className="ea-tip" style={{ left: `min(calc(100% - 13rem), ${(xS(hover) / W) * 100}% + 12px)` }}>
          <div className="ea-muted">{`${geo} · ${YEARS[hover]}`}</div>
          {series
            .filter((s) => s.pts[hover].v != null)
            .map((s) => (
              <div key={s.name}>
                <span className="ea-sw" style={{ background: s.color }} />
                {`${s.pts[hover].office}: ${margin(s.pts[hover].v)}`}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

const RACE_OFFICES = ["President", "U.S. Senate", "Governor", "Railroad Comm.", "Comptroller"];

export function RacesPanel() {
  const order = YEARS.flatMap((y) => RACE_OFFICES.filter((o) => race("Statewide", y, o)).map((o): [string, string] => [y, o]));
  const sep = (i: number) => (i > 0 && order[i - 1][0] !== order[i][0] ? "ea-sep" : undefined);
  return (
    <Panel title="All statewide races">
      <Note>Winning margin, with Democratic and Republican votes below. Each column names the Democrat first.</Note>
      <GeoColumns
        columns={order.map(([y, o], i) => (
          <th key={`${y}${o}`} className={sep(i)}>
            {`${y} ${SHORT_OFFICE[o]}`}
            <span className="ea-src-tag">{`${race("Statewide", y, o)![3]} v. ${race("Statewide", y, o)![4]}`}</span>
          </th>
        ))}
        cells={(g) =>
          order.map(([y, o], i) => {
            const r = race(g, y, o);
            const m = raceMargin(r);
            return (
              <td key={`${y}${o}`} className={sep(i)} style={m == null ? undefined : shade(m >= 0 ? "dem" : "rep", Math.abs(m) / 0.7)}>
                {margin(m)}
                {r && <span className="ea-cnt">{`${fmt(r[5])} D · ${fmt(r[6])} R`}</span>}
              </td>
            );
          })
        }
      />
    </Panel>
  );
}

export function MethodPanel() {
  const a = (href: string, text: string) => (
    <a className="ea-link" href={href} target="_blank" rel="noopener noreferrer">
      {text}
    </a>
  );
  return (
    <Panel title="Method and sources" expandable={false}>
      <div className="ea-prose">
        <h3 className="ea-subhead">Counties</h3>
        <p>
          Every Texas county is here. Seventeen come first, chosen because together they represent the range of
          sentiment across the state: El Paso, Webb and Maverick on the border; Hidalgo, Cameron, Starr and Willacy in
          the Rio Grande Valley, which the tables also sum as “Valley”; Harris, Dallas and Bexar; Collin, Denton,
          Williamson, Bell, Montgomery and Ellis; and Hockley. Every table pins the state as a whole at the top and lists
          Travis County next as a benchmark. After the 17, the remaining counties follow by population, using the
          Census Bureau’s 2024 estimates.
        </p>
        <h3 className="ea-subhead">Measures</h3>
        <p>
          Turnout is ballots cast as a share of registered voters. The 2026 early vote is the final count of in-person
          and mail ballots through October 30. Live figures add the state’s mail-ballot count to each county tracker’s
          in-person check-ins, early and election day; they are unofficial and are reread every 15 minutes. Five of
          the 17 counties publish a tracker. McLennan and Madison also do, and are shown for reference.
        </p>
        <p>
          Grey shading shows turnout. Blue and red appear only on partisan measures: margins and primary share.
        </p>
        <h3 className="ea-subhead">Sources</h3>
        <ul className="ea-src">
          <li>
            2016–2024 registration, turnout and results: Texas Legislative Council precinct data from the{" "}
            {a("https://data.capitol.texas.gov/", "Capitol Data Portal")}, summed to county. Its turnout runs about 0.5%
            above the Secretary of State’s certified totals, and its registration is mapped onto current precincts, so
            it is consistent across years rather than official.
          </li>
          <li>
            2026 early vote and March 2026 primary early vote: Texas Secretary of State,{" "}
            {a("https://goelect.txelections.civixapps.com/ivis-evr-ui/evr", "early-voting turnout by county")}. Final
            2026 primary totals were not yet published.
          </li>
          <li>Election day: each county’s ElectionLink turnout tracker.</li>
          <li>
            County order: Census Bureau{" "}
            {a("https://www.census.gov/data/tables/time-series/demo/popest/2020s-counties-total.html", "2024 county population estimates")}.
          </li>
        </ul>
        <h3 className="ea-subhead">Caveats</h3>
        <ul className="ea-src">
          <li>
            Primary share counts ballots in each party’s primary. It is a rough read on partisanship, not a model of
            likely voters, and uncontested local Democratic primaries (Starr, Maverick, Webb) inflate the Democratic
            share.
          </li>
          <li>
            Railroad Commissioner races: Christian v. Yarbrough (2016), Craddick v. McAllen (2018), Wright v. Castañeda
            (2020), Christian v. Warford (2022), Craddick v. Culbert (2024).
          </li>
        </ul>
      </div>
    </Panel>
  );
}
