import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "@jest/globals";
import { parseHourly, parseSummary, stateEarlyVote, TRACKERS, type TrackerReading } from "./electionlink";
import { hourCentral, liveFigures, margin, pct, points, versus2024, wholeElectionByHour } from "./live";

const fixture = (name: string) => fs.readFileSync(path.join(__dirname, "__fixtures__", name), "utf8");

describe("parseSummary", () => {
  it("reads ballots cast and the refresh time from the Travis widget", () => {
    expect(parseSummary(fixture("travis_BallotTypeTurnout.html"))).toEqual({
      ballots: 475853,
      refreshed: "2026-11-03T18:37:57Z",
    });
  });

  it("reads the Hays widget, which reports no eligible voters", () => {
    expect(parseSummary(fixture("hays_BallotTypeTurnout.html"))).toEqual({
      ballots: 114023,
      refreshed: "2026-11-04T00:55:33Z",
    });
  });

  it("returns nulls for a page without the figures", () => {
    expect(parseSummary("<html><body>Not published yet</body></html>")).toEqual({ ballots: null, refreshed: null });
  });
});

describe("parseHourly", () => {
  const csv = fixture("travis_CheckinsPerHourTable.csv");

  it("sums every block for the day, by hour", () => {
    const rows = parseHourly(csv, "2026-11-03");
    expect(rows[0][0]).toBe(7);
    // The fixture carries 11/03 twice; 7 AM is 50 + 9,719.
    expect(rows[0][1]).toBe(50 + 9719);
    expect(rows.map(([h]) => h)).toEqual([...rows.map(([h]) => h)].sort((a, b) => a - b));
  });

  it("reads hour labels with and without minutes, and the 7 PM close row", () => {
    const rows = parseHourly("﻿11/05/2024\nTime, Number of Check-ins\n7 AM - 8 AM,10\n12:00 PM - 1:00 PM,5\n7:00 PM - CLOSE,3\nTotal,18\n", "2024-11-05");
    expect(rows).toEqual([[7, 10], [12, 5], [19, 3]]);
  });

  it("reads the Hays table, whose 7 PM close row is zero", () => {
    const rows = parseHourly(fixture("hays_CheckinsPerHourTable.csv"), "2026-11-03");
    expect(rows).toHaveLength(13);
    expect(rows[0]).toEqual([7, 1762]);
    expect(rows.reduce((a, [, v]) => a + v, 0)).toBe(20056);
  });

  it("returns nothing for a day the file does not hold", () => {
    expect(parseHourly(csv, "2024-11-05")).toEqual([]);
  });
});

describe("stateEarlyVote", () => {
  it("reads a county's final early vote from the state file", () => {
    expect(stateEarlyVote("Travis")).toEqual({ registered: 945505, evInPerson: 427686, mail: 16221 });
  });

  it("has a figure for every tracker county", () => {
    for (const { name } of TRACKERS) expect(stateEarlyVote(name)).not.toBeNull();
  });

  it("returns null for a name the file does not hold", () => {
    expect(stateEarlyVote("Nowhere")).toBeNull();
  });
});

describe("liveFigures", () => {
  const reading: TrackerReading = {
    name: "Travis",
    ballots: 500000,
    refreshed: "2026-11-03T21:30:00Z", // 3:30 PM Central
    today: [[7, 100], [14, 200], [15, 50]],
    prior: [[7, 120], [14, 180], [15, 300]],
    sos: { registered: 945505, evInPerson: 427686, mail: 16221 },
    url: "https://example.test/",
  };

  it("adds the state's mail count to the tracker's in-person check-ins", () => {
    expect(liveFigures(reading)?.total).toBe(516221);
  });

  it("compares election day with 2024 through the last complete hour only", () => {
    const live = liveFigures(reading);
    expect(live?.doneHour).toBe(15);
    expect(live?.edThrough).toBe(300);
    expect(live?.priorThrough).toBe(300);
  });

  it("has no 2024 comparison when the 2024 tracker was wiped", () => {
    expect(liveFigures({ ...reading, prior: [] })?.priorThrough).toBeNull();
  });

  it("drops a county whose summary could not be read", () => {
    expect(liveFigures({ ...reading, ballots: null })).toBeNull();
  });
});

describe("2026 against the whole 2024 election", () => {
  const reading: TrackerReading = {
    name: "Test",
    ballots: 1350, // 1,000 early in person + 350 on election day
    refreshed: "2026-11-03T21:30:00Z", // 3:30 PM Central
    today: [[7, 100], [14, 200], [15, 50]],
    prior: [[7, 120], [14, 180], [15, 300]],
    sos: { registered: 5000, evInPerson: 1000, mail: 50 },
    url: "https://example.test/",
  };
  const L = liveFigures(reading)!;

  it("counts everything cast before election day", () => {
    expect(L.beforeElectionDay).toBe(1050);
  });

  it("compares through the last complete hour, early vote included", () => {
    // 2024: 2,000 ballots, 600 of them on election day, so 1,400 before it.
    expect(versus2024(L, 2000)).toEqual({ now: 1050 + 300, then: 1400 + 300, ofTotal: 1400 / 2000 });
  });

  it("has no same-hour 2024 figure without a 2024 hourly table", () => {
    const noPrior = liveFigures({ ...reading, prior: [] })!;
    expect(versus2024(noPrior, 2000).then).toBeNull();
    expect(wholeElectionByHour(noPrior, 2000, [7])[0].then).toBeNull();
  });

  it("runs each year's whole-election total by hour, ending 2024 on its final total", () => {
    const rows = wholeElectionByHour(L, 2000, [7, 14, 19]);
    expect(rows[0]).toEqual({ hour: 7, now: 1150, then: 1520 });
    expect(rows[1]).toEqual({ hour: 14, now: 1350, then: 1700 });
    expect(rows[2].then).toBe(2000);
  });
});

describe("formatting", () => {
  it("reads hours in Central time across the UTC date line", () => {
    expect(hourCentral("2026-11-04T01:15:00Z")).toBe(19);
  });

  it("formats shares, margins and gaps", () => {
    expect(pct(0.4567)).toBe("45.7%");
    expect(pct(null)).toBe("");
    expect(margin(-0.123)).toBe("R+12.3");
    expect(points(0.05)).toBe("+5.0");
    expect(points(-0.05)).toBe("−5.0");
  });
});
