"use client";

import { Fragment, useId, useState } from "react";
import { SortContext, SortTh, sortItems, useSortState } from "@/components/research/election-2026/GeoTable";
import { DataTable, FilterPick, Note, Panel } from "@/components/research/election-2026/parts";
import { margin, pct } from "@/lib/election-2026/live";
import raw from "@/lib/polls-2026/exit-polls.json";
import {
  compare,
  DIMENSIONS,
  history,
  HEADLINE_GROUPS,
  latestReleases,
  type Comparison,
  type ExitPollData,
  type RaceId,
  type SourceId,
} from "@/lib/polls-2026/exitPolls";

const DATA = raw as ExitPollData;
const SOURCES = DATA.sources;
/** Sources with at least one release: the only ones given columns. */
const REPORTING = SOURCES.filter((s) => DATA.releases.some((r) => r.source === s.id));

// Release times in Central with the day, since the night runs past midnight.
const stampFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Chicago",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});
const stamp = (iso: string) => `${stampFormat.format(new Date(iso))} CT`;

/** A spread in points, unsigned: how far apart the sources are. */
const gap = (x: number | null) => (x == null ? "" : `${(x * 100).toFixed(1)} pts`);

/** A margin coloured by the party it leans to: a bar beside the figure, the figure itself in text colour. */
function Margin({ value }: { value: number | null | undefined }) {
  if (value == null) return <span className="ea-muted">–</span>;
  // Rounded to the point, a tie leans to nobody.
  if (Math.abs(value) < 0.0005) return <span className="ea-lean">Even</span>;
  return <span className={value > 0 ? "ea-lean ea-lean-d" : "ea-lean ea-lean-r"}>{margin(value)}</span>;
}

/** Option pills (standards/42): every choice visible, real radios underneath. */
function Pills<T extends string>({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string;
  options: readonly (readonly [T, string])[];
  value: T;
  onChange: (value: T) => void;
}) {
  const name = useId();
  return (
    <fieldset className="ea-seg">
      <legend className="ea-field-label">{legend}</legend>
      {options.map(([id, label]) => (
        <label key={id} className="ea-seg-option">
          <input type="radio" className="sr-only" name={name} value={id} checked={value === id} onChange={() => onChange(id)} />
          <span>{label}</span>
        </label>
      ))}
    </fieldset>
  );
}

const RACE_OPTIONS = DATA.races.map((r) => [r.id, r.label.split(":")[0]] as const);
const DIMENSION_OPTIONS = [["all", "All groups"], ...DIMENSIONS.filter((d) => d !== "All voters").map((d) => [d, d] as const)] as const;

/** The sort keys of the comparison table, beside "name". */
function sortValue(key: string): ((row: Comparison) => number | null | undefined) | null {
  const [source, field] = key.split(":") as [SourceId | "spread", string];
  if (source === "spread") return (r) => (field === "share" ? r.shareSpread : r.marginSpread);
  return (r) => {
    const f = r.bySource[source];
    return field === "share" ? f?.share : field === "dem" ? f?.dem : field === "rep" ? f?.rep : f?.margin;
  };
}

