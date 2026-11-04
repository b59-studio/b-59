import { describe, expect, it } from "@jest/globals";
import {
  addDays,
  daysBetween,
  HALF_LIFE_DAYS,
  latestByPollster,
  type Poll,
  pollAverage,
  pollWeight,
  SAMPLE_CAP,
  trend,
  WINDOW_DAYS,
} from "./average";
import { AS_OF, POLLS, RACES } from "./data";

const poll = (over: Partial<Poll>): Poll => ({
  race: "us-senate",
  pollster: "A",
  sponsor: null,
  start: "2026-10-20",
  end: "2026-10-22",
  n: 900,
  population: "LV",
  dem: 45,
  rep: 50,
  other: null,
  partisan: null,
  url: "https://example.org",
  ...over,
});

describe("dates", () => {
  it("counts whole days across a month end", () => {
    expect(daysBetween("2026-10-30", "2026-11-03")).toBe(4);
    expect(addDays("2026-10-30", 4)).toBe("2026-11-03");
  });
});

describe("pollWeight", () => {
  it("is the square root of the sample on the day fieldwork ends", () => {
    expect(pollWeight(poll({ n: 900 }), "2026-10-22")).toBeCloseTo(30);
  });

  it("halves every half-life", () => {
    const fresh = pollWeight(poll({}), "2026-10-22");
    expect(pollWeight(poll({}), addDays("2026-10-22", HALF_LIFE_DAYS))).toBeCloseTo(fresh / 2);
    expect(pollWeight(poll({}), addDays("2026-10-22", 2 * HALF_LIFE_DAYS))).toBeCloseTo(fresh / 4);
  });

  it("caps the sample size", () => {
    expect(pollWeight(poll({ n: 50_000 }), "2026-10-22")).toBeCloseTo(Math.sqrt(SAMPLE_CAP));
  });
});

describe("latestByPollster", () => {
  it("keeps one poll per pollster, the latest", () => {
    const old = poll({ end: "2026-10-01" });
    const recent = poll({ end: "2026-10-20" });
    expect(latestByPollster([old, recent], "2026-11-03")).toEqual([recent]);
  });

  it("breaks a tie on end date by the larger sample", () => {
    const small = poll({ n: 500 });
    const big = poll({ n: 1500 });
    expect(latestByPollster([big, small], "2026-11-03")).toEqual([big]);
  });

  it("drops polls outside the window, after the date, of adults or partisan", () => {
    const asOf = "2026-11-03";
    const polls = [
      poll({ pollster: "Stale", end: addDays(asOf, -WINDOW_DAYS - 1) }),
      poll({ pollster: "Edge", end: addDays(asOf, -WINDOW_DAYS) }),
      poll({ pollster: "Future", end: addDays(asOf, 1) }),
      poll({ pollster: "Adults", population: "A" }),
      poll({ pollster: "Campaign", partisan: "R" }),
      poll({ pollster: "Registered", population: "RV" }),
    ];
    expect(latestByPollster(polls, asOf).map((p) => p.pollster).sort()).toEqual(["Edge", "Registered"]);
  });
});

describe("pollAverage", () => {
  it("is null with nothing to average", () => {
    expect(pollAverage([], "2026-11-03")).toBeNull();
    expect(pollAverage([poll({ partisan: "D" })], "2026-11-03")).toBeNull();
  });

  it("returns a single poll unchanged", () => {
    const avg = pollAverage([poll({ dem: 44, rep: 48 })], "2026-11-03")!;
    expect(avg.dem).toBeCloseTo(44);
    expect(avg.rep).toBeCloseTo(48);
    expect(avg.margin).toBeCloseTo(-4);
    expect(avg.polls[0].weight).toBeCloseTo(1);
  });

  it("weights equal-age polls by the square root of their samples", () => {
    // √400 = 20 and √1600 = 40, so the larger poll carries two thirds.
    const avg = pollAverage(
      [poll({ pollster: "Small", n: 400, dem: 40, rep: 50 }), poll({ pollster: "Large", n: 1600, dem: 46, rep: 50 })],
      "2026-10-22",
    )!;
    expect(avg.dem).toBeCloseTo(40 / 3 + (46 * 2) / 3);
    expect(avg.margin).toBeCloseTo(44 - 50);
    expect(avg.polls.map((w) => w.poll.pollster)).toEqual(["Large", "Small"]);
    expect(avg.polls.reduce((a, w) => a + w.weight, 0)).toBeCloseTo(1);
  });

  it("weights equal-size polls by recency", () => {
    // One half-life apart: the newer poll carries two thirds.
    const asOf = "2026-11-01";
    const avg = pollAverage(
      [
        poll({ pollster: "Old", end: addDays(asOf, -HALF_LIFE_DAYS), dem: 40, rep: 50 }),
        poll({ pollster: "New", end: asOf, dem: 49, rep: 50 }),
      ],
      asOf,
    )!;
    expect(avg.dem).toBeCloseTo(40 / 3 + (49 * 2) / 3);
  });

  it("uses only a pollster's latest poll", () => {
    const avg = pollAverage(
      [poll({ end: "2026-10-10", dem: 30, rep: 60 }), poll({ end: "2026-10-25", dem: 47, rep: 47 })],
      "2026-11-03",
    )!;
    expect(avg.margin).toBeCloseTo(0);
    expect(avg.polls).toHaveLength(1);
  });
});

describe("trend", () => {
  it("runs daily from the first poll and breaks where the window is empty", () => {
    const polls = [poll({ end: "2026-08-01" }), poll({ pollster: "B", end: "2026-10-01" })];
    const points = trend(polls, "2026-10-05");
    expect(points[0].date).toBe("2026-08-01");
    expect(points.at(-1)!.date).toBe("2026-10-05");
    // 2026-08-31 is the last day the August poll counts; nothing until October 1.
    expect(points.some((p) => p.date === "2026-08-31")).toBe(true);
    expect(points.some((p) => p.date === "2026-09-01")).toBe(false);
    expect(points.find((p) => p.date === "2026-10-01")).toBeDefined();
  });

  it("is empty with no eligible poll", () => {
    expect(trend([poll({ population: "A" })], "2026-11-03")).toEqual([]);
  });
});

describe("the committed poll list", () => {
  const raceIds = new Set(RACES.map((r) => r.id));
  const iso = /^\d{4}-\d{2}-\d{2}$/;

  it("has well-formed entries", () => {
    for (const p of POLLS) {
      const at = `${p.pollster} ${p.race} ${p.end}`;
      expect([at, raceIds.has(p.race)]).toEqual([at, true]);
      expect(p.start).toMatch(iso);
      expect(p.end).toMatch(iso);
      expect([at, p.start <= p.end && p.end <= AS_OF]).toEqual([at, true]);
      expect(p.n).toBeGreaterThan(0);
      expect(["LV", "RV", "A"]).toContain(p.population);
      expect(p.dem + p.rep + (p.other ?? 0)).toBeLessThanOrEqual(100.5);
      expect(p.url).toMatch(/^https:\/\//);
    }
  });

  it("lists each poll of a race once", () => {
    const keys = POLLS.map((p) => `${p.race}|${p.pollster}|${p.end}|${p.n}`);
    expect(keys.filter((k, i) => keys.indexOf(k) !== i)).toEqual([]);
  });
});
