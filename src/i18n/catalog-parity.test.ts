import en from "../../messages/en.json";
import es from "../../messages/es.json";
import zh from "../../messages/zh.json";

// Enforces catalog completeness (standard 33): every locale must have exactly
// the keys the default (en) catalog defines — no missing keys (raw key leaks to
// users) and no orphaned keys.
function keys(obj: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === "object"
      ? keys(v as Record<string, unknown>, `${prefix}${k}.`)
      : [`${prefix}${k}`]
  );
}

const base = keys(en).sort();

describe.each([
  ["es", es],
  ["zh", zh],
] as const)("%s catalog", (name, catalog) => {
  it(`matches the en key set`, () => {
    const localeKeys = keys(catalog).sort();
    expect(base.filter((k) => !localeKeys.includes(k))).toEqual([]);
    expect(localeKeys.filter((k) => !base.includes(k))).toEqual([]);
  });
});