function ComparisonTable({ rows }: { rows: Comparison[] }) {
  const { by, dir, toggle, reset } = useSortState();
  const COLS = REPORTING;
  // A spread needs two sources.
  const paired = COLS.length > 1;
  const value = by === "name" ? (r: Comparison) => r.group : by ? sortValue(by) : null;
  const shown = sortItems(rows, value, dir);
  const columns = 1 + COLS.length * 4 + (paired ? 2 : 0);

  return (
    <SortContext.Provider value={{ by, dir, toggle }}>
      {by && (
        <button type="button" className="ea-btn ea-sort-reset" onClick={reset}>
          Back to the default order
        </button>
      )}
      <DataTable
        head={
          <>
            <tr>
              <SortTh by="name" rowSpan={2}>
                Group
              </SortTh>
              {COLS.map((s) => (
                <th key={s.id} colSpan={4} className="ea-grp ea-sep">
                  {s.name}
                </th>
              ))}
              {paired && (
                <th colSpan={2} className="ea-grp ea-sep">
                  Spread between sources
                </th>
              )}
            </tr>
            <tr>
              {COLS.map((s) => (
                <Fragment key={s.id}>
                  <SortTh by={`${s.id}:share`} className="ea-sep">
                    Share
                  </SortTh>
                  <SortTh by={`${s.id}:dem`}>Dem.</SortTh>
                  <SortTh by={`${s.id}:rep`}>Rep.</SortTh>
                  <SortTh by={`${s.id}:margin`}>Margin</SortTh>
                </Fragment>
              ))}
              {paired && (
                <>
                  <SortTh by="spread:share" className="ea-sep">
                    Share
                  </SortTh>
                  <SortTh by="spread:margin">Margin</SortTh>
                </>
              )}
            </tr>
          </>
        }
      >
        {shown.map((r, i) => (
          <Fragment key={r.group}>
            {!by && r.dimension !== shown[i - 1]?.dimension && r.dimension !== "All voters" && (
              <tr className="ea-grp-row">
                <td colSpan={columns}>{r.dimension}</td>
              </tr>
            )}
            <tr className={r.group === "All voters" ? "ea-bench" : undefined}>
              <td>
                {r.group}
                {COLS.map((s) => r.bySource[s.id]?.note && (
                  <span key={s.id} className="ea-cnt">{`${s.name}: ${r.bySource[s.id]!.note}`}</span>
                ))}
              </td>
              {COLS.map((s) => {
                const f = r.bySource[s.id];
                return (
                  <Fragment key={s.id}>
                    <td className="ea-sep">{f ? pct(f.share) || "–" : <span className="ea-muted">Not reported</span>}</td>
                    <td>{f ? pct(f.dem) || "–" : ""}</td>
                    <td>{f ? pct(f.rep) || "–" : ""}</td>
                    <td>{f && <Margin value={f.margin} />}</td>
                  </Fragment>
                );
              })}
              {paired && (
                <>
                  <td className="ea-sep">{gap(r.shareSpread) || <span className="ea-muted">–</span>}</td>
                  <td>{gap(r.marginSpread) || <span className="ea-muted">–</span>}</td>
                </>
              )}
            </tr>
          </Fragment>
        ))}
      </DataTable>
    </SortContext.Provider>
  );
}

/** How one group's figures moved through the night, release by release, for each source. */
function NightPanel({ race }: { race: RaceId }) {
  const reported = new Set(DATA.releases.filter((r) => r.race === race).flatMap((r) => r.rows.map((f) => f.group)));
  const options = Object.entries(HEADLINE_GROUPS).flatMap(([dim, groups]) =>
    groups.filter((g) => reported.has(g)).map((g) => ({ value: g, label: g, group: dim })),
  );
  const [group, setGroup] = useState(options[0]?.value ?? "All voters");
  const steps = SOURCES.flatMap((s) =>
    history(DATA.releases, race, s.id, group).map((h, i, all) => ({
      ...h,
      source: s.short,
      key: `${s.id}-${h.released}`,
      change: i > 0 && h.margin != null && all[i - 1].margin != null ? h.margin - all[i - 1].margin! : null,
    })),
  );

  return (
    <Panel title="Through the night" as="h3">
      <Note>
        Exit polls are reweighted as the count comes in, so a group’s figures can move between releases. Each row is one
        release, with its share of voters, its margin, and the change in margin from that source’s previous release. Times are Central.
      </Note>
      <FilterPick label="Group" options={options} value={group} onChange={setGroup} />
      <DataTable
        head={
          <tr>
            <th>Source</th>
            <th>Released</th>
            <th>Share of voters</th>
            <th>Margin</th>
            <th>Change</th>
          </tr>
        }
      >
        {steps.map((h) => (
          <tr key={h.key}>
            <td>{h.source}</td>
            <td>
              <a className="ea-link" href={h.url} target="_blank" rel="noopener noreferrer">
                {stamp(h.released)}
                <span className="ea-ext" aria-hidden="true"> ↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </td>
            <td>{pct(h.share) || "–"}</td>
            <td>
              <Margin value={h.margin} />
            </td>
            <td>{h.change == null ? <span className="ea-muted">–</span> : <Margin value={h.change} />}</td>
          </tr>
        ))}
      </DataTable>
    </Panel>
  );
}

