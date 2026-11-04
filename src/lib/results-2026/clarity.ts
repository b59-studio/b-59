import { cleanChoice, decodeXml, raceKey } from "./normalize";
import type { Contest, PrecinctDetail } from "./types";

/** What a Clarity detail.xml holds, parsed: county totals per contest, and precinct detail by vote type. */
export type ClarityResults = {
  updated: string | null;
  ballots: number | null;
  reporting: string | null;
  contests: Contest[];
  precincts: Map<string, PrecinctDetail>;
};

const attrs = (tag: string): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const m of tag.matchAll(/([A-Za-z_][\w-]*)="([^"]*)"/g)) out[m[1]] = decodeXml(m[2]);
  return out;
};

/**
 * Parse Clarity's detail.xml: Contest > Choice > VoteType > Precinct. Only
 * vote types inside a Choice are read; the contest-level "regVotersCounty"
 * type is registration, not votes. A regex scan rather than a DOM parser,
 * because the file runs to 15 MB and its shape is fixed.
 */
export function parseClarity(xml: string): ClarityResults {
  const updated = xml.match(/<Timestamp>([^<]*)<\/Timestamp>/)?.[1].trim() ?? null;
  const turnout = xml.match(/<VoterTurnout\b[^>]*>/)?.[0];
  const ballots = turnout ? Number(attrs(turnout).ballotsCast ?? NaN) : NaN;

  const contests: Contest[] = [];
  const precincts = new Map<string, PrecinctDetail>();
  let reporting: string | null = null;

  for (const contestMatch of xml.matchAll(/<Contest\b([^>]*)>([\s\S]*?)<\/Contest>/g)) {
    const meta = attrs(contestMatch[1]);
    const name = meta.text ?? "";
    const key = raceKey(name);
    if (!reporting && meta.precinctsReporting) {
      reporting = `${meta.precinctsReported ?? "?"} of ${meta.precinctsReporting} precincts`;
    }

    const choices: Contest["choices"] = [];
    const types: string[] = [];
    const byPrecinct = new Map<string, number[][]>();
    const choiceBlocks = [...contestMatch[2].matchAll(/<Choice\b([^>]*)>([\s\S]*?)<\/Choice>/g)];

    choiceBlocks.forEach((choiceMatch, ci) => {
      const c = attrs(choiceMatch[1]);
      const [choiceName, party] = cleanChoice(c.text ?? "", c.party ?? "");
      choices.push({ name: choiceName, party, votes: Number(c.totalVotes ?? 0) });
      for (const typeMatch of choiceMatch[2].matchAll(/<VoteType\b([^>]*)>([\s\S]*?)<\/VoteType>/g)) {
        const type = attrs(typeMatch[1]).name ?? "";
        let ti = types.indexOf(type);
        if (ti < 0) ti = types.push(type) - 1;
        for (const p of typeMatch[2].matchAll(/<Precinct\b([^>]*)\/>/g)) {
          const { name: precinct, votes } = attrs(p[1]);
          const v = Number(votes ?? 0);
          if (!v || !precinct) continue;
          let row = byPrecinct.get(precinct);
          if (!row) byPrecinct.set(precinct, (row = []));
          (row[ti] ??= new Array(choiceBlocks.length).fill(0))[ci] = v;
        }
      }
    });

    contests.push({ key, name, choices });
    if (byPrecinct.size) {
      precincts.set(key, {
        choices: choices.map(({ name: n, party }) => ({ name: n, party })),
        types,
        rows: [...byPrecinct].map(([precinct, votes]) => ({
          precinct,
          votes: types.map((_, ti) => votes[ti] ?? new Array(choices.length).fill(0)),
        })),
      });
    }
  }

  return { updated, ballots: Number.isFinite(ballots) ? ballots : null, reporting, contests, precincts };
}
