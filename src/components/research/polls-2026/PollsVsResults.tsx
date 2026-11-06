"use client";

import { SortContext, SortTh, sortItems, useSortState } from "@/components/research/election-2026/GeoTable";
import { DataTable, Note, Panel, Stat } from "@/components/research/election-2026/parts";
import { dateTimeCentral, fmt, pct } from "@/lib/election-2026/live";
import { pollAverage } from "@/lib/polls-2026/average";
import { AS_OF, pollsFor, RACES } from "@/lib/polls-2026/data";

/** A race's statewide result, in percent of all votes, as polls report shares. */
export type RaceResult = { dem: number; rep: number; margin: number; total: number };

export type PollResults = {
  /** Poll race id to its statewide result, or null where the state has no count yet. */
  results: Record<string, RaceResult | null>;
  /** Early ballots and the final count, by geography, for the turnout projection. */
  turnout: { geo: string; early: number; ballots: number }[];
  official: boolean;
  readAt: string | null;
};

/** The win calculator's default: election day adds this share on top of the early vote. */
export const CALCULATOR_ELECTION_DAY_BUMP = 0.25;

/** "D+4.2" or "R+1.0", from a margin in points. */
const lead = (m: number) => `${m >= 0 ? "D" : "R"}+${Math.abs(m).toFixed(1)}`;
/** A miss in points: positive means the polls were too Democratic. */
const miss = (m: number) => (Math.abs(m) < 0.05 ? "On the mark" : `${Math.abs(m).toFixed(1)} pts too ${m > 0 ? "Democratic" : "Republican"}`);

type RaceRow = { id: string; name: string; avg: number; avgDem: number; avgRep: number; result: RaceResult; error: number; polls: number };
type PollRow = { key: string; race: string; pollster: string; end: string; margin: number; result: number; error: number; url: string };

export function PollsVsResults({ data }: { data: PollResults }) {
  const raceRows: RaceRow[] = RACES.flatMap((r) => {
    const avg = pollAverage(pollsFor(r.id), AS_OF);
    const result = data.results[r.id];
    if (!avg || !result) return [];
    return [{ id: r.id, name: r.name, avg: avg.margin, avgDem: avg.dem, avgRep: avg.rep, result, error: avg.margin - result.margin, polls: avg.polls.length }];
  });
  const pollRows: PollRow[] = RACES.flatMap((r) => {
    const avg = pollAverage(pollsFor(r.id), AS_OF);
    const result = data.results[r.id];
    if (!avg || !result) return [];
    return avg.polls.map(({ poll }) => {
      const m = poll.dem - poll.rep;
      return { key: `${r.id}|${poll.pollster}|${poll.end}`, race: r.name, pollster: poll.pollster, end: poll.end, margin: m, result: result.margin, error: m - result.margin, url: poll.url };
    });
  });
  const meanAbs = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + Math.abs(b), 0) / xs.length : null);
  const meanSigned = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
  const avgMiss = meanSigned(raceRows.map((r) => r.error));

  return (
    <>
      <Panel title="The polls against the result" expandable={false}>
        <p className="ea-note ea-note-lead">
          {raceRows.length
            ? `Across ${raceRows.length} races, the final poll average missed the margin by ${meanAbs(raceRows.map((r) => r.error))!.toFixed(1)} points on average, and leaned ${avgMiss! >= 0 ? "Democratic" : "Republican"} by ${Math.abs(avgMiss!).toFixed(1)} points overall.`
            : "The state has not posted results for these races yet."}
        </p>
        <p className="ea-note">
          Results are the state’s count, {data.official ? "official" : "unofficial until canvassed"}
          {data.readAt ? `, read ${dateTimeCentral(data.readAt)} CT` : ""}. The poll average is the one on the Pre-election polls tab
          as of {AS_OF}. A miss is the poll margin minus the result margin, in points: positive means the polls were too
          Democratic. The generic ballot is set against every U.S. House race added together.
        </p>
        <div className="ea-stats">
          {meanAbs(raceRows.map((r) => r.error)) != null && <Stat value={`${meanAbs(raceRows.map((r) => r.error))!.toFixed(1)} pts`} label="Average miss on the margin, by race" />}
          {meanAbs(pollRows.map((r) => r.error)) != null && <Stat value={`${meanAbs(pollRows.map((r) => r.error))!.toFixed(1)} pts`} label="Average miss, poll by poll" />}
        </div>
      </Panel>
      <RaceTable rows={raceRows} />
      <PollTable rows={pollRows} />
      <TurnoutProjection turnout={data.turnout} />
      <Panel title="Exit polls against the result" expandable={false}>
        <p className="ea-note">
          Exit polls describe who voted rather than forecasting the count, and no exit-poll figures have been entered on
          the Exit polls tab yet, so there is nothing to compare. When they are, their topline share for each race can be
          set against the result here.
        </p>
      </Panel>
    </>
  );
}

