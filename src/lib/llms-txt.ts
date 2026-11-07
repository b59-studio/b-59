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
      { path: "/studio/political-consulting", title: "Progressive Political Consulting & Organizing", summary: "For Democratic and progressive campaigns and causes only. Field organizing, ballot measure petitions and signature drives, data and targeting, communications, and brand and campaign design for Texas campaigns and civic groups, from Austin." },
      { path: "/studio/ballot-measures", title: "Ballot Measures & Petitions in Austin", summary: "How a citizen petition reaches the Austin ballot (20,000 signatures from registered voters, the fields every line needs, City Clerk sample verification, Council adoption or election), with sources, and the petition drives the studio runs for progressive causes." },
    ],
  },
  {
    heading: "Texas election research",
    entries: [
      { path: "/research/2026-results", title: "2026 Texas Election Results", summary: "Race-by-race results of the November 3, 2026 general election, by county and precinct." },
      { path: "/research/2026-election-analysis", title: "2026 Texas Turnout Comparison", summary: "Turnout and results in every Texas county against 2018, 2022 and 2024." },
      { path: "/research/austin-petitions", title: "Austin Ballot Petitions: What Campaigns Miss", summary: "What Austin petition drives miss: why 20,000 signatures is the floor rather than the goal (about 3.7% of Austin voters), validity rates of recent Austin petitions as reported, out-of-city signers in the 2025 convention center drive, and the last safe filing date for November 2028, the next election a petition can reach." },
      { path: "/research/austin-petitions/prop-g", title: "Austin Prop G: The Next Petition Election Is November 2028", summary: "Austin's Proposition G (approved November 3, 2026, 206,286 to 116,761 unofficial) puts citizen initiatives and petitioned charter amendments on November ballots in even-numbered years only. No petition election in 2027; the next is November 7, 2028, with a last safe filing date of July 12, 2028 and no signature older than January 14, 2028 counting. A drive that misses it waits until November 2030." },
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
