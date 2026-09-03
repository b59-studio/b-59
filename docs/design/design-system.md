# B-59 — civic design system (base)

> **Shared civic base design language** for B-59's civic / public-interest products. This file is
> synced from a shared upstream source of truth into each member repo's
> `docs/design/design-system.md` — treat the synced copy as read-only and make changes upstream.
> Canonical implementation: `b-59/src/app/globals.css`.
>
> **Default + override model.** A civic B-59 app uses this base **unless it specifies its own**. An app
> with its own design system (e.g. **hotline** — the Live Signal System) is **not** in this group's
> `targets.conf`; it keeps its own `docs/design/design-system.md` and overrides the **color scheme +
> display font**, but still **inherits the body font (Public Sans) and the type scale** from this base —
> that shared civic body type is the point of the standard.

## The one idea

**Calm, trustworthy, plain.** B-59 civic products read as institutional but human — clear hierarchy,
generous whitespace, one confident accent. Nothing decorative competes with the content or the action.

## Type

- **Body / UI — Public Sans** (the US Web Design System face). The **shared civic body standard** across
  every B-59 civic product. Neutral, screen-legible at small sizes, trustworthy. Replaces ad-hoc system
  fonts. Wire via `next/font/google` (`Public_Sans`); self-hostable, open-source.
- **Display / headings** — per product. The base default is Public Sans for headings too (one clean
  family); a product may override with its own display face (hotline → **Geist**).
- **Type scale** (mathematical; do not invent intermediate sizes):

  | Class | Size | Weight | Line height |
  | --- | --- | --- | --- |
  | `.heading-xl` | 3.5rem / 56px | 700 | 1.1 |
  | `.heading-lg` | 2rem / 32px | 700 | 1.2 |
  | `.heading-md` | 1.5rem / 24px | 600 | 1.3 |
  | `.heading-sm` | 1.125rem / 18px | 600 | 1.4 |
  | `.body-lg` | 1.125rem / 18px | 400 | 1.7 |
  | `.body-md` | 1rem / 16px | 400 | 1.6 |
  | `.body-sm` | 0.875rem / 14px | 400 | 1.5 |

## Color

Defined at `@theme` scope (Tailwind v4) in `globals.css` — reference the tokens, never hardcode hex.

- `--color-b59-dark` `#0A0A0A` — primary text; dark-mode background.
- `--color-b59-light` `#FFFFFF` — page background; text on dark.
- `--color-b59-gray` `#4A5568` — secondary text, captions, borders.
- `--color-b59-blue` `#0066FF` — **the accent.** Links, primary action, focus, active state. The one
  color that carries attention — keep it rationed.
- `--color-b59-alert` `#FF3333` — errors / warnings only. Never decorative.
- `--color-b59-yellow` `#FFC400` — **the second action's fill.** Not a second
  accent: it has exactly one job, described below, and it is not a status colour.

Default background is **white** (`--color-b59-light`); dark mode inverts to `--color-b59-dark`. Dark mode
follows the reader's device with an explicit toggle that wins once pressed (per `standards/25`) — on the
marketing site as well as behind a login.

### The yellow, and the edge it always carries

Blue is the accent and it carries the primary action. The yellow exists for the case blue cannot serve:
a **second action aimed at a different reader** — the visitor who is not ready for the primary ask and
needs a different door. On a voter registration site, "sign up to hold an event" is blue and "you are not
deputized yet, start here" is yellow: two audiences, not two options for one audience.

**At most one yellow control per surface, and never in the header.** The header's one-filled-control rule
is absolute — a bar with a blue button and a yellow button has no primary action. Below the fold, on a
page that genuinely serves two readers, the second fill earns its place. Everything else stays the
outline treatment.

**Yellow is never a status colour.** Warnings and errors are `--color-b59-alert` with a label and an icon
(`standards/05`, SC 1.4.1). A yellow that sometimes means "caution" and sometimes means "start here"
means neither.

**And it always ships with an ink edge, for a measured reason.** `#FFC400` carries near-black text at
12.4:1, so the *label* is never the problem. But the fill is only **1.6:1 against white** — far under the
3:1 that WCAG 1.4.11 requires of the boundary identifying a control — so on a white page a borderless
yellow button is a shape a low-vision reader cannot find. A 2px edge in `--color-b59-dark` is 19:1 and
fixes it outright. Reaching for a darker yellow instead does not work: nothing that clears 3:1 against
white is still recognisably yellow — it lands in brown — which is why the edge is the rule rather than a
different hex.

The edge is a **control affordance, not a box** (`standards/44` carve-out 2), and it stays constant across
themes: on the dark ground the fill already separates at 12.4:1, and an ink edge there is simply
invisible rather than wrong.

## Wordmark

