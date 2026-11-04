"use client";

import { useEffect, useId, useState, useSyncExternalStore } from "react";
import { SortContext, SortTh, sortItems, useSortState } from "@/components/research/election-2026/GeoTable";
import { DataTable, FilterPick, Note, Panel, Stat } from "@/components/research/election-2026/parts";
import { fmt, pct, timeCentral } from "@/lib/election-2026/live";
import type { Column, CountyStatus, RaceDetail, RaceRow, RaceSummary } from "@/lib/results-2026/present";
import type { PrecinctDetail } from "@/lib/results-2026/types";

type Payload = { readAt: string; race: RaceDetail | null; counties: CountyStatus[] };

const REFRESH_MS = 120_000;

/** A party's colour where it carries one; everyone else is neutral. */
const partyFill = (party: string) =>
  party === "DEM" ? "var(--ea-dem)" : party === "REP" ? "var(--ea-rep)" : "color-mix(in srgb, var(--ea-fg) 45%, var(--ea-panel))";

/** A source's own update stamp: Harris gives ISO time, Clarity a local string. */
const stamp = (s: string | null) => (!s ? "—" : /^\d{4}-\d\d-\d\dT/.test(s) ? `${timeCentral(s)} CT` : s.replace(/^\d+\/\d+\/\d{4}\s+/, ""));

