"use client";

import { Panel } from "../election-2026/parts";

/** Placeholder until the exit-poll aggregator lands; that work replaces this file. */
export function ExitPollsPanel() {
  return (
    <Panel title="Exit polls" expandable={false}>
      <p className="ea-note ea-note-lead">
        Exit polls for the Texas races will appear here once they are published after the polls close.
      </p>
    </Panel>
  );
}
