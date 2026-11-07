# Changelog

Notable, **user-visible** changes to the B-59 site. Internal-only work — CI
fixes, refactors, dependency bumps, standards syncs — is left to the git
history, which is where it belongs.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), with
one deliberate departure: **there are no version numbers.** The site is
continuously deployed — merging to `main` puts the change in front of the
public — so a semver release would be a ceremony nothing here actually
performs. Sections are dated by the day the change went live instead.

**Working convention.** While a branch is open, add your entry under
`## [Unreleased]`. When the pull request merges, move it under a heading for
that day's date. If a branch stays open across a deploy, check that your entry
is still sitting under the right heading before you merge — an entry can end up
filed under a date that shipped without it, and git will not flag it, because
the addition is clean and only the heading above it changed.

Categories: **Added**, **Changed**, **Deprecated**, **Removed**, **Fixed**,
**Security**.

> Entries before 2026-08-22 were reconstructed from the commit history rather
> than written at the time, so they record *what* shipped and when, and are
> thinner on *why* than entries written alongside the work.

---

## [Unreleased]

### Changed

- The 2026 election analysis page is now named "2026 Turnout Comparison" in
  the menus, the sitemap and the browser tab, in all five languages. Its
  address is unchanged, so existing links keep working.

## 2026-11-06

### Added

- **Precinct tables for Collin, Starr and Willacy counties.** These counties
  publish precinct results only as PDF reports. The reports are now parsed into
  the same per-race precinct tables and CSV rows as the Clarity and Harris
  counties, with a link to each PDF. Starr's and Willacy's precinct sums match
  the state's county totals exactly. Collin's report was run at 1:08 AM on
  Nov 4, before the county's last update, so its sums run up to 0.3% below the
  state's total. The page says so beside each table.
- **Exit polls are on the polling page.** Texas exit-poll figures for the
  Senate and governor races are now entered from NBC News, covering gender,
  age, race, education and party. Fox News shows the same figures, and neither
  names the pollster. The "Polls vs results" tab now sets each exit-poll table
  against the count. The published tables have no all-voters row, so each
  table's topline is worked out from its groups. AP VoteCast had no Texas
  release that could be found, and the page says where it was looked for and
  when.

- **The 2026 research pages compare against past years and against the
  forecasts.** The election analysis opens on a new "2026 vs past years" tab:
  each county's 2026 turnout against 2022, 2018 and 2024, in points and in
  ballots, and the Democratic–Republican margin for the top of the ticket,
  the U.S. Senate, Governor, Railroad Commissioner and Comptroller against
  each earlier race for that office, with the shift and the change in each
  party's votes. The polls page gains a "Polls vs results" tab setting each
  race's final poll average, and each poll in it, against the result, and the
  win calculator's election-day assumption against what election day added.

### Changed

- The Research menu holds one item, 2026 Elections. On a wide screen its
  three pages (the analysis, the polls and the results) open beside it on
  hover, click or the arrow keys; on a phone they open beneath it. The menus'
  headings and descriptions are a little larger, up to the site's smallest
  text size.

- **Counties flip to "Canvassed" on their own.** Each county is now checked
  hourly for its canvass: in Clarity's page header, through Harris's official
  flag, or through a link to a Nov 3, 2026 canvass or official report on the
  county's elections page. The state's own official flag marks every county.
  The hand-kept list now serves only as an override. A report that still says
  "unofficial" is never counted as a canvass, even when it is titled "Canvass
  Results Report", which is how Hays labels its election-night report.
- **Hays County is labelled as unreadable.** Its website refuses automated
  requests, so its totals still come from the Texas Secretary of State. The
  sources table now says so and links Hays's precinct report for reading by
  hand.
- Our Story, Our Inspirations and Team read as one section. Each opens with
  the same row of links to the other two. Our Story leads with what the studio
  stands for and three facts about it, sets out how it works as three
  principles, and ends with links to the people it learns from and works with,
  then a way to email the studio.
