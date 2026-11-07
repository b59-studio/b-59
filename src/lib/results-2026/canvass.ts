/**
 * Telling, from what each county publishes, whether it has canvassed the
 * Nov 3, 2026 general election. Texas counties canvass in the second week
 * after a general election, then post a canvass or official report and
 * relabel their results; these read those signals so the page flips a
 * county to "Canvassed" without anyone editing a list.
 *
 * Every check is deliberately narrow. A false "Canvassed" is worse than a
 * late one, and counties use the word loosely: Hays posts a "Canvass Results
 * Report … unofficial" on election night (the canvass report format, not the
 * canvass), and Maverick labels its early-voting images "Official".
 */

/** Where a county's canvass was seen. */
export type CanvassSignal = { url: string; via: "county page" | "county results system" | "state" };

// Applied to link text and address with "_", "-", "+" and "." turned into spaces.
const NOV_3 = /\b(nov(ember)?\s*0?3\b|11[\s/]+0?3[\s/]+(20)?26\b|1103(20)?26\b|2026\s?11\s?03\b)/i;
const CANVASS_WORDS = /\b(canvass(ed)?|official)\b/i;
const NOT_YET = /\b(unofficial|un\s?official|unnofficial|preliminary|early\s*voting|election\s*night)\b/i;

/**
 * The link on a county's elections page to its canvass of Nov 3, 2026, if one
 * is there: link text or address must name the canvass (or official
 * results), name Nov 3, 2026, and say nothing that marks it as not final.
 */
export function canvassLink(html: string, pageUrl: string): string | null {
  for (const m of html.matchAll(/<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const href = m[1].replace(/&amp;/g, "&");
    const text = m[2].replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
    const both = `${text} ${decodeURIComponentSafe(href)}`.replace(/[_\-+.]/g, " ");
    if (!CANVASS_WORDS.test(both) || !NOV_3.test(both) || NOT_YET.test(both)) continue;
    if (!/2026/.test(both)) continue;
    try {
      return new URL(href, pageUrl).toString();
    } catch {
      continue;
    }
  }
  return null;
}

function decodeURIComponentSafe(s: string): string {
  try {
    return decodeURIComponent(s.replace(/\+/g, " "));
  } catch {
    return s;
  }
}

/**
 * Whether a Clarity site's page header says its results are official. Clarity
 * counties set the header themselves ("Unofficial Results" on election night)
 * and change it when they canvass; it sits in json/en/electionsettings.json.
 */
export function clarityOfficial(settings: unknown): boolean {
  const header = (settings as { pagesettings?: { web?: { header?: unknown } } })?.pagesettings?.web?.header;
  if (typeof header !== "string") return false;
  const text = header.replace(/<[^>]+>/g, " ");
  return CANVASS_WORDS.test(text) && !NOT_YET.test(text);
}

/** Whether Harris County's results file carries its official flag ("o"), which is 0 until it canvasses. */
export function harrisOfficial(summary: { o?: unknown }): boolean {
  return summary.o === 1 || summary.o === true || summary.o === "1" || summary.o === "Y";
}
