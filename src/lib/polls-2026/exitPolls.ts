/**
 * Exit surveys of the Nov. 3, 2026 Texas general election, compared side by
 * side. The figures are hand-entered from each survey's public release into
 * `exit-polls.json`; B-59 has no licence for full crosstabs, so the file holds
 * a fixed set of headline groups (HEADLINE_GROUPS), each credited and linked.
 *
 * The surveys are never averaged. Edison's exit poll interviews voters as they
 * leave polling places and calls early voters; AP VoteCast surveys registered
 * voters online and by phone over the last days of voting. Their samples and
 * weights differ, so the page shows each source's figure and the spread
 * between them.
 *
 * Entering a release: add an object to `releases` with the source id, the race
 * id, the time the source published it (ISO 8601 with offset, e.g.
 * "2026-11-03T19:05:00-06:00" for 7:05 PM Central), the URL of the source's
 * page and one row per headline group, with shares as fractions (47% is 0.47).
 * When a source reweights, add a new release rather than editing the old one:
 * the page shows the newest, and the old ones are the night's history. Run
 * `pnpm test` before pushing; `checkData` catches the usual slips.
 */

export type SourceId = "edison" | "votecast" | "nbc";
export type RaceId = "senate" | "governor";

export type Source = {
  id: SourceId;
  name: string;
  /** For narrow columns: "Edison". */
  short: string;
  /** Who publishes the figures, in a phrase: "CNN, ABC News, CBS News and NBC News". */
  publishers: string;
  url: string;
  method: string;
  /** Set when the source was looked for and no Texas release found: where, and when. */
  unavailable?: string;
};

/** One group's figures in one release. Fractions of 1, as published (to the point). */
export type GroupFigures = {
  group: string;
  /** The group's share of the race's voters. */
  share: number | null;
  dem: number | null;
  rep: number | null;
  /** Set when the source draws the group differently from its label. */
  note?: string;
};

export type Release = {
  source: SourceId;
  race: RaceId;
  /** When the source published or last reweighted these figures, ISO 8601 with offset. */
  released: string;
  url: string;
  rows: GroupFigures[];
};

export type ExitPollData = {
  sources: Source[];
  races: { id: RaceId; label: string }[];
  releases: Release[];
};

/**
 * The only groups the page publishes, by dimension, in display order. A row
 * outside this list fails `checkData`, which keeps the file to headline
 * figures rather than a copied crosstab.
 */
export const HEADLINE_GROUPS: Record<string, string[]> = {
  "All voters": ["All voters"],
  Gender: ["Men", "Women"],
  Age: ["18–29", "30–44", "45–64", "65 and older"],
  "Race and ethnicity": ["White", "Black", "Hispanic/Latino", "Asian", "Other"],
  Education: ["College graduate", "No college degree"],
  "Party ID": ["Democrat", "Republican", "Independent or other"],
};

export const DIMENSIONS = Object.keys(HEADLINE_GROUPS);
const dimensionOf = new Map(Object.entries(HEADLINE_GROUPS).flatMap(([d, groups]) => groups.map((g) => [g, d])));
const groupOrder = new Map(Object.values(HEADLINE_GROUPS).flat().map((g, i) => [g, i]));

export const dimension = (group: string) => dimensionOf.get(group) ?? "";

const finite = (x: number | null | undefined): x is number => x != null && Number.isFinite(x);

/** Democratic share minus Republican share; null unless both are published. */
export const marginOf = (row: Pick<GroupFigures, "dem" | "rep">) =>
  finite(row.dem) && finite(row.rep) ? row.dem - row.rep : null;

const time = (iso: string) => new Date(iso).getTime();

/**
 * Each source's most recent release for the race. Exit polls are reweighted
 * through the night as the count comes in, so an earlier release is history,
 * not a second opinion.
 */
export function latestReleases(releases: Release[], race: RaceId): Release[] {
  const latest = new Map<SourceId, Release>();
  for (const r of releases) {
    if (r.race !== race) continue;
    const held = latest.get(r.source);
    if (!held || time(r.released) > time(held.released)) latest.set(r.source, r);
  }
  return [...latest.values()];
}

/** The gap between the highest and lowest of the published values; null with fewer than two. */
export function spread(values: (number | null | undefined)[]): number | null {
  const known = values.filter(finite);
  return known.length < 2 ? null : Math.max(...known) - Math.min(...known);
}

export type SourceFigures = GroupFigures & { margin: number | null; released: string };

export type Comparison = {
  dimension: string;
  group: string;
  bySource: Partial<Record<SourceId, SourceFigures>>;
  /** Max minus min across sources of the group's share of voters. */
  shareSpread: number | null;
  /** Max minus min across sources of the D−R margin. */
  marginSpread: number | null;
};

/**
 * One row per headline group that any source reports for the race, each
 * source's latest figures beside each other, in HEADLINE_GROUPS order.
 */