- The home page shows the work instead of a tagline. The three 2026 Texas
  research pages and both products — ready2vote and Hotline — are now on the
  first screen, each one click away, where before the page was a headline and
  a "Learn More" button. It ends in a way to reach the studio by email. In
  every language but English the research list says it is published in
  English.
- The research pages say plainly which numbers are final. The 2026 results
  and turnout are each county's complete election-night count, unofficial
  until canvassed; each county on the results page shows its status and the
  date its figures were last updated, with links to the precinct reports
  Collin, Starr and Willacy have posted. The pages read the state's count as
  it moves toward canvass, and will say so when the state certifies it.
- The analysis page's headline figures and main turnout table show 2026's
  final count instead of election-night tracker readings, which stay on the
  Election day tab.
- The Research menu groups the 2026 work under one heading, 2026 Elections:
  the analysis, the polls and the results, each with a line on what it holds.
  "2026 Live Results" is now "2026 Results".

### Fixed

- Moving between Our Story, Our Inspirations and Team no longer blanks the
  page title and slides it back in on every click; the new page fades in
  quickly under links that hold still. Following "Audrey Tang" or "18F" from
  Our Story lands on that section below the header instead of under it.
- The live results now show how many ballots Harris County has counted, and
  count it among the counties reporting. Harris's results file leaves its own
  ballots-counted field at zero, so the figure comes from its U.S. Senate
  contest, which is on every ballot.

## 2026-11-04

### Fixed

- The live results keep showing a county when its results system briefly
  fails. Clarity has been answering some requests with server errors under
  election-night load; the site now retries those, and keeps the last good
  copy of each county's file where every server sees it, so a server that has
  just started no longer shows that county blank.

## 2026-11-03

### Added

- **Live election results in the Research menu: 2026 Texas live results.**
  Every race on the ballot in the 19 counties the analysis follows, from the
  U.S. Senate down to local races, refreshed every two minutes. Each race
  shows a statewide count, each county from its own results system (Clarity
  for eight counties, HarrisVotes for Harris, the Secretary of State for the
  ten that post only PDFs) with a link to it and the time it last updated,
  and, where a county publishes them, its precincts by vote type. Any column
  sorts, and each race downloads as a CSV of its statewide, county and
  precinct figures. Results are unofficial until canvassed.
- **Hays County's live election-day tracker in the 2026 election analysis.**
  Every Texas county was checked for a live election-day turnout tracker;
  Hays is the one new county that publishes one, and it now appears beside
  Travis, Bell, Montgomery, Ellis, Hockley, McLennan and Madison. The Method
  section names the source and says that the other 246 counties publish no
  live check-in count.
- **A polling page in the Research menu: 2026 Texas polls.** It averages the
  public polls of seven statewide races (U.S. Senate, governor, lieutenant
  governor, attorney general, comptroller, Railroad Commissioner and the
  generic congressional ballot) and shows where each race stands, how the
  average moved over time, and every poll, linked to its source, in a table
  that sorts by any column. The average is a simple one, explained on the
  page: each pollster's latest poll from the last 30 days, weighted toward
  newer and larger polls. An Exit polls tab sits beside it for results after
  the polls close.
- **An Exit polls tab on the 2026 polling page.** For the Texas Senate and
  Governor races it sets the Edison Research exit poll (published by CNN, ABC
  News, CBS News and NBC News) beside AP VoteCast, group by group: each
  group's share of voters, the Democratic and Republican shares of its vote,
  the margin, and the spread between the two surveys. Every figure carries the
  time its source released it and a link back, and a second table follows a
  group through the night as the surveys are reweighted. The surveys are not
  averaged, because they reach voters differently, and B-59 shows only a fixed
  set of headline groups, credited to each source, not the full crosstabs.
- **A Demographics tab in the 2026 election analysis**, built only from
  public sources: a county map of Texas that shades by early turnout, early
  vote against 2022, Hispanic-surname voters or Hispanic residents; a table of
  Hispanic-surname registration and turnout since 2016; and each county's
  residents by race, ethnicity, sex and age from the Census Bureau's 2024
  estimates.
