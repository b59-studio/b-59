import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "@jest/globals";
import { parseClarity } from "./clarity";
import { harrisBallots, harrisContests, harrisPrecincts, type HarrisPrecinctFile, type HarrisSummary } from "./harris";
import { cleanChoice, countyName, normParty, raceKey, splitParty } from "./normalize";
import { parseSos, sumCounties } from "./sos";
import { csvFileName, raceCsv } from "./csv";
import { defaultRace, raceDetail, raceIndex, type SnapshotLike } from "./present";
import type { Contest, CountyReading } from "./types";
import { unzipEntry } from "./zip";

const fixture = (name: string) => fs.readFileSync(path.join(__dirname, "__fixtures__", name));
const json = <T,>(name: string) => JSON.parse(fixture(name).toString("utf8")) as T;

describe("raceKey", () => {
  it("matches the same race across the state's and the counties' spellings", () => {
    expect(raceKey("U. S. SENATOR ")).toBe(raceKey("United States Senator"));
    expect(raceKey("U. S. REPRESENTATIVE DISTRICT 13")).toBe(raceKey("United States Representative, District 13"));
    expect(raceKey("RAILROAD COMMISSIONER ")).toBe(raceKey("Railroad Commissioner"));
  });

  it("keeps different districts apart", () => {
    expect(raceKey("United States Representative, District 1")).not.toBe(raceKey("United States Representative, District 10"));
  });
});

describe("names", () => {
  it("spells parties one way and moves suffixes off names", () => {
    expect(normParty("L")).toBe("LIB");
    expect(normParty("rep")).toBe("REP");
    expect(cleanChoice("Ken Paxton (REP)", "")).toEqual(["Ken Paxton", "REP"]);
    expect(cleanChoice("TED BROWN", "L")).toEqual(["TED BROWN", "LIB"]);
  });

  it("title-cases county names the way the site spells them", () => {
    expect(countyName("EL PASO")).toBe("El Paso");
    expect(countyName("El_Paso")).toBe("El Paso");
    expect(countyName("MCLENNAN")).toBe("McLennan");
  });

  it("splits a Harris candidate label into name and party", () => {
    expect(splitParty("KEN PAXTON (REP)")).toEqual(["KEN PAXTON", "REP"]);
    expect(splitParty("Avery Ayers (W)")).toEqual(["Avery Ayers", "W"]);
    expect(splitParty("FOR")).toEqual(["FOR", ""]);
  });
});

describe("unzipEntry", () => {
  it("reads detail.xml out of a Clarity detailxml.zip", () => {
    expect(unzipEntry(fixture("clarity_detailxml.zip"), "detail.xml").toString("utf8")).toBe(
      fixture("clarity_detail.xml").toString("utf8"),
    );
  });

  it("says so when the entry is missing", () => {
    expect(() => unzipEntry(fixture("clarity_detailxml.zip"), "summary.xml")).toThrow(/not found/);
  });
});

describe("parseClarity", () => {
  const r = parseClarity(fixture("clarity_detail.xml").toString("utf8"));

  it("reads the update stamp, ballots and precincts reporting", () => {
    expect(r.updated).toMatch(/2026/);
    expect(r.ballots).toBeGreaterThan(0);
    expect(r.reporting).toBe("730 of 914 precincts");
  });

  it("reads each contest's county totals from the choices", () => {
    const senate = r.contests.find((c) => c.key === raceKey("United States Senator"))!;
    expect(senate.choices.slice(0, 3)).toEqual([
      { name: "Ken Paxton", party: "REP", votes: 158692 },
      { name: "James Talarico", party: "DEM", votes: 457916 },
      { name: "Ted Brown", party: "LIB", votes: 9067 },
    ]);
  });

  it("keeps precinct votes by vote type and leaves out registration", () => {
    const detail = r.precincts.get(raceKey("United States Senator"))!;
    expect([...detail.types].sort()).toEqual(["EV In-person", "EV Mail", "Election Day"].sort());
    for (const row of detail.rows) {
      expect(row.votes).toHaveLength(3);
      for (const byChoice of row.votes) expect(byChoice).toHaveLength(detail.choices.length);
      expect(row.votes.flat().some((v) => v > 0)).toBe(true);
    }
  });
});

