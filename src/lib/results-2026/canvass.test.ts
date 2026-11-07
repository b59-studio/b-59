import { describe, expect, it } from "@jest/globals";
import collin from "@/data/results-2026/precincts/collin.json";
import starr from "@/data/results-2026/precincts/starr.json";
import willacy from "@/data/results-2026/precincts/willacy.json";
import { canvassLink, clarityOfficial, harrisOfficial } from "./canvass";

const page = (...links: [href: string, text: string][]) => links.map(([h, t]) => `<a href="${h}">${t}</a>`).join("\n");
const at = "https://county.example.gov/elections";

describe("canvassLink", () => {
  it("finds a Nov 3, 2026 canvass report and resolves its address", () => {
    expect(canvassLink(page(["/docs/canvass.pdf", "November 3, 2026 General Election Canvass Report"]), at)).toBe(
      "https://county.example.gov/docs/canvass.pdf",
    );
    expect(canvassLink(page(["/r/Nov_3_2026_Official_Results.pdf", "Results"]), at)).toBe(
      "https://county.example.gov/r/Nov_3_2026_Official_Results.pdf",
    );
    expect(canvassLink(page(["/r/11032026-official.pdf", "11/03/2026 Official Results"]), at)).not.toBeNull();
  });

  it("ignores what counties post before the canvass, however it is labelled", () => {
    const html = page(
      // Hays: the canvass report format, still unofficial.
      ["/DocumentCenter/View/5585/Canvass-Results-Report-20261103---unofficial", "Canvass results"],
      // Maverick: early voting, labelled official.
      ["https://x.r2.dev/elections/results/2026/Nov_3_2026_Early_Voting_Official_1.webp", "Official report 1/2"],
      // Montgomery: an earlier election's canvass.
      ["/results/2026_May_Republican_Primary_Runoff_Canvass_Report.pdf", "May 26, 2026 Republican Primary Runoff Canvass Report"],
      // Webb: a page title with no election date.
      ["/867/Official-Results-2026", "Official Results 2026"],
      ["/698/Unofficial-Results-2026", "Unofficial Results - November 3 2026, General Election"],
    );
    expect(canvassLink(html, at)).toBeNull();
  });
});

describe("Clarity and Harris official flags", () => {
  it("reads Clarity's page header", () => {
    const header = (h: string) => ({ pagesettings: { web: { header: h } } });
    expect(clarityOfficial(header("<div><strong>Unofficial Results</strong></div>"))).toBe(false);
    expect(clarityOfficial(header("<div><strong>Official Results</strong></div>"))).toBe(true);
    expect(clarityOfficial(header("<div>Canvassed Results</div>"))).toBe(true);
    expect(clarityOfficial({})).toBe(false);
  });

  it("reads Harris's o flag", () => {
    expect(harrisOfficial({ o: 0 })).toBe(false);
    expect(harrisOfficial({ o: 1 })).toBe(true);
    expect(harrisOfficial({})).toBe(false);
  });
});

/** The shape these assertions read; each county's file has its own set of races. */
type PrecinctFile = {
  largestGap: number;
  races: Record<string, { choices: unknown[]; types: unknown[]; rows: { votes: unknown[][] }[] }>;
};

const parsed: [county: string, file: PrecinctFile, races: number, gap: number][] = [
  ["Collin", collin, 39, 0.003],
  ["Starr", starr, 23, 0],
  ["Willacy", willacy, 23, 0],
];

describe("parsed precinct PDFs", () => {
  it.each(parsed)("%s: every state race, with sums close to the state's total", (_, file, races, gap) => {
    expect(Object.keys(file.races)).toHaveLength(races);
    expect(file.largestGap).toBeLessThanOrEqual(gap);
    const senate = file.races["US SENATOR"];
    expect(senate.rows.length).toBeGreaterThan(0);
    for (const row of senate.rows) {
      expect(row.votes).toHaveLength(senate.types.length);
      for (const byType of row.votes) expect(byType).toHaveLength(senate.choices.length);
    }
  });
});

// Deliberate type error to show the CI step fails; reverted in the next commit.
const deliberate: number = "not a number";
void deliberate;