export function compare(releases: Release[], race: RaceId): Comparison[] {
  const rows = new Map<string, Comparison>();
  for (const release of latestReleases(releases, race)) {
    for (const fig of release.rows) {
      const row = rows.get(fig.group) ?? {
        dimension: dimension(fig.group),
        group: fig.group,
        bySource: {},
        shareSpread: null,
        marginSpread: null,
      };
      row.bySource[release.source] = { ...fig, margin: marginOf(fig), released: release.released };
      rows.set(fig.group, row);
    }
  }
  for (const row of rows.values()) {
    const figs = Object.values(row.bySource);
    row.shareSpread = spread(figs.map((f) => f.share));
    row.marginSpread = spread(figs.map((f) => f.margin));
  }
  return [...rows.values()].sort((a, b) => (groupOrder.get(a.group) ?? 1e9) - (groupOrder.get(b.group) ?? 1e9));
}

/** How one group's figures from one source moved across that source's releases, oldest first. */
export function history(releases: Release[], race: RaceId, source: SourceId, group: string) {
  return releases
    .filter((r) => r.race === race && r.source === source)
    .sort((a, b) => time(a.released) - time(b.released))
    .flatMap((r) => {
      const fig = r.rows.find((f) => f.group === group);
      return fig ? [{ released: r.released, url: r.url, share: fig.share, margin: marginOf(fig) }] : [];
    });
}

export type Implied = { dimension: string; dem: number; rep: number; margin: number; covered: number };

/**
 * The topline each dimension of a release implies: every group's vote
 * weighted by its share of voters, over the share the groups cover (gender
 * leaves out the 1% who identify another way). A release with no "All
 * voters" row still says, through each table, what it thinks the race was.
 */
export function impliedTopline(release: Release): Implied[] {
  return Object.entries(HEADLINE_GROUPS).flatMap(([dim, members]) => {
    if (dim === "All voters") return [];
    const rows = members.map((g) => release.rows.find((f) => f.group === g));
    if (!rows.every((f) => f && finite(f.share) && finite(f.dem) && finite(f.rep))) return [];
    const figs = rows as (GroupFigures & { share: number; dem: number; rep: number })[];
    const covered = figs.reduce((a, f) => a + f.share, 0);
    const dem = figs.reduce((a, f) => a + f.share * f.dem, 0) / covered;
    const rep = figs.reduce((a, f) => a + f.share * f.rep, 0) / covered;
    return [{ dimension: dim, dem, rep, margin: dem - rep, covered }];
  });
}

/** Rounding in published tables leaves a dimension's shares a little off 100%. */
const SHARE_TOLERANCE = 0.03;

/**
 * Problems with the hand-entered file, as readable sentences; empty when it is
 * sound. Run by the tests, so a typo fails CI instead of reaching the page.
 */
export function checkData(data: ExitPollData): string[] {
  const problems: string[] = [];
  const sources = new Set(data.sources.map((s) => s.id));
  const races = new Set(data.races.map((r) => r.id));
  const seen = new Set<string>();

  for (const r of data.releases) {
    const at = `${r.source} ${r.race} ${r.released}`;
    if (!sources.has(r.source)) problems.push(`${at}: unknown source`);
    if (!races.has(r.race)) problems.push(`${at}: unknown race`);
    if (!/[+-]\d\d:\d\d$|Z$/.test(r.released) || Number.isNaN(time(r.released)))
      problems.push(`${at}: release time needs a date, a time and a UTC offset`);
    if (seen.has(at)) problems.push(`${at}: entered twice`);
    seen.add(at);
    if (!/^https:\/\//.test(r.url)) problems.push(`${at}: link the release (https)`);

    const groups = new Set<string>();
    for (const f of r.rows) {
      if (!dimensionOf.has(f.group)) problems.push(`${at}: "${f.group}" is not a headline group`);
      if (groups.has(f.group)) problems.push(`${at}: "${f.group}" entered twice`);
      groups.add(f.group);
      for (const [k, v] of [["share", f.share], ["dem", f.dem], ["rep", f.rep]] as const)
        if (v != null && !(v >= 0 && v <= 1)) problems.push(`${at}: ${f.group} ${k} must be a fraction between 0 and 1`);
      if (finite(f.dem) && finite(f.rep) && f.dem + f.rep > 1 + 1e-9)
        problems.push(`${at}: ${f.group} Democratic and Republican shares add up to more than 100%`);
    }

    for (const [dim, members] of Object.entries(HEADLINE_GROUPS)) {
      if (dim === "All voters") continue;
      const shares = r.rows.filter((f) => members.includes(f.group)).map((f) => f.share);
      if (shares.length === members.length && shares.every(finite)) {
        const total = shares.reduce((a, b) => a + b, 0);
        if (Math.abs(total - 1) > SHARE_TOLERANCE)
          problems.push(`${at}: ${dim} shares add up to ${(total * 100).toFixed(0)}%, not 100%`);
      }
    }
  }
  return problems;
}