describe("Harris", () => {
  const summary = json<HarrisSummary>("harris_resultsbyballot.json");
  const contests = harrisContests(summary);

  it("splits party suffixes off the candidate labels", () => {
    expect(contests[0].key).toBe(raceKey("U. S. SENATOR "));
    expect(contests[0].choices[0]).toEqual({ name: "KEN PAXTON", party: "REP", votes: 0 });
  });

  it("counts ballots from the Senate contest when Harris leaves its own count at 0", () => {
    const senate = { i: 1, t: "United States Senator", ca: ["A (REP)", "B (DEM)"], tv: [451780, 907617], tuv: [7115, 7115], tov: [18, 18] };
    expect(harrisBallots({ ...summary, bc: 0, contests: [senate] })).toBe(451780 + 907617 + 7115 + 18);
    expect(harrisBallots({ ...summary, bc: 1200, contests: [senate] })).toBe(1200);
    expect(harrisBallots({ ...summary, bc: 0, contests: [] })).toBeNull();
  });

  it("builds precinct detail by vote type, dropping precincts with no votes", () => {
    const detail = harrisPrecincts(contests[0], json<HarrisPrecinctFile>(`harris_pv-${contests[0].id}.json`));
    expect(detail.types).toEqual(["Early in person", "Mail", "Election Day"]);
    expect(detail.rows.map((r) => r.precinct)).toEqual(["0001", "0003"]);
    expect(detail.rows[0].votes[0].slice(0, 2)).toEqual([120, 95]);
    expect(detail.rows[0].votes[1].slice(0, 2)).toEqual([7, 4]);
    expect(detail.rows[1].votes[2].slice(0, 2)).toEqual([40, 61]);
  });
});

describe("parseSos", () => {
  const counties = parseSos(json<{ upload: string }>("sos_countyInfo.json"));

  it("reads every county with its registration, ballots and races, names trimmed", () => {
    expect(counties.map((c) => c.county).sort()).toEqual(["Dallas", "Loving", "Travis"]);
    const travis = counties.find((c) => c.county === "Travis")!;
    expect(travis.registered).toBeGreaterThan(0);
    expect(travis.contests.some((r) => r.name === "U. S. SENATOR")).toBe(true);
  });

  it("sums a race over the counties that report it", () => {
    const key = raceKey("U. S. SENATOR");
    const total = sumCounties(counties, key)!;
    expect(total.counties).toBe(3);
    const byCounty = counties.map((c) => c.contests.find((r) => r.key === key)!.choices.reduce((a, x) => a + x.votes, 0));
    expect(total.contest.choices.reduce((a, x) => a + x.votes, 0)).toBe(byCounty.reduce((a, b) => a + b, 0));
  });

  it("returns nothing for a race no county reports", () => {
    expect(sumCounties(counties, "NOT A RACE")).toBeNull();
  });
});

