import { ORGANIZATION_DESCRIPTION } from "@/lib/structured-data";

type Entry = { path: string; title: string; summary: string };

/**
 * The pages an answer engine most needs to describe the studio. This is a guide,
 * not an index: every public page is in /sitemap.xml, which is derived from the
 * route tree, and this file points there for the rest.
 */
const SECTIONS: { heading: string; entries: Entry[] }[] = [
  {
    heading: "About",
    entries: [
      { path: "/about", title: "About B-59", summary: "Mission, how we work, and why the studio is named after the Soviet submarine B-59 and Vasili Arkhipov." },
      { path: "/about/team", title: "Team", summary: "Jonathon Reise, principal, in Austin, Texas: civic technology and Democratic field organizing in Travis County." },
      { path: "/about/inspirations", title: "Inspirations", summary: "Audrey Tang and g0v in Taiwan, and 18F in the US." },
    ],
  },
  {
    heading: "Political consulting and organizing",
    entries: [
      { path: "/studio/political-consulting", title: "Political Consulting & Organizing", summary: "Field organizing, voter registration, data and targeting, communications, and brand and campaign design for Texas campaigns and civic groups, from Austin." },
    ],
  },
  {
    heading: "Texas election research",
    entries: [
      { path: "/research/2026-results", title: "2026 Texas Election Results", summary: "Race-by-race results of the November 3, 2026 general election, by county and precinct." },
      { path: "/research/2026-election-analysis", title: "2026 Texas Turnout Comparison", summary: "Turnout and results in every Texas county against 2018, 2022 and 2024." },
      { path: "/research/2026-polls", title: "2026 Texas Polls", summary: "A weighted average of public polls of the 2026 Texas statewide races, every poll linked." },
    ],
  },
  {
    heading: "Products",
    entries: [
      { path: "/solutions/ready2vote", title: "ready2vote", summary: "Helps Texans complete a voter registration application online and have it mailed to their county." },
      { path: "/solutions/hotline", title: "Hotline", summary: "Scheduling and workforce management for civic and public-interest teams." },
      { path: "/studio", title: "Our Work", summary: "Every product the studio builds and runs." },
    ],
  },
];

export function buildLlmsTxt(siteUrl: string): string {
  const sections = SECTIONS.map(
    ({ heading, entries }) =>
      `## ${heading}\n\n${entries.map((e) => `- [${e.title}](${siteUrl}${e.path}): ${e.summary}`).join("\n")}`,
  );
  return [
    "# B-59 Studio",
    `> ${ORGANIZATION_DESCRIPTION}`,
    "Contact: contact@b-59.com",
    ...sections,
    `## Optional\n\n- [Sitemap](${siteUrl}/sitemap.xml): every public page.`,
  ].join("\n\n") + "\n";
}
