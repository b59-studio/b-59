import en from "../../messages/en.json";
import es from "../../messages/es.json";
import zh from "../../messages/zh.json";
import he from "../../messages/he.json";
import hi from "../../messages/hi.json";

// Enforces catalog completeness (standard 33): every locale must have exactly
// the keys the default (en) catalog defines — no missing keys (raw key leaks to
// users) and no orphaned keys — and every message must use the same rich tags
// as its English source. A tag the page does not pass renders as next-intl's
// placeholder, not as text, so tag drift is a user-visible defect too.
type Catalog = Record<string, unknown>;

function entries(obj: Catalog, prefix = ""): [string, string][] {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === "object"
      ? entries(v as Catalog, `${prefix}${k}.`)
      : [[`${prefix}${k}`, String(v)]]
  );
}

function tags(message: string): string {
  return (message.match(/<[a-z0-9]+>/gi) ?? []).sort().join(" ");
}

const base = new Map(entries(en));
const baseKeys = [...base.keys()].sort();

describe.each([
  ["es", es],
  ["zh", zh],
  ["he", he],
  ["hi", hi],
] as const)("%s catalog", (name, catalog) => {
  const localeEntries = new Map(entries(catalog));

  it("matches the en key set", () => {
    const localeKeys = [...localeEntries.keys()].sort();
    expect(baseKeys.filter((k) => !localeKeys.includes(k))).toEqual([]);
    expect(localeKeys.filter((k) => !baseKeys.includes(k))).toEqual([]);
  });

  it("uses the same rich tags as en in every message", () => {
    const drift = baseKeys
      .filter((k) => localeEntries.has(k))
      .filter((k) => tags(localeEntries.get(k) ?? "") !== tags(base.get(k) ?? ""))
      .map((k) => `${k}: en [${tags(base.get(k) ?? "")}] ${name} [${tags(localeEntries.get(k) ?? "")}]`);
    expect(drift).toEqual([]);
  });
});