describe("present", () => {
  const sos = parseSos(json<{ upload: string }>("sos_countyInfo.json"));
  const dallas = parseClarity(fixture("clarity_detail.xml").toString("utf8"));
  const harris = json<HarrisSummary>("harris_resultsbyballot.json");
  const reading = (county: string, system: string, contests: Contest[], hasPrecincts: boolean): CountyReading => ({
    county,
    system,
    resultsUrl: `https://example.test/${county}`,
    updated: null,
    readAt: "2026-11-04T01:20:00Z",
    ballots: null,
    reporting: null,
    contests,
    hasPrecincts,
  });
  const snapshot: SnapshotLike = {
    readAt: "2026-11-04T01:20:00Z",
    sos,
    sosReadAt: "2026-11-04T01:19:00Z",
    counties: [
      reading("Dallas", "Clarity", dallas.contests, true),
      reading("Harris", "HarrisVotes", harrisContests(harris), true),
      reading("Travis", "Texas SOS", sos.find((c) => c.county === "Travis")!.contests, false),
    ],
  };

  it("lists the U.S. Senate first, under Statewide, and U.S. House races under their own group", () => {
    const index = raceIndex(snapshot);
    expect(index[0]).toMatchObject({ key: "US SENATOR", group: "Statewide", name: "United States Senator" });
    expect(index.find((r) => r.key === raceKey("United States Representative, District 5"))?.group).toBe("U.S. House");
    expect(defaultRace(index)).toBe("US SENATOR");
  });

  it("takes each county from its own system and matches candidates across spellings", () => {
    const detail = raceDetail(snapshot, "US SENATOR")!;
    const names = detail.columns.map((c) => c.name);
    expect(names).toEqual(expect.arrayContaining(["Ken Paxton", "James Talarico"]));
    const row = detail.rows.find((r) => r.county === "Dallas")!;
    expect(row.system).toBe("Clarity");
    expect(row.votes[names.indexOf("James Talarico")]).toBe(457916);
    expect(row.votes[names.indexOf("Ken Paxton")]).toBe(158692);
    expect(row.total).toBe(row.votes.reduce((a, b) => a + b, 0) + row.other);
  });

  it("builds the statewide count from the followed counties plus the rest of Texas", () => {
    const detail = raceDetail(snapshot, "US SENATOR")!;
    expect(detail.rest?.counties).toBe(1); // Loving: the only state county not followed in this snapshot
    expect(detail.statewide?.counties).toBe(detail.rows.length + 1);
    expect(detail.statewide?.total).toBe(detail.rows.reduce((a, r) => a + r.total, 0) + detail.rest!.total);
    expect(detail.statewide?.fromCounties).toBe(detail.rows.filter((r) => r.system !== "Texas SOS").length);
  });

  it("takes a county from the state when the state has counted more of its votes", () => {
    const sosWithVotes = sos.map((c) =>
      c.county !== "Dallas"
        ? c
        : { ...c, contests: c.contests.map((r) => (r.key === "US SENATOR" ? { ...r, choices: r.choices.map((ch) => ({ ...ch, votes: 10 })) } : r)) },
    );
    const stalled: SnapshotLike = {
      ...snapshot,
      sos: sosWithVotes,
      counties: [reading("Dallas", "Clarity", [{ key: "US SENATOR", name: "United States Senator", choices: [] }], true)],
    };
    const row = raceDetail(stalled, "US SENATOR")!.rows.find((r) => r.county === "Dallas")!;
    expect(row.system).toBe("Texas SOS");
  });

  it("returns nothing for a race no source has", () => {
    expect(raceDetail(snapshot, "NOT A RACE")).toBeNull();
  });

  it("writes a race as CSV with statewide, county and precinct rows, and no zero precinct rows", () => {
    const detail = raceDetail(snapshot, "US SENATOR")!;
    const precincts = dallas.precincts.get("US SENATOR")!;
    const csv = raceCsv(detail, sos, snapshot.sosReadAt, [{ county: "Dallas", system: "Clarity", readAt: "t", detail: precincts }]);
    const lines = csv.trim().split("\n");
    expect(lines[0]).toBe("level,county,precinct,vote_type,candidate,party,votes,source,as_of");
    expect(lines.some((l) => l.startsWith("statewide,"))).toBe(true);
    expect(lines.some((l) => l.startsWith("county,Loving,"))).toBe(true);
    expect(lines.some((l) => l.startsWith("county,Dallas,,total,James Talarico,DEM,457916,Clarity"))).toBe(true);
    const precinctLines = lines.filter((l) => l.startsWith("precinct,"));
    expect(precinctLines.length).toBeGreaterThan(0);
    expect(precinctLines.every((l) => !/,0,Clarity,/.test(l))).toBe(true);
    expect(csvFileName("United States Senator")).toBe("tx-2026-results-united-states-senator.csv");
  });
});
