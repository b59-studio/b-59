import type { ProjectKey } from "./ProjectMark";
import type { GlyphKey } from "./NavGlyph";

/**
 * The header's menus, defined once for the desktop dropdowns and the phone
 * panel alike.
 *
 * Every menu has the same shape: a header that is itself a link — the page
 * that gathers the section — with a one-line summary under it, then the pages
 * inside the section, each with a mark, a name and a summary. A product shows
 * its own logo; any other page shows a B-59 blue glyph. A menu with more than
 * one kind of page splits its items into labelled groups.
 */
type NavKey = string;

export type NavItem = {
  href: string;
  icon: { project: ProjectKey } | { glyph: GlyphKey };
  /** A `nav` message key, or a product name, which is never translated. */
  label: { key: NavKey } | { brand: "ready2vote" | "Hotline" };
  sub: NavKey;
};

export type NavGroup = { heading?: NavKey; items: NavItem[] };

export type NavMenu = {
  id: string;
  trigger: NavKey;
  header: { href: string; title: NavKey; sub: NavKey };
  groups: NavGroup[];
};

export const NAV_MENUS: NavMenu[] = [
  {
    id: "studio",
    trigger: "studio",
    header: { href: "/studio", title: "ourWork", sub: "ourWorkSub" },
    groups: [
      {
        heading: "solutions",
        items: [
          {
            href: "/solutions/ready2vote",
            icon: { project: "ready2vote" },
            label: { brand: "ready2vote" },
            sub: "ready2voteSub",
          },
          {
            href: "/solutions/hotline",
            icon: { project: "hotline" },
            label: { brand: "Hotline" },
            sub: "hotlineSub",
          },
        ],
      },
      {
        heading: "services",
        items: [
          {
            href: "/studio/political-consulting",
            icon: { glyph: "organizing" },
            label: { key: "politicalConsulting" },
            sub: "politicalConsultingSub",
          },
          {
            href: "/studio/ballot-measures",
            icon: { glyph: "petition" },
            label: { key: "ballotMeasures" },
            sub: "ballotMeasuresSub",
          },
        ],
      },
      {
        heading: "tools",
        items: [
          {
            href: "/studio/win-calculator",
            icon: { glyph: "calculator" },
            label: { key: "winCalculator" },
            sub: "winCalculatorSub",
          },
        ],
      },
      // Case studies (Travis County VDR, Voter Registration Palooza, Merch)
      // are held back for now; the pages stay built but unlinked.
    ],
  },
  {
    id: "research",
    trigger: "research",
    header: { href: "/research", title: "elections2026", sub: "elections2026Sub" },
    groups: [
      {
        items: [
          {
            href: "/research/2026-election-analysis",
            icon: { glyph: "turnout" },
            label: { key: "electionAnalysis2026" },
            sub: "electionAnalysis2026Sub",
          },
          {
            href: "/research/2026-polls",
            icon: { glyph: "polls" },
            label: { key: "polls2026" },
            sub: "polls2026Sub",
          },
          {
            href: "/research/2026-results",
            icon: { glyph: "results" },
            label: { key: "results2026" },
            sub: "results2026Sub",
          },
        ],
      },
    ],
  },
  {
    id: "about",
    trigger: "about",
    header: { href: "/about", title: "ourStory", sub: "ourStorySub" },
    groups: [
      {
        items: [
          {
            href: "/about/inspirations",
            icon: { glyph: "inspirations" },
            label: { key: "inspirations" },
            sub: "inspirationsSub",
          },
          {
            href: "/about/team",
            icon: { glyph: "team" },
            label: { key: "team" },
            sub: "teamSub",
          },
        ],
      },
      // Brand Design Philosophy is not an About page: it describes the brand
      // design practice, which is held back along with its portfolio and merch
      // pages. It stays live and in the sitemap, linked from those pages, and
      // comes back into a menu when that practice does.
    ],
  },
];
