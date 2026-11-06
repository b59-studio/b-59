"use client";

import { useRef, useSyncExternalStore } from "react";
import { Brand } from "@/components/Brand";
import { ExitPollsPanel } from "./ExitPollsPanel";
import { PollsVsResults, type PollResults } from "./PollsVsResults";
import { PreElectionPanel } from "./PreElectionPanel";

/**
 * The polling page: one shell, one tab per kind of poll. Pre-election polls
 * and exit polls are separate panels so each can be built and updated on its
 * own; this file only owns the header and the tab row.
 */
const TABS = [
  ["pre", "Pre-election polls"],
  ["results", "Polls vs results"],
  ["exit", "Exit polls"],
] as const;
type TabId = (typeof TABS)[number][0];

const isTab = (id: string): id is TabId => TABS.some(([t]) => t === id);

function subscribeHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

export function PollsPage({ results }: { results: PollResults | null }) {
  // The tab lives in the URL hash so a link can open on exit polls. The server
  // cannot see the hash, so it renders the first tab.
  const hash = useSyncExternalStore(subscribeHash, () => window.location.hash.slice(1), () => "");
  const tab: TabId = isTab(hash) ? hash : "pre";
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

  return (
    <div className="ea" lang="en" dir="ltr">
      <header className="ea-head">
        <p className="ea-dateline">Research · Texas general election, Nov. 3, 2026</p>
        <h1 className="ea-h1">Texas 2026: the polls</h1>
        <p className="ea-byline">
          By <Brand /> · Public polls only, each linked to its source
        </p>
        <p className="ea-lede">
          What published polls said about the Texas statewide races before election day, averaged one simple way; how
          that average compares with the result; and what exit polls say about who voted.
        </p>
        <div className="ea-tabs" role="tablist" aria-label="Kind of poll">
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
      </header>

      <div id="ea-tabpanel" role="tabpanel" aria-labelledby={`ea-tab-${tab}`} className="ea-head">
        {tab === "pre" && <PreElectionPanel />}
        {tab === "results" &&
          (results ? (
            <PollsVsResults data={results} />
          ) : (
            <p className="ea-note">The state’s count could not be read just now. The page tries again shortly.</p>
          ))}
        {tab === "exit" && <ExitPollsPanel />}
      </div>
    </div>
  );
}
