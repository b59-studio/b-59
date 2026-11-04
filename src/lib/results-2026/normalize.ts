/**
 * A key that matches the same race across results systems. The Secretary of
 * State writes "U. S. SENATOR " and "U. S. REPRESENTATIVE DISTRICT 13"; Clarity
 * and Harris write "United States Senator" and "United States Representative,
 * District 13". Upper-casing, folding "United States" to "US" and dropping
 * punctuation and extra spaces makes them equal.
 */
export function raceKey(name: string): string {
  return name
    .toUpperCase()
    .replace(/UNITED STATES/g, "US")
    .replace(/[^A-Z0-9]+/g, " ")
    .replace(/\bU S\b/g, "US")
    .replace(/\s+/g, " ")
    .trim();
}

/** "EL PASO" or "El_Paso" to "El Paso"; "MCLENNAN" to "McLennan". */
export function countyName(raw: string): string {
  return raw
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b([a-z])/g, (c) => c.toUpperCase())
    .replace(/\bMc([a-z])/g, (_, c: string) => `Mc${c.toUpperCase()}`)
    .replace(/\bDewitt\b/, "DeWitt")
    .replace(/\bLasalle\b/, "La Salle");
}

const PARTY_CODES: Record<string, string> = { D: "DEM", R: "REP", L: "LIB", G: "GRN", I: "IND" };

/** One spelling per party: the state writes "L" where the counties write "LIB". */
export function normParty(party: string): string {
  const p = party.trim().toUpperCase();
  return PARTY_CODES[p] ?? p;
}

/** A choice's name and party, with a "(REP)"-style suffix moved off the name into the party. */
export function cleanChoice(name: string, party: string): [name: string, party: string] {
  const [n, suffix] = splitParty(name.trim());
  return [n, normParty(party || suffix)];
}

/** "KEN PAXTON (REP)" to ["KEN PAXTON", "REP"]. */
export function splitParty(label: string): [name: string, party: string] {
  const m = label.match(/^(.*?)\s*\((REP|DEM|LIB|GRN|IND|W)\)\s*$/);
  return m ? [m[1], m[2]] : [label, ""];
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

/** Decode the XML entities Clarity uses in attribute values. */
export function decodeXml(s: string): string {
  return s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === "#") return String.fromCodePoint(e[1] === "x" ? parseInt(e.slice(2), 16) : Number(e.slice(1)));
    return ENTITIES[e] ?? m;
  });
}
