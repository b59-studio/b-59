import { cleanChoice, countyName, raceKey } from "./normalize";
import type { Contest } from "./types";

/** One county in the Secretary of State's countyInfo file. */
export type SosCounty = {
  county: string;
  registered: number;
  ballots: number;
  contests: Contest[];
};

type RawCounty = {
  N: string;
  Summary?: { RV?: number; VC?: number };
  Races?: Record<string, { N: string; C?: Record<string, { N: string; P?: string; V?: number }> }>;
};

/**
 * The Secretary of State's county-by-race results: a JSON envelope whose
 * `upload` field is base64 of a map of county objects. Race names carry
 * trailing spaces ("U. S. SENATOR "), so they are trimmed; candidates keep
 * the state's order.
 */
export function parseSos(envelope: { upload: string }): SosCounty[] {
  const raw = JSON.parse(Buffer.from(envelope.upload, "base64").toString("utf8")) as Record<string, RawCounty>;
  return Object.values(raw).map((c) => ({
    county: countyName(c.N),
    registered: Number(c.Summary?.RV ?? 0),
    ballots: Number(c.Summary?.VC ?? 0),
    contests: Object.values(c.Races ?? {}).map((r) => ({
      key: raceKey(r.N),
      name: r.N.trim(),
      choices: Object.values(r.C ?? {}).map((x) => {
        const [name, party] = cleanChoice(x.N, x.P ?? "");
        return { name, party, votes: Number(x.V ?? 0) };
      }),
    })),
  }));
}

/** A race's totals summed over every county that reports it, with how many counties that is. */
export function sumCounties(counties: SosCounty[], key: string): { contest: Contest; counties: number } | null {
  let contest: Contest | null = null;
  let n = 0;
  for (const c of counties) {
    const race = c.contests.find((r) => r.key === key);
    if (!race) continue;
    n++;
    if (!contest) {
      contest = { key, name: race.name, choices: race.choices.map((ch) => ({ ...ch })) };
      continue;
    }
    for (const ch of race.choices) {
      const into = contest.choices.find((x) => x.name === ch.name && x.party === ch.party);
      if (into) into.votes += ch.votes;
      else contest.choices.push({ ...ch });
    }
  }
  return contest ? { contest, counties: n } : null;
}
