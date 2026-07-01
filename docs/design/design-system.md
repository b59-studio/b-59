# B-59 — civic design system (base)

> **Shared civic base design language** for B-59's civic / public-interest products. Source of truth
> lives in the-department at `design-systems/b59/`; it syncs into each member repo's
> `docs/design/design-system.md` (see `design-systems/README.md` and the group's `targets.conf`).
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

Default background is **white** (`--color-b59-light`); dark mode inverts to `--color-b59-dark`. Dark mode
is system-following with an explicit toggle (per `standards/25`), unless a product overrides.

## Components

- **Callouts** — boxed panels: a soft tint of the callout color as fill, a full 1px border in the same
  color at low opacity, even padding, rounded corner. **No left-accent bar, no content indent**
  (`standards/25`). Variants: `.callout-blue` (info), `.callout-gray` (neutral), `.callout-red` /
  `.callout-alert` (critical).
- **Buttons** — `.btn-primary` (outline: theme border + text, blue on hover) and `.btn-secondary`
  (blue fill, white text). Every interactive element keeps a visible `:focus-visible` outline.
- **Forms** — `.form-input` with a gray border, blue focus ring; `.form-label` bold; errors via
  `aria-invalid` + a `.form-error`/alert message, never color alone.

## Do / Don't

**Do** — keep the blue rationed (one accent, not a flood); default to white/neutral surfaces; use the type
scale as-is; design empty/loading/error states with the same care as content.
**Don't** — introduce a second accent color; build left-accent-bar callouts; add gradients or drop shadows
as decoration; use `--color-b59-alert` for anything but errors.

## Accessibility

- Ink (`#0A0A0A`) on white passes AA comfortably; `--color-b59-gray` on white is secondary-text only.
- Blue `#0066FF` as **link/small text on white is ~3.7:1 — below AA**; for small blue text use a darker
  blue or pair with an underline + non-color cue. Verify button contrast (white-on-blue is borderline).
- Full WCAG 2.2 AA review is the `a11y-reviewer`'s job — this section captures the brand-level decisions.

## References

- `b-59/src/app/globals.css` — canonical implementation (the law for what ships).
- `standards/25-product-taste.md` — the generic design philosophy this base sits inside.
- `templates/design-system/` — the scaffold, if a product needs to author its own override.
