import { describe, expect, it } from "@jest/globals";
import committed from "./exit-polls.json";
import { checkData, compare, history, latestReleases, marginOf, spread, type ExitPollData, type Release } from "./exitPolls";

// Made-up figures for the maths only; none of them is a published result.
const release = (over: Partial<Release>): Release => ({
  source: "edison",
  race: "senate",
  released: "2026-11-03T19:05:00-06:00",
  url: "https://example.com/release",
  rows: [],
  ...over,
});

const early = release({
  rows: [
    { group: "All voters", share: 1, dem: 0.48, rep: 0.5 },
    { group: "Men", share: 0.47, dem: 0.42, rep: 0.56 },
  ],
});
const later = release({
  released: "2026-11-03T22:40:00-06:00",
  rows: [
    { group: "All voters", share: 1, dem: 0.49, rep: 0.5 },
    { group: "Women", share: 0.53, dem: 0.55, rep: 0.44 },
    { group: "Men", share: 0.47, dem: 0.43, rep: 0.55 },
  ],
});
const votecast = release({
  source: "votecast",
  released: "2026-11-03T19:00:00-06:00",
  rows: [
    { group: "Men", share: 0.48, dem: 0.4, rep: 0.58 },
    { group: "All voters", share: 1, dem: 0.47, rep: 0.51 },
    { group: "18–29", share: 0.12, dem: null, rep: null },
  ],
});
const governor = release({ race: "governor", released: "2026-11-04T01:00:00-06:00", rows: [] });

describe("marginOf", () => {
  it("is the Democratic share minus the Republican share", () => {
    expect(marginOf({ dem: 0.42, rep: 0.56 })).toBeCloseTo(-0.14);
  });
  it("is null unless both shares are published", () => {
    expect(marginOf({ dem: 0.42, rep: null })).toBeNull();
  });
});

describe("spread", () => {
  it("is the highest value minus the lowest", () => {
    expect(spread([0.1, -0.04, 0.02])).toBeCloseTo(0.14);
  });
  it("skips blanks and needs two values", () => {
    expect(spread([0.1, null, undefined])).toBeNull();
    expect(spread([])).toBeNull();
    expect(spread([0.1, null, 0.07])).toBeCloseTo(0.03);
  });
});

describe("latestReleases", () => {
  it("keeps each source's newest release for the race, whatever order they were entered in", () => {
    const got = latestReleases([later, votecast, early, governor], "senate");
    expect(got).toHaveLength(2);
    expect(got.find((r) => r.source === "edison")).toBe(later);
    expect(got.find((r) => r.source === "votecast")).toBe(votecast);
  });
  it("compares instants, not strings, across UTC offsets", () => {
    const utc = release({ released: "2026-11-04T04:00:00Z" }); // 10:00 PM Central
    expect(latestReleases([utc, later], "senate")[0]).toBe(later);
  });
});

describe("compare", () => {
  const rows = compare([early, later, votecast, governor], "senate");

  it("puts each source's latest figures for a group side by side", () => {
    const men = rows.find((r) => r.group === "Men")!;
    expect(men.dimension).toBe("Gender");
    expect(men.bySource.edison?.dem).toBe(0.43);
    expect(men.bySource.edison?.released).toBe(later.released);
    expect(men.bySource.votecast?.margin).toBeCloseTo(-0.18);
  });

  it("measures the spread between sources without averaging them", () => {
    const men = rows.find((r) => r.group === "Men")!;
    expect(men.marginSpread).toBeCloseTo(0.06); // −0.12 against −0.18
    expect(men.shareSpread).toBeCloseTo(0.01);
    expect(men).not.toHaveProperty("average");
  });

  it("leaves the spread blank for a group only one source reports", () => {
    const women = rows.find((r) => r.group === "Women")!;
    expect(women.bySource.votecast).toBeUndefined();
    expect(women.marginSpread).toBeNull();
    const young = rows.find((r) => r.group === "18–29")!;
    expect(young.bySource.votecast?.margin).toBeNull();
    expect(young.marginSpread).toBeNull();
  });

  it("orders rows as the headline groups are listed", () => {
    expect(rows.map((r) => r.group)).toEqual(["All voters", "Men", "Women", "18–29"]);
  });

  it("is empty before any release", () => {
    expect(compare([], "senate")).toEqual([]);
  });
});

describe("history", () => {
  it("follows one group through a source's releases, oldest first", () => {
    const got = history([later, votecast, early], "senate", "edison", "Men");
    expect(got.map((h) => h.released)).toEqual([early.released, later.released]);
    expect(got[0].margin).toBeCloseTo(-0.14);
    expect(got[1].margin).toBeCloseTo(-0.12);
  });
});

const data = (releases: Release[]): ExitPollData => ({
  sources: committed.sources as ExitPollData["sources"],
  races: committed.races as ExitPollData["races"],
  releases,
});

describe("checkData", () => {
  it("passes the committed file", () => {
    expect(checkData(committed as ExitPollData)).toEqual([]);
  });

  it("passes sound releases", () => {
    expect(checkData(data([early, later, votecast]))).toEqual([]);
  });

  it("refuses a group outside the headline set, so no crosstab is copied in", () => {
    const bad = release({ rows: [{ group: "White evangelical", share: 0.2, dem: 0.1, rep: 0.9 }] });
    expect(checkData(data([bad]))).toEqual([expect.stringContaining('"White evangelical" is not a headline group')]);
  });

  it("refuses percentages typed as whole numbers", () => {
    const bad = release({ rows: [{ group: "Men", share: 47, dem: 0.42, rep: 0.56 }] });
    expect(checkData(data([bad]))[0]).toContain("Men share must be a fraction");
  });

  it("refuses a release time without a UTC offset", () => {
    expect(checkData(data([release({ released: "2026-11-03T19:05" })]))[0]).toContain("UTC offset");
  });

  it("refuses shares of a dimension that do not add up", () => {
    const bad = release({
      rows: [
        { group: "Men", share: 0.47, dem: 0.42, rep: 0.56 },
        { group: "Women", share: 0.6, dem: 0.55, rep: 0.44 },
      ],
    });
    expect(checkData(data([bad]))).toEqual([expect.stringContaining("Gender shares add up to 107%")]);
  });

  it("refuses the same release entered twice, and party shares over 100%", () => {
    const over = release({ rows: [{ group: "Men", share: 0.47, dem: 0.6, rep: 0.5 }] });
    const problems = checkData(data([over, over]));
    expect(problems).toContainEqual(expect.stringContaining("entered twice"));
    expect(problems).toContainEqual(expect.stringContaining("more than 100%"));
  });
});
