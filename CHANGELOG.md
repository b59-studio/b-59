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
- **Case Studies is off the site for now.** The Travis County VDR Toolkit,
  Voter Registration Palooza and Merch no longer appear on Our Work, in the
  Solutions menu, or in the phone panel. The pages themselves are untouched and
  still resolve at their own URLs — they are unlinked rather than deleted, the
  same way the brand portfolio is, so bringing the section back is uncommenting
  it.

### Changed

- **Copy that pointed at the section went with it.** Our Work's introduction
  and its search-result description no longer promise selected client work, the
  Solutions menu's Our Work label reads "The products we build and run" instead
  of leading with case studies, and Jon's biography on the Team page names the
  client work without sending the reader to a menu section that is not there.
  In all five languages.

## 2026-09-10

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

## 2026-09-08

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
