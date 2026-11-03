"use client";

import { useMemo, useRef, useSyncExternalStore } from "react";
import { Brand } from "@/components/Brand";
import type { LiveSnapshot } from "@/lib/election-2026/electionlink";
import { fmt, liveByCounty, pct, timeCentral } from "@/lib/election-2026/live";
import { ballots2022, DATA, TARGETS } from "./data";
import { LivePanel } from "./LivePanel";
import { HeadlineChart } from "./HeadlineChart";
import { Stat } from "./parts";
import { MethodPanel, PrimariesPanel, RacesPanel, TicketPanel } from "./ResultsPanels";
import { TurnoutHistory, TurnoutTable } from "./TurnoutTable";

const TABS = [
  ["live", "Election day"],
  ["history", "Turnout history"],
  ["primaries", "Primaries"],
  ["ticket", "Down-ballot"],
  ["races", "All statewide races"],
  ["method", "Method and sources"],
] as const;
type TabId = (typeof TABS)[number][0];

const isTab = (id: string): id is TabId => TABS.some(([t]) => t === id);

function subscribeHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

export function ElectionAnalysis({ snapshot }: { snapshot: LiveSnapshot }) {
  const live = useMemo(() => liveByCounty(snapshot), [snapshot]);
  const order = snapshot.counties.map((c) => c.name);
  // The tab lives in the URL hash so a link can open on a drill-down. The
  // server cannot see the hash, so it renders the first tab.
  const hash = useSyncExternalStore(subscribeHash, () => window.location.hash.slice(1), () => "");
  const tab: TabId = isTab(hash) ? hash : "live";
  const tabRefs = useRef<Partial<Record<TabId, HTMLButtonElement | null>>>({});

  const choose = (id: TabId, focus = false) => {
    history.replaceState(null, "", `#${id}`);
    // replaceState does not fire hashchange, and the hash is what selects the tab.
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    if (focus) tabRefs.current[id]?.focus();
  };

  const onTabKey = (e: React.KeyboardEvent, index: number) => {
    const to = e.key === "ArrowRight" ? index + 1 : e.key === "ArrowLeft" ? index - 1 : e.key === "Home" ? 0 : e.key === "End" ? TABS.length - 1 : null;
    if (to == null) return;
    e.preventDefault();
    choose(TABS[(to + TABS.length) % TABS.length][0], true);
  };

  const openMethod = () => {
    choose("method");
    document.getElementById("ea-drill")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const statewide = DATA.ev.Statewide;
  const valley = DATA.ev.Valley;
  const travis = live.get("Travis");

  return (
    <div className="ea" lang="en" dir="ltr">
      <header className="ea-head">
        <p className="ea-dateline">Research · Texas general election, Nov. 3, 2026</p>
        <h1 className="ea-h1">Texas 2026: turnout in {TARGETS.length} counties</h1>
        <p className="ea-byline">
          By <Brand /> · Published Nov. 3, 2026 · Live figures read {timeCentral(snapshot.fetched)} CT ·{" "}
          <a className="ea-link" href="#method" onClick={(e) => (e.preventDefault(), openMethod())}>
            Method and sources
          </a>
        </p>
        <p className="ea-lede">
          Early voting closed on Oct. 30 with {fmt(statewide[3])} ballots cast statewide: {pct(statewide[3] / statewide[0])}{" "}
          of registered voters, and {pct(statewide[3] / ballots2022("Statewide"))} of everyone who voted in 2022. In the
          Rio Grande Valley the early vote has already passed the 2022 total, at {pct(valley[3] / ballots2022("Valley"))}.
          {travis &&
            ` On election day, Travis County’s tracker shows ${fmt(travis.total)} ballots, ${pct(travis.total / travis.registered)} of registered voters, as of ${timeCentral(travis.refreshed)}.`}
        </p>
        <div className="ea-stats">
          <Stat value={fmt(statewide[3])} label="Early ballots, statewide" />
          <Stat value={fmt(TARGETS.reduce((a, g) => a + DATA.ev[g][3], 0))} label={`Early ballots, the ${TARGETS.length} counties`} />
          <Stat value={pct(statewide[3] / statewide[0])} label="Early turnout, statewide" />
        </div>
      </header>

      <HeadlineChart />

      <TurnoutTable live={live} liveOrder={order} fetched={snapshot.fetched} />

      <section className="ea-head" aria-labelledby="ea-drill">
        <h2 id="ea-drill" className="ea-section-title">
          Detail
        </h2>
        <div className="ea-tabs" role="tablist" aria-label="Views">
          {TABS.map(([id, label], i) => (
            <button
              key={id}
              ref={(el) => {
                tabRefs.current[id] = el;
              }}
              id={`ea-tab-${id}`}
              type="button"
              role="tab"
              className="ea-tab"
              aria-selected={tab === id}
              aria-controls="ea-tabpanel"
              tabIndex={tab === id ? 0 : -1}
              onClick={() => choose(id)}
              onKeyDown={(e) => onTabKey(e, i)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <div id="ea-tabpanel" role="tabpanel" aria-labelledby={`ea-tab-${tab}`} className="ea-head">
        {tab === "live" && <LivePanel live={live} order={order} fetched={snapshot.fetched} />}
        {tab === "history" && <TurnoutHistory />}
        {tab === "primaries" && <PrimariesPanel />}
        {tab === "ticket" && <TicketPanel />}
        {tab === "races" && <RacesPanel />}
        {tab === "method" && <MethodPanel />}
      </div>
    </div>
  );
}
