"use client";

import { useMemo, useRef, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { Brand } from "@/components/Brand";
import type { LiveSnapshot } from "@/lib/election-2026/electionlink";
import { dateTimeCentral, fmt, liveByCounty, pct } from "@/lib/election-2026/live";
import type { Final2026 } from "@/lib/results-2026/final";
import { ballots2022, DATA, FOCUS } from "./data";
import { LivePanel } from "./LivePanel";
import { LiveCountiesContext } from "./GeoTable";
import { HeadlineChart } from "./HeadlineChart";
import { Stat } from "./parts";
import { MethodPanel, PrimariesPanel, RacesPanel, TicketPanel } from "./ResultsPanels";
import { TurnoutHistory, TurnoutTable } from "./TurnoutTable";
import { FinalContext, turnout2026, YearOverYearPanel } from "./YearOverYear";

// The map shapes and Census tables are the page's heaviest data, so they load
// only when someone opens the tab.
const DemographicsPanel = dynamic(() => import("./DemographicsPanel"), {
  loading: () => <p className="ea-note">Loading demographics…</p>,
});

const TABS = [
  ["past", "2026 vs past years"],
  ["live", "Election day"],
  ["history", "Turnout history"],
  ["demographics", "Demographics"],
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

export function ElectionAnalysis({ snapshot, final }: { snapshot: LiveSnapshot; final: Final2026 | null }) {
  const live = useMemo(() => liveByCounty(snapshot), [snapshot]);
  const liveCounties = useMemo(() => new Set(live.keys()), [live]);
  const order = snapshot.counties.map((c) => c.name);
  // The tab lives in the URL hash so a link can open on a drill-down. The
  // server cannot see the hash, so it renders the first tab.
  const hash = useSyncExternalStore(subscribeHash, () => window.location.hash.slice(1), () => "");
  const tab: TabId = isTab(hash) ? hash : "past";
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
  const sw2026 = final?.geos.Statewide;
  const rate2026 = final ? turnout2026(final, "Statewide") : null;
  const rate = (year: string) => DATA.gen.Statewide[year][1] / DATA.gen.Statewide[year][0];

  return (
    <FinalContext.Provider value={final}>
    <LiveCountiesContext.Provider value={liveCounties}>
    <div className="ea" lang="en" dir="ltr">
      <header className="ea-head">
        <p className="ea-dateline">Research · Texas general election, Nov. 3, 2026</p>
        <h1 className="ea-h1">Texas 2026: county turnout</h1>
        <p className="ea-byline">
          By <Brand /> · Published Nov. 3, 2026 · Updated with each county’s count
          {final?.readAt ? `, read ${dateTimeCentral(final.readAt)} CT` : ""} ·{" "}
          <a className="ea-link" href="#method" onClick={(e) => (e.preventDefault(), openMethod())}>
            Method and sources
          </a>
        </p>
        {sw2026 ? (
          <p className="ea-lede">
            With every county’s count in, {fmt(sw2026.ballots)} Texans voted: {pct(rate2026)} of registered voters, against{" "}
            {pct(rate("2022"))} in the 2022 midterm, {pct(rate("2018"))} in 2018 and {pct(rate("2024"))} in the 2024
            presidential election. Early voting, which closed on Oct. 30, cast {pct(statewide[3] / sw2026.ballots)} of
            those ballots. In the Rio Grande Valley the early vote alone passed the 2022 total, at{" "}
            {pct(valley[3] / ballots2022("Valley"))}.
          </p>
        ) : (
          <p className="ea-lede">
            Early voting closed on Oct. 30 with {fmt(statewide[3])} ballots cast statewide:{" "}
            {pct(statewide[3] / statewide[0])} of registered voters, and {pct(statewide[3] / ballots2022("Statewide"))} of
            everyone who voted in 2022.
          </p>
        )}
        <p className="ea-note ea-note-lead">
          {final?.official
            ? "The 2026 results are official: the state has canvassed them."
            : "What is final: the early vote (closed Oct. 30) and every past year. What is not yet: the 2026 results and turnout are each county’s complete election-night count, unofficial until counties canvass and the state certifies them."}
        </p>
        <div className="ea-stats">
          {sw2026 && <Stat value={fmt(sw2026.ballots)} label="Ballots cast, statewide (unofficial)" />}
          {rate2026 != null && <Stat value={pct(rate2026)} label="Turnout, statewide (unofficial)" />}
          <Stat value={fmt(statewide[3])} label="Early ballots, statewide (final)" />
          <Stat value={fmt(FOCUS.reduce((a, g) => a + DATA.ev[g][3], 0))} label={`Early ballots, the ${FOCUS.length} focus counties`} />
        </div>
      </header>

      <HeadlineChart />

      <TurnoutTable live={live} fetched={snapshot.fetched} />

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
        {tab === "past" && <YearOverYearPanel />}
        {tab === "live" && <LivePanel live={live} order={order} fetched={snapshot.fetched} />}
        {tab === "history" && <TurnoutHistory />}
        {tab === "demographics" && <DemographicsPanel />}
        {tab === "primaries" && <PrimariesPanel />}
        {tab === "ticket" && <TicketPanel />}
        {tab === "races" && <RacesPanel />}
        {tab === "method" && <MethodPanel />}
      </div>
    </div>
    </LiveCountiesContext.Provider>
    </FinalContext.Provider>
  );
}