- Every county table sorts by any column: click a header for highest first,
  again for lowest, and a third time for the default order.
- **The election analysis covers every Texas county.** All 254 are in every
  table. The state's row stays pinned under the column headers, Travis comes
  next as the benchmark, then the 17 focus counties, then every other county
  by 2024 population. Each county's numbers come from the same sources as
  before; the 17 counties' figures are unchanged.
- **A win calculator in the Studio menu, behind a password.** Campaign teams
  can set the Democratic share in each focus county and see what the rest of
  the state would need. The page is kept out of search engines and the
  sitemap, and stays locked until a password is configured.
- The headline chart can compare the early vote with all of 2024 as well as
  all of 2022.
- **A Research section, and its first page: the 2026 Texas election
  analysis.** A new Research menu in the header and the phone menu leads to a
  turnout analysis for 17 Texas target counties, with Travis and the state as
  benchmarks: the 2026 early vote, election-day counts from the county
  trackers, primaries since 2014, down-ballot margins against the top of the
  ticket, and every statewide race on one table. The site rereads the tracker
  counts every 15 minutes. A win calculator lets a reader set each county's
  Democratic share and see what the rest of the state would need; any win
  numbers they type stay in their browser and are never saved or sent. The
  analysis itself is in English; in the other four languages the menu is
  translated and the page says so.

### Changed

- **The 2026 election analysis now sets the live count against the whole
  2024 election, not just its election day.** Each county's hourly table
  shows every ballot cast so far, early vote included, beside 2024's total at
  the same hour, ending on 2024's final count. The tracker table adds each
  county's share of its 2024 total and the whole-election comparison at the
  same hour, next to the election-day-only one, and the main turnout table
  adds a "% of 2024 total" column for the live counties.
- The headline chart is one bar per place again: the 2026 early vote as a
  share of all 2022 ballots, the last midterm, so the comparison is like for
  like. The 2024 presidential comparison moves into the sentence above it and
  stays in the tables.
- On a wide screen the county map's measure selector and shading key sit in
  a column to the left of the map; on a phone they stay above it.
- The headline chart draws two plain lines for each place, one for its
  share of 2022 turnout and one for 2024, each labelled with its value, with
  the state as a whole on top. It replaces the shaded bar with a mark across
  it, which was hard to read.
- County tables open on Travis, the counties with a live election-day
  tracker and the 17 focus counties, with every other county a button away,
  so the page no longer runs to 250 rows.
- The headline chart shows the 2024 comparison as a second line on each
  county's bar, in place of the switch between 2022 and 2024.
- On phones, a table wider than the screen scrolls in its own box so its
  header, the Statewide row and the county column stay in view.
- The margin-over-time chart opens on the state as a whole, and its place
  picker is grouped by geography: the state, Travis, then the border, metro,
  suburban and rural focus counties, then every other county by size.
- Hovering a bar or a table row highlights it in B-59 blue.
- **The 2026 election analysis reads as research now.** It opens with a
  byline, a publication date and a link to a new Method and sources section,
  which names the 17 counties and explains each measure. A ranked chart of
  each county's early vote against its whole 2022 turnout comes before any
  table. The main table is shorter, names the source of each column group,
  and scrolls with the page instead of capturing the scroll; the full
  breakdown moved to a Turnout history tab. Turnout is shaded in grey, with
  blue and red kept for partisan measures. Abbreviations are spelled out.

### Removed

- The win calculator is no longer part of the public analysis; it moved to
  the Studio menu, behind a password.
- 2014 results are gone from the analysis while their accuracy is checked.

### Fixed

- The Method section said five of the 17 focus counties publish a tracker;
  four do (Bell, Montgomery, Ellis and Hockley).

## 2026-09-11

### Changed