const keyFromHash = () => {
  const m = window.location.hash.match(/^#race=(.+)$/);
  return m ? decodeURIComponent(m[1]) : null;
};

function subscribeHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

/**
 * Live race-by-race results: pick a race, see the statewide sum, each followed
 * county from its own system, and precinct detail by vote type where a county
 * publishes it. Refreshes itself every two minutes.
 */
export function ResultsView({ index, initial }: { index: RaceSummary[]; initial: Payload }) {
  const [data, setData] = useState<Payload>(initial);
  const [failed, setFailed] = useState(false);
  const [precincts, setPrecincts] = useState<{ key: string; county: string } | null>(null);

  // The race lives in the URL hash (#race=<key>) so a link can open on one.
  // The server cannot see the hash, so it renders the default race.
  const hashKey = useSyncExternalStore(subscribeHash, keyFromHash, () => null);
  const key = hashKey && index.some((r) => r.key === hashKey) ? hashKey : (initial.race?.key ?? null);

  const shownKey = data.race?.key;

  // Fetch a newly chosen race, then refresh it every two minutes. State is set
  // only when a response arrives, never during the effect itself.
  useEffect(() => {
    if (!key) return;
    let live = true;
    const load = () =>
      fetch(`/api/results-2026/race?key=${encodeURIComponent(key)}`)
        .then((res) => (res.ok ? (res.json() as Promise<Payload>) : Promise.reject(new Error(String(res.status)))))
        .then((payload) => {
          if (!live) return;
          setData(payload);
          setFailed(false);
        })
        .catch(() => live && setFailed(true));
    if (key !== shownKey) void load();
    const timer = window.setInterval(() => void load(), REFRESH_MS);
    return () => {
      live = false;
      window.clearInterval(timer);
    };
    // shownKey is read only to skip a fetch the server already made; following it would restart the timer on every update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const choose = (next: string) => {
    history.replaceState(null, "", `#race=${encodeURIComponent(next)}`);
    // replaceState does not fire hashchange, and the hash is what selects the race.
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  };

  const race = data.race && data.race.key === key ? data.race : null;
  const loading = Boolean(key) && !race && !failed;
  const precinctCounty = precincts && precincts.key === key ? precincts.county : null;
  const setPrecinctCounty = (county: string | null) => setPrecincts(county && key ? { key, county } : null);
  const summary = index.find((r) => r.key === key);
  const reported = data.counties.filter((c) => c.ballots);

  return (
    <div className="ea" lang="en" dir="ltr">
      <header className="ea-head">
        <p className="ea-dateline">Research · Texas general election, Nov. 3, 2026</p>
        <h1 className="ea-h1">Texas 2026: live results</h1>
        <p className="ea-byline">
          Unofficial · read from each county’s results system and the Texas Secretary of State every two minutes · last
          read {timeCentral(data.readAt)} CT{loading ? " · updating…" : ""}
        </p>
        {failed && (
          <p role="alert" className="ea-note ea-error">
            The latest update could not be loaded. The figures below are from {timeCentral(data.readAt)} CT; the page
            tries again in two minutes.
          </p>
        )}
        <div className="ea-stats">
          <Stat value={String(index.length)} label="Races on the ballot in the 19 counties" />
          <Stat value={`${reported.length} of ${data.counties.length}`} label="Followed counties reporting votes" />
        </div>
      </header>

      <Panel title="Choose a race" expandable={false}>
        <div className="ea-results-pick">
          <FilterPick
            label="Race"
            options={index.map((r) => ({ value: r.key, label: r.name, group: r.group }))}
            value={key ?? ""}
            onChange={choose}
          />
          {key && (
            <a className="ea-btn" href={`/api/results-2026/csv?key=${encodeURIComponent(key)}`} download>
              Download this race as CSV
            </a>
          )}
        </div>
        {summary && (
          <p className="ea-note">
            On the ballot in {summary.counties.length} of the 19 followed counties: {summary.counties.join(", ")}.
          </p>
        )}
      </Panel>

      {race ? (
        <>
          {race.statewide && <Statewide race={race} />}
          <CountyTable race={race} onPrecincts={setPrecinctCounty} open={precinctCounty} />
          {precinctCounty && <PrecinctPanel key={`${race.key}|${precinctCounty}`} race={race} county={precinctCounty} readAt={data.readAt} />}
        </>
      ) : (
        <p className="ea-note">{loading ? "Loading the race…" : "Choose a race to see its results."}</p>
      )}

      <SourcesPanel counties={data.counties} />
    </div>
  );
}

function Statewide({ race }: { race: RaceDetail }) {
  const sw = race.statewide!;
  const all = [...race.columns.map((c, i) => ({ ...c, votes: sw.votes[i] })), ...(sw.other ? [{ name: "Other and write-ins", party: "", votes: sw.other }] : [])];
  const max = Math.max(1, ...all.map((c) => c.votes));
  return (
    <Panel title={race.name} expandable={false}>
      <p className="ea-note">
        Statewide, {fmt(sw.total)} votes counted so far across {sw.counties} counties: {sw.fromCounties} followed counties
        from their own results systems, which run ahead of the state’s, and every other county from the Texas Secretary
        of State (read {sw.readAt ? `${timeCentral(sw.readAt)} CT` : "—"}).
      </p>
      <ul className="ea-cands">
        {all.map((c) => (
          <li key={`${c.name}|${c.party}`}>
            <span className="ea-cand-name">
              {c.name}
              {c.party && <span className="ea-cand-party"> {c.party}</span>}
            </span>
            <span className="ea-cand-bar" style={{ width: `${(c.votes / max) * 100}%`, background: partyFill(c.party) }} />
            <span className="ea-cand-val">
              <strong>{pct(sw.total ? c.votes / sw.total : null)}</strong> {fmt(c.votes)}
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function CountyTable({ race, onPrecincts, open }: { race: RaceDetail; onPrecincts: (c: string | null) => void; open: string | null }) {
  const sort = useSortState();
  const value = (r: RaceRow): number | string | null => {
    if (!sort.by) return null;
    if (sort.by === "name") return r.county;
    if (sort.by === "total") return r.total;
    if (sort.by === "other") return r.total ? r.other / r.total : null;
    const i = Number(sort.by.slice(1));
    return r.total ? r.votes[i] / r.total : null;
  };
  const rows = sortItems(race.rows, sort.by ? value : null, sort.dir);
  const cells = (votes: number[], other: number, total: number) => (
    <>
      {votes.map((v, i) => (
        <td key={i} className={i === 0 ? "ea-sep" : undefined}>
          {total ? pct(v / total) : "—"}
          <span className="ea-cnt">{fmt(v)}</span>
        </td>
      ))}
      <td>
        {total ? pct(other / total) : "—"}
        <span className="ea-cnt">{fmt(other)}</span>
      </td>
      <td className="ea-sep">
        <strong>{fmt(total)}</strong>
      </td>
    </>
  );
  return (
    <Panel title="By county">
      <Note>
        Each followed county from its own results system where it has one (Clarity or HarrisVotes); counties that post
        only PDFs come from the Texas Secretary of State. Shares are of all votes in the race. Counties whose system
        publishes precincts have a Precincts button. Sort by any column.
      </Note>
      <SortContext.Provider value={sort}>
        {sort.by && (
          <button type="button" className="ea-btn ea-sort-reset" onClick={sort.reset}>
            Back to the default order
          </button>
        )}
        <DataTable
          head={
            <>
              <tr>
                <SortTh by="name">County</SortTh>
                {race.columns.map((c: Column, i) => (
                  <SortTh key={i} by={`c${i}`} className={i === 0 ? "ea-sep" : undefined}>
                    {c.name}
                    {c.party && <span className="ea-src-tag">{c.party}</span>}
                  </SortTh>
                ))}
                <SortTh by="other">Other</SortTh>
                <SortTh by="total" className="ea-sep">
                  Total votes
                </SortTh>
                <th className="ea-sep">Source · as of</th>
                <th>
                  <span className="sr-only">Precincts</span>
                </th>
              </tr>
              {race.statewide && (
                <tr className="ea-pinned">
                  <td>Statewide</td>
                  {cells(race.statewide.votes, race.statewide.other, race.statewide.total)}
                  <td className="ea-sep ea-muted">Best available, {race.statewide.counties} counties</td>
                  <td />
                </tr>
              )}
            </>
          }
        >
          {rows.map((r) => (
            <tr key={r.county} className={r.county === "Travis" ? "ea-bench" : undefined}>
              <td>{r.county}</td>
              {cells(r.votes, r.other, r.total)}
              <td className="ea-sep ea-results-src">
                <a className="ea-link" href={r.resultsUrl} target="_blank" rel="noopener noreferrer">
                  {r.system}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
                <span className="ea-cnt">{r.updated ? stamp(r.updated) : `read ${timeCentral(r.readAt)} CT`}</span>
              </td>
              <td>
                {r.hasPrecincts && (
                  <button
                    type="button"
                    className="ea-btn"
                    aria-expanded={open === r.county}
                    onClick={() => onPrecincts(open === r.county ? null : r.county)}
                  >
                    {open === r.county ? "Hide precincts" : "Precincts"}
                  </button>
                )}
              </td>
            </tr>
          ))}
          {race.rest && (
            <tr className="ea-group-start">
              <td>Rest of Texas</td>
              {cells(race.rest.votes, race.rest.other, race.rest.total)}
              <td className="ea-sep ea-muted">Texas SOS, {race.rest.counties} counties</td>
              <td />
            </tr>
          )}
        </DataTable>
      </SortContext.Provider>
    </Panel>
  );
}

function PrecinctPanel({ race, county, readAt }: { race: RaceDetail; county: string; readAt: string }) {
  const [detail, setDetail] = useState<PrecinctDetail | null>(null);
  const [error, setError] = useState(false);
  const [type, setType] = useState<number | null>(null);
  const name = useId();
  const sort = useSortState();

  useEffect(() => {
    let live = true;
    fetch(`/api/results-2026/precincts?county=${encodeURIComponent(county)}&key=${encodeURIComponent(race.key)}`)
      .then((res) => (res.ok ? (res.json() as Promise<PrecinctDetail>) : Promise.reject(new Error(String(res.status)))))
      .then((d) => live && setDetail(d))
      .catch(() => live && setError(true));
    return () => {
      live = false;
    };
  }, [county, race.key, readAt]);

  const rowVotes = (votes: number[][]) =>
    type == null ? votes[0].map((_, ci) => votes.reduce((a, byType) => a + (byType[ci] ?? 0), 0)) : votes[type];
  const rows = detail
    ? sortItems(
        detail.rows.map((r) => ({ precinct: r.precinct, votes: rowVotes(r.votes) })),
        sort.by
          ? (r: { precinct: string; votes: number[] }) => {
              const total = r.votes.reduce((a, b) => a + b, 0);
              if (sort.by === "name") return r.precinct;
              if (sort.by === "total") return total;
              return total ? r.votes[Number(sort.by!.slice(1))] / total : null;
            }
          : null,
        sort.dir,
      )
    : [];

  return (
    <Panel title={`${county} precincts: ${race.name}`}>
      {error ? (
        <p className="ea-note">This county’s precinct detail could not be loaded. It tries again on the next update.</p>
      ) : !detail ? (
        <p className="ea-note">Loading precincts…</p>
      ) : (
        <>
          <fieldset className="ea-seg">
            <legend className="ea-field-label">Votes</legend>
            {[null, ...detail.types.map((_, i) => i)].map((t) => (
              <label key={String(t)} className="ea-seg-option">
                <input type="radio" className="sr-only" name={name} checked={type === t} onChange={() => setType(t)} />
                <span>{t == null ? "All vote types" : detail.types[t]}</span>
              </label>
            ))}
          </fieldset>
          <Note>
            {fmt(detail.rows.length)} precincts with votes so far, from {county}’s own results system. Precincts with no
            votes yet are left out. The CSV download includes every precinct row by vote type.
          </Note>
          <SortContext.Provider value={sort}>
            <DataTable
              head={
                <tr>
                  <SortTh by="name">Precinct</SortTh>
                  {detail.choices.map((c, i) => (
                    <SortTh key={i} by={`c${i}`} className={i === 0 ? "ea-sep" : undefined}>
                      {c.name}
                      {c.party && <span className="ea-src-tag">{c.party}</span>}
                    </SortTh>
                  ))}
                  <SortTh by="total" className="ea-sep">
                    Total
                  </SortTh>
                </tr>
              }
            >
              {rows.map((r) => {
                const total = r.votes.reduce((a, b) => a + b, 0);
                return (
                  <tr key={r.precinct}>
                    <td>{r.precinct}</td>
                    {r.votes.map((v, i) => (
                      <td key={i} className={i === 0 ? "ea-sep" : undefined}>
                        {total ? pct(v / total) : "—"}
                        <span className="ea-cnt">{fmt(v)}</span>
                      </td>
                    ))}
                    <td className="ea-sep">
                      <strong>{fmt(total)}</strong>
                    </td>
                  </tr>
                );
              })}
            </DataTable>
          </SortContext.Provider>
        </>
      )}
    </Panel>
  );
}

function SourcesPanel({ counties }: { counties: CountyStatus[] }) {
  return (
    <Panel title="Sources and reporting">
      <Note>
        Each county’s results system, what it last published and when this site read it. Clarity and HarrisVotes
        publish every race precinct by precinct; the other counties post PDFs, so their county totals come from the Texas
        Secretary of State, and the link goes to the county’s own results page. All results are unofficial until
        canvassed.
      </Note>
      <DataTable
        head={
          <tr>
            <th>County</th>
            <th>System</th>
            <th>Its last update</th>
            <th>Ballots counted</th>
            <th>Reporting</th>
            <th>Read here (CT)</th>
            <th>Results page</th>
          </tr>
        }
      >
        {counties.map((c) => (
          <tr key={c.county}>
            <td>{c.county}</td>
            <td>{c.system}</td>
            <td>{stamp(c.updated)}</td>
            <td>{c.ballots ? fmt(c.ballots) : "—"}</td>
            <td>{c.reporting ?? "—"}</td>
            <td>
              {timeCentral(c.readAt)}
              {c.error && <span className="ea-cnt ea-error">Last read failed; showing the previous reading</span>}
            </td>
            <td>
              <a className="ea-link" href={c.resultsUrl} target="_blank" rel="noopener noreferrer">
                Open
                <span className="sr-only"> {c.county} results (opens in a new tab)</span>
              </a>
            </td>
          </tr>
        ))}
      </DataTable>
    </Panel>
  );
}