The **B-59** name is a wordmark, not plain text. In any **visible copy**, render it through the repo's
wordmark component — a small `<Brand />`-style span that sets the hyphen in `--color-b59-blue` and keeps
the name from wrapping across a line break. Never hand-type "B-59" with a plain hyphen in rendered copy;
the blue hyphen is a fixed brand rule everywhere the name is shown (headings, body, footer, legal text).
Canonical implementation: `b-59/src/components/Brand.tsx`. A product wordmark follows the same pattern —
one character in the brand blue, no wrap (ready2vote's `<Ready2Vote />` sets the numeral 2 in blue).

Scope: **rendered text only.** Metadata (`title`/`description`), `alt` text, structured data (JSON-LD), and
other string-only fields stay plain `"B-59"` — they can't carry markup and aren't the visual wordmark.

### The dash, exactly

Two rules, and both are structural rather than decorative — which is why they live in a component instead
of in each author's memory:

- **The hyphen is `--color-b59-blue`, in both themes.** It is a brand mark, not a text colour, so it does
  not flip with the theme. It is also the one place the accent is spent on a glyph inside running text;
  everything around it stays in the theme ink.
- **The name never breaks across a line** (`white-space: nowrap` on the wrapping span). "B-" at the end of
  one line and "59" at the start of the next is not the wordmark.

```tsx
// The canonical shape. One span for the nowrap, one for the blue character.
export function Brand() {
  return (
    <span className="brand">
      B<span className="text-b59-blue">-</span>59
    </span>
  );
}
```

```css
.brand { white-space: nowrap; }
```

**Contrast:** the blue hyphen sits below the 4.5:1 that small text needs, and that is accepted here on
purpose — it is a single punctuation glyph between two full-contrast characters, and the word is legible
without it carrying any information. Do not generalize the exemption to blue words, blue labels, or a blue
line of small text; those are text and they owe the full ratio (see `## Accessibility`).

A product wordmark follows the same pattern in its own product's page chrome — one character in the brand
blue, no wrap (ready2vote's `<Ready2Vote />` sets the numeral 2 in blue; a Make Government Work site sets
the closing period).

## Footer

The footer carries three things and one of them is a fixed rule.

- **The site's own wordmark**, rendered through its component.
- **Whatever the product owes its readers** — navigation, legal disclosures, contact. A prescribed legal
  string (a political advertising disclosure, a licence notice) is reproduced verbatim and is **not
  translated**; mark it with its own `lang` when the page around it is in another language.
- **The studio credit**, on every B-59-built product that is not b-59.com itself:

  > Powered by <Brand /> Studio

  Linked to `https://www.b-59.com`, with the name rendered through the wordmark component — the blue-dash
  rule holds here exactly as it does in a heading. This is the most common place the rule gets broken,
  because a credit line reads like a string rather than like a mark.

**The credit is subordinate chrome, not a call to action.** It sits in the secondary ink beside the legal
line — one row, side by side on desktop and stacked on a phone — and takes the accent only on hover and
focus, where it also gains an underline. A second filled or permanently-blue link in the footer competes
with the page's one primary action, which is the whole reason the accent is rationed. It is still a real
target: 44px minimum, like every other link in a stacked column.

Canonical implementation: `glen-website/src/components/footer.tsx` (`.credit-link` in its `globals.css`).

## Components

- **Callouts** — boxed panels: a soft tint of the callout color as fill, a full 1px border in the same
  color at low opacity, even padding, rounded corner. **No left-accent bar, no content indent**
  (`standards/25`). Variants: `.callout-blue` (info), `.callout-gray` (neutral), `.callout-red` /
  `.callout-alert` (critical).
- **Buttons** — the blue fill is the primary action; an outline in the theme ink is every other action;
  `--color-b59-yellow` with a 2px ink edge is the second action for a different reader, at most once per
  surface (see `## Color`). Every interactive element keeps a visible `:focus-visible` outline.
- **Forms** — `.form-input` with a gray border, blue focus ring; `.form-label` bold; errors via
  `aria-invalid` + a `.form-error`/alert message, never color alone.
- **Utility icons** — an icon-only utility control is set in `--color-b59-blue`, the same color in
  both themes, wherever it sits. The principle: when the icon **is** the control, it carries the
  accent (in b-59 today: the language-switcher globe, the light/dark theme toggle, the mobile
  menu/close glyph — examples of the system, not an exhaustive list). Text controls (nav links,
  the language name beside the globe) and glyphs that merely decorate a text control (dropdown
  chevrons) stay in the theme ink. This lives **inside** the "blue is rationed" rule, not outside
  it — a handful of small utility glyphs, never a tinted chrome.
  **Where they sit:** the language selector and the theme toggle live in the footer and at the
  bottom of the phone's menu panel, never on the header bar, whose right group is actions
  (`standards/33`, `standards/53`). Only the menu/close glyph is header chrome.
  Canonical implementation: `.theme-toggle-icon` / `.lang-switcher-icon` / `.mobile-menu-btn` in
  `b-59/src/app/globals.css`.

## Do / Don't

**Do** — keep the blue rationed (one accent, not a flood); default to white/neutral surfaces; use the type
scale as-is; design empty/loading/error states with the same care as content.
**Don't** — introduce a third color beyond the accent and the second-action yellow; use the yellow for
status, for more than one control on a surface, or without its ink edge; build left-accent-bar callouts; add gradients or drop shadows
as decoration; use `--color-b59-alert` for anything but errors.

## Accessibility

- Ink (`#0A0A0A`) on white passes AA comfortably; `--color-b59-gray` on white is secondary-text only.
- Blue `#0066FF` as **link/small text on white is ~3.7:1 — below AA**; for small blue text use a darker
  blue or pair with an underline + non-color cue. Verify button contrast (white-on-blue is borderline).
- The second-action yellow carries ink text at 12.4:1, but is 1.6:1 against white as a shape — it is only
  ever a fill with an ink edge, never a text colour, a border on its own, or an icon.
- Blue **icons** are fine in both themes: non-text contrast (WCAG 1.4.11) needs 3:1, and `#0066FF` is
  ~3.7:1 on white and ~4.1:1 on the dark ink. Icon-only controls still need an accessible name.
- Full WCAG 2.2 AA review is the `a11y-reviewer`'s job — this section captures the brand-level decisions.

## References

- `b-59/src/app/globals.css` — canonical implementation (the law for what ships).
- `standards/25-product-taste.md` — the generic design philosophy this base sits inside.
- `templates/design-system/` — the scaffold, if a product needs to author its own override.