- The privacy policy's processor list now names three providers rather than
  four. Vercel's role widens from hosting to hosting and analytics, and
  Plausible leaves the list, since it never processed any data. Updated in
  all five languages. Still cookieless, still no banner.

### Removed

- **The Donate page is down.** `/donate` returns "page not found" rather than a
  form, and the Donate action is gone from the header, the phone menu, the
  footer and the site map. Unlinking it would not have been enough on its own —
  a bookmark or a search result would still have opened a working checkout — so
  the page itself refuses, and the search engines are told it is gone. Monthly
  donations already set up are not affected: taking the page down stops new
  contributions from starting, not ones already running. The page, the form and
  the payment plumbing are untouched and still build, so bringing donations back
  is a one-line change rather than a rebuild.

### Fixed

- Pageview analytics work again. The site has recorded no traffic since
  2026-08-10: Vercel Analytics was removed that day in favour of Plausible,
  but the Plausible site was never created, so its script — which only loads
  when its domain is configured — never rendered. Vercel Analytics is
  restored as the pageview measure.

## 2026-09-10

### Changed

- **The studio says who it works for.** B-59 works with progressives, and the
  site now says so instead of claiming neutrality. The brand philosophy's
  closing section is "Progressive by choice" rather than "Neutral by default",
  and no longer offers to work across the political spectrum; the About page's
  mission names the movement it serves in place of the line disclaiming any
  political ideology, and drops "neutrality" from the three things the work is
  done with. The craft commitment underneath is unchanged and still stated: the
  job is to make the client's message land, not to insert ours. In all five
  languages.

- **Copy that pointed at the section went with it.** Our Work's introduction
  and its search-result description no longer promise selected client work, the
  Solutions menu's Our Work label reads "The products we build and run" instead
  of leading with case studies, and Jon's biography on the Team page names the
  client work without sending the reader to a menu section that is not there.
  In all five languages.

### Removed

- **Case Studies is off the site for now.** The Travis County VDR Toolkit,
  Voter Registration Palooza and Merch no longer appear on Our Work, in the
  Solutions menu, or in the phone panel. The pages themselves are untouched and
  still resolve at their own URLs — they are unlinked rather than deleted, the
  same way the brand portfolio is, so bringing the section back is uncommenting
  it.

### Fixed

- **The phone menu scrolls.** On a shorter phone the menu ran off the bottom of
  the screen and the links past the fold could not be reached at all — the
  header is fixed, so there was nothing to scroll. The panel now stops at the
  bottom of the screen and scrolls its own overflow, and a flick at the end of
  the list no longer drags the page behind it.
- **Everything in the menu is a thumb-sized target.** The links, the language
  and theme controls at the foot of the panel, the language options, and the
  menu button itself — which was 24×24, the smallest thing on the site — now
  all meet the 44px minimum. The same floor reaches the About menu and the
  footer's link columns, which were 16px tall. The glyphs are unchanged; it is
  the pressable area around them that grew.

## 2026-09-07

### Added

- **Hebrew and Hindi** in the language selector, alongside English, Spanish and
  Chinese. Every page, the donation form and both legal pages are translated;
  the legal pages carry the same notice as Spanish and Chinese that the English
  text is the binding one. Hebrew is the site's first right-to-left language, so
  the page now declares its writing direction and the layout mirrors with it:
  menus, the quote rule, list indents and the donation amount prefix all sit on
  the reading side rather than the left.
- **Our Inspirations** (`/about/inspirations`): the two examples the studio
  takes its bearings from. Audrey Tang, who went from g0v civic hacker and
  Sunflower Movement protester to Taiwan's first digital minister by building
  better government websites, and met COVID with open data; and 18F, whose
  shutdown in March 2025 did not take its methods with it.
- A **Team** page (`/about/team`). One member, for now, with a slot for a
  portrait once there is one.
- **Merch** (`/solutions/brand-design/merch`): the stickers, shirts and print
  designed for the groups we work with, starting with a die-cut sticker for the
  Pflugerville Area Democrats. It sits under Case Studies in both header menus
  and on Our Work, with a hang-tag mark of its own.