function SourcesPanel() {
  return (
    <Panel title="Sources and method" as="h3" expandable={false}>
      <ul className="ea-src">
        {SOURCES.map((s) => (
          <li key={s.id}>
            <a className="ea-link" href={s.url} target="_blank" rel="noopener noreferrer">
              {s.name}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            , published by {s.publishers}. {s.method}
            {s.unavailable && ` ${s.unavailable}`}
          </li>
        ))}
      </ul>
      <p className="ea-note">
        B-59 shows a fixed set of headline groups from each survey’s public release, credited and linked, and not the
        full crosstabs, which belong to the survey owners. Figures are entered by hand from each release, so they can
        trail the source by a few minutes; the source’s own page is the record. Margin is the Democratic share minus the
        Republican share. Where two surveys report a group, the spread is the gap between them. Surveys are never
        averaged here: they reach voters differently and weight differently, and a mean of two would describe neither.
      </p>
    </Panel>
  );
}

/** The Exit polls tab of the 2026 polling page. Self-contained: it reads the committed release file. */
export function ExitPollsPanel() {
  const [race, setRace] = useState<RaceId>(DATA.races[0].id);
  const [dim, setDim] = useState<string>("all");
  const rows = compare(DATA.releases, race);
  const shown = dim === "all" ? rows : rows.filter((r) => r.dimension === dim || r.group === "All voters");
  const latest = latestReleases(DATA.releases, race);
  const raceLabel = DATA.races.find((r) => r.id === race)!.label;

  return (
    <>
      <Panel title="Exit polls: who voted, and how" as="h2">
        <p className="ea-note-lead">
          Who voted in Texas, and how, from the exit surveys published so far:{" "}
          {REPORTING.map((s) => s.name).join(" and ") || "none yet"}. Each figure is the source’s latest release: the
          group’s share of voters, and the Democratic and Republican shares of its vote.
          {REPORTING.length > 1 && " Where more than one source reports a group, the spread shows how far apart they are."}
        </p>
        <div className="ea-exit-controls">
          <Pills legend="Race" options={RACE_OPTIONS} value={race} onChange={setRace} />
          <Pills legend="Groups" options={DIMENSION_OPTIONS} value={dim} onChange={setDim} />
        </div>
        <h3 className="ea-exit-race">{raceLabel}</h3>
        <ul className="ea-exit-stamps">
          {SOURCES.map((s) => {
            const r = latest.find((l) => l.source === s.id);
            return (
              <li key={s.id}>
                <span className="ea-exit-src">{s.name}</span>{" "}
                {r ? (
                  <a className="ea-link" href={r.url} target="_blank" rel="noopener noreferrer">
                    released {stamp(r.released)}
                    <span className="ea-ext" aria-hidden="true"> ↗</span>
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ) : (
                  <span className="ea-muted">{s.unavailable ?? "no release yet"}</span>
                )}
              </li>
            );
          })}
        </ul>
        {rows.length ? (
          <ComparisonTable rows={shown} />
        ) : (
          <p className="ea-exit-empty">
            No exit poll figures yet. Most Texas polls close at 7 PM Central, and at 8 PM Central in El Paso and Hudspeth
            counties, which keep Mountain time. Both surveys publish their first figures after polls close, and this
            table fills in as each release is entered.
          </p>
        )}
        <Note>
          Exit surveys are estimates with margins of error, larger for smaller groups, and they are revised through the
          night. A spread of a few points between two surveys is normal and does not mean either is wrong. The Polls vs
          results tab sets these figures against the count.
        </Note>
      </Panel>
      {DATA.releases.filter((r) => r.race === race).length > latest.length && <NightPanel key={race} race={race} />}
      <SourcesPanel />
    </>
  );
}