function RaceTable({ rows }: { rows: RaceRow[] }) {
  const sort = useSortState();
  const value = (r: RaceRow) =>
    sort.by === "name" ? r.name : sort.by === "avg" ? r.avg : sort.by === "result" ? r.result.margin : sort.by === "error" ? Math.abs(r.error) : null;
  return (
    <Panel title="Each race: final average against the result">
      <SortContext.Provider value={sort}>
        <DataTable
          head={
            <tr>
              <SortTh by="name">Race</SortTh>
              <SortTh by="avg" className="ea-sep">
                Poll average
              </SortTh>
              <SortTh by="result">Result</SortTh>
              <SortTh by="error" className="ea-sep">
                Miss
              </SortTh>
            </tr>
          }
        >
          {sortItems(rows, sort.by ? value : null, sort.dir).map((r) => (
            <tr key={r.id}>
              <td>{r.name}</td>
              <td className="ea-sep">
                {lead(r.avg)}
                <span className="ea-cnt">
                  {r.avgDem.toFixed(1)} D · {r.avgRep.toFixed(1)} R · {r.polls} polls
                </span>
              </td>
              <td>
                {lead(r.result.margin)}
                <span className="ea-cnt">
                  {r.result.dem.toFixed(1)} D · {r.result.rep.toFixed(1)} R
                </span>
              </td>
              <td className="ea-sep">{miss(r.error)}</td>
            </tr>
          ))}
        </DataTable>
      </SortContext.Provider>
    </Panel>
  );
}

function PollTable({ rows }: { rows: PollRow[] }) {
  const sort = useSortState();
  const value = (r: PollRow) =>
    sort.by === "name" ? r.race : sort.by === "pollster" ? r.pollster : sort.by === "end" ? r.end : sort.by === "error" ? Math.abs(r.error) : sort.by === "margin" ? r.margin : null;
  return (
    <Panel title="Each poll in the final average against the result">
      <SortContext.Provider value={sort}>
        <DataTable
          head={
            <tr>
              <SortTh by="name">Race</SortTh>
              <SortTh by="pollster">Pollster</SortTh>
              <SortTh by="end">Field ended</SortTh>
              <SortTh by="margin" className="ea-sep">
                Poll
              </SortTh>
              <th>Result</th>
              <SortTh by="error" className="ea-sep">
                Miss
              </SortTh>
            </tr>
          }
        >
          {sortItems(rows, sort.by ? value : null, sort.dir).map((r) => (
            <tr key={r.key}>
              <td>{r.race}</td>
              <td>
                <a className="ea-link" href={r.url} target="_blank" rel="noopener noreferrer">
                  {r.pollster}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </td>
              <td>{r.end}</td>
              <td className="ea-sep">{lead(r.margin)}</td>
              <td>{lead(r.result)}</td>
              <td className="ea-sep">{miss(r.error)}</td>
            </tr>
          ))}
        </DataTable>
      </SortContext.Provider>
    </Panel>
  );
}

function TurnoutProjection({ turnout }: { turnout: PollResults["turnout"] }) {
  const sort = useSortState();
  const rows = turnout.map((t) => ({ ...t, added: t.early ? t.ballots / t.early - 1 : null }));
  const value = (r: (typeof rows)[number]) =>
    sort.by === "name" ? r.geo : sort.by === "early" ? r.early : sort.by === "ballots" ? r.ballots : sort.by === "added" ? r.added : null;
  return (
    <Panel title="Turnout: the projection against the count">
      <Note>
        The studio’s win calculator projects each county’s turnout as its early vote plus {pct(CALCULATOR_ELECTION_DAY_BUMP)}{" "}
        for election day. This sets that assumption against what election day and late mail actually added. The early vote
        is final; the count is unofficial.
      </Note>
      <SortContext.Provider value={sort}>
        <DataTable
          head={
            <tr>
              <SortTh by="name">Place</SortTh>
              <SortTh by="early" className="ea-sep">
                Early ballots
              </SortTh>
              <SortTh by="ballots">All ballots</SortTh>
              <SortTh by="added" className="ea-sep">
                Election day added
              </SortTh>
              <th>vs the {pct(CALCULATOR_ELECTION_DAY_BUMP)} assumption</th>
            </tr>
          }
        >
          {sortItems(rows, sort.by ? value : null, sort.dir).map((r) => (
            <tr key={r.geo} className={r.geo === "Statewide" ? "ea-bench" : undefined}>
              <td>{r.geo}</td>
              <td className="ea-sep">{fmt(r.early)}</td>
              <td>{fmt(r.ballots)}</td>
              <td className="ea-sep">{pct(r.added)}</td>
              <td>
                {r.added == null
                  ? ""
                  : `${r.added >= CALCULATOR_ELECTION_DAY_BUMP ? "+" : "−"}${(Math.abs(r.added - CALCULATOR_ELECTION_DAY_BUMP) * 100).toFixed(1)} pts`}
              </td>
            </tr>
          ))}
        </DataTable>
      </SortContext.Provider>
    </Panel>
  );
}