### Changed

- The About menu now lists Our Story, Our Inspirations, Team and Brand Design
  Philosophy in that order, in the header, the phone panel, the footer and the
  sitemap page.
- The language selector and the light/dark toggle moved off the header bar into
  the footer and the foot of the phone menu. The site opens in the reader's
  language and in their device's light or dark mode, and follows the device if
  it switches; the controls are there to override that, not to find it. A
  reader whose device is dark no longer sees a white flash before the page
  settles.

## 2026-09-03

### Added

- A case study for **Voter Registration Palooza**, the campaign site we built for
  Make Government Work PAC's statewide push to register Texans before the
  October 5 deadline. It sits beside the Travis County Toolkit under Case
  Studies — in both header menus, on Our Work, and in the sitemap — and carries a
  mark of its own: a map pin drawn around the blue dot that ends the campaign's
  wordmark, because the campaign is thousands of scattered events rather than one.

## 2026-08-22

### Added

- Every project now carries its mark beside its name — in the header menus, the
  mobile menu, the Our Work cards, and at the head of its own page. The Travis
  County case study, which has no logo of its own, gets a drawn one.
- Hotline's signal dot beats on the Hotline page: two beats then rest, stilled
  for anyone who has asked their system to reduce motion.
- The Hotline page gained a section on running an organization's rota — shifts,
  coverage, and hours becoming cost and an invoice.

### Changed

- The Hotline page now describes the product that ships. It had been selling a
  Cal.com-backed booking link; Hotline owns its calendar layer directly, and
  the page now names Google, Outlook, Apple iCloud and ICS feeds, and prices
  per organization rather than per seat.

### Fixed

- The Hotline page claimed "no Google required", written when Google was not a
  supported calendar. It is now a first-class one.

## 2026-08-10

### Added

- Error monitoring (Sentry) and pageview analytics (Plausible). Both are
  cookieless with no consent gate: no PII in error events, no cookie banner.
  Both appear in the privacy policy's processor list.

## 2026-07-19

### Changed

- Icon-only controls in the header — the language globe, the light/dark toggle,
  the mobile menu glyph — carry the brand blue in both themes.

## 2026-07-03

### Added

- Spanish and Mandarin translations of the whole site, alongside English.
- Sitemap routes are derived from the filesystem, so a new page can no longer
  ship missing from the sitemap.

### Changed

- Donate moved to the far right of the header, ahead of the language and theme
  controls.

### Fixed

- `www.b-59.com` is the canonical URL.
- Header submenu opacity.

## 2026-07-01

### Added

- Hotline, as a solution page.
- Our Work — a single page collecting the civic products and the client case
  studies.

### Changed

- Studio and About navigation restructured.
- The B-59 wordmark renders consistently everywhere the name appears, with the
  hyphen in brand blue and no line break through it.

### Fixed

- The social share card renders the real header wordmark.

## 2026-06-30

### Added

- A proper 1200×630 social share card.
- The Travis County VDR Toolkit case study, under a Voting section.

### Changed

- The v2 wordmark replaces the old logo in share metadata.

## 2026-06-27

### Added

- A brand-design section, and the Studio mega-menu in the header.

## 2026-06-25

### Changed

- Refreshed site icon, and the v2 wordmark cropped for the header.

## 2026-06-21

### Added

- Donations, via Stripe hosted Checkout.

### Changed

- The dark theme's surface moved from charcoal to near-black.

### Fixed

- A malformed site URL in configuration no longer fails the build.

## 2026-06-20

### Changed

- The footer is grouped into columns.

## 2026-06-11

### Added

- ready2vote, as a solution page, and a Solutions dropdown in the navigation.

### Changed

- Callouts lost the left accent bar in favour of a tinted panel.

## 2026-05-28

### Added

- GitHub and LinkedIn links in the footer.
- Initial public release.
