import Image from "next/image";
import type { CSSProperties } from "react";

/**
 * The small identifying mark that sits beside a project's name — in the header
 * menus, on the Our Work cards, and at the head of each project page.
 *
 * The rule this component encodes: **a project shows its own logo where it has
 * one, and a B-59 blue glyph where it doesn't.** ready2vote has a star and
 * Hotline has its signal dot; the two case studies have no mark of their own,
 * so each gets one drawn in the house accent rather than no mark at all —
 * a row of names where only some carry art reads as an oversight.
 *
 * Marks are decorative: every place one appears, the project's name is right
 * next to it, so the mark is hidden from assistive tech and adds no second
 * announcement of the same thing.
 *
 * No hooks or state — this renders from both server and client components.
 */
export type ProjectKey =
  | "ready2vote"
  | "hotline"
  | "travis-county-vdr"
  | "voter-registration-palooza"
  | "merch";

export interface ProjectMarkProps {
  project: ProjectKey;
  /** Rendered box in px, square. Default 24 — the menu/card size. */
  size?: number;
  className?: string;
  style?: CSSProperties;
}

function HotlineMark({ size, className, style }: Omit<ProjectMarkProps, "project">) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      aria-hidden={true}
      focusable="false"
      className={["hotline-mark", className].filter(Boolean).join(" ")}
      style={{ flexShrink: 0, ...style }}
    >
      {/* Hotline's signal dot: a solid Signal Red core inside a soft glow ring.
          The red is Hotline's brand, not a second B-59 accent — a product logo
          carries its product's color, the way the ready2vote star carries the
          house blue because that is ready2vote's own mark. Same red as the
          wordmark's tittle in either theme, since the two sit side by side. */}
      <circle className="hotline-wordmark-signal" cx="36" cy="36" r="32" fillOpacity="0.15" />
      <circle className="hotline-wordmark-signal" cx="36" cy="36" r="18" />
    </svg>
  );
}

function VdrToolkitMark({ size, className, style }: Omit<ProjectMarkProps, "project">) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      aria-hidden={true}
      focusable="false"
      className={className}
      style={{ flexShrink: 0, ...style }}
    >
      {/* No client logo to use, so the case study gets a house glyph: a
          completed form. It is the toolkit's whole job — a registration
          application checked off and on its way to the county. */}
      <g
        fill="none"
        stroke="var(--color-b59-blue)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="9" y="9" width="54" height="54" rx="15" />
        <path d="M23 36.5 32 45.5 49.5 27" />
      </g>
    </svg>
  );
}

function PaloozaMark({ size, className, style }: Omit<ProjectMarkProps, "project">) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      aria-hidden={true}
      focusable="false"
      className={className}
      style={{ flexShrink: 0, ...style }}
    >
      {/* The Palooza's own mark is the blue dot that ends its wordmark — a
          period, not a logo, and a period alone would be Hotline's signal dot
          in a different color. So the dot keeps its place and a house glyph is
          drawn around it: a map pin, because the campaign is not one event but
          thousands of them, scattered across Texas against a single deadline. */}
      <path
        d="M36 65C36 65 55 45.5 55 29A19 19 0 1 0 17 29C17 45.5 36 65 36 65Z"
        fill="none"
        stroke="var(--color-b59-blue)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="36" cy="29" r="6" fill="var(--color-b59-blue)" />
    </svg>
  );
}

function MerchMark({ size, className, style }: Omit<ProjectMarkProps, "project">) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      aria-hidden={true}
      focusable="false"
      className={className}
      style={{ flexShrink: 0, ...style }}
    >
      {/* Merch is a shelf of other people's marks, so it cannot borrow any one
          of them. The house glyph is a hang tag — the thing every piece on the
          page arrived wearing — with the eyelet drawn solid so it reads at
          20px. */}
      <path
        d="M12 12h23.5a4 4 0 0 1 2.83 1.17l24.5 24.5a4 4 0 0 1 0 5.66L45.33 60.83a4 4 0 0 1-5.66 0l-24.5-24.5A4 4 0 0 1 14 33.5V14a2 2 0 0 1 2-2Z"
        fill="none"
        stroke="var(--color-b59-blue)"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <circle cx="25" cy="25" r="4.5" fill="var(--color-b59-blue)" />
    </svg>
  );
}

export function ProjectMark({ project, size = 24, className, style }: ProjectMarkProps) {
  if (project === "hotline") {
    return <HotlineMark size={size} className={className} style={style} />;
  }

  if (project === "travis-county-vdr") {
    return <VdrToolkitMark size={size} className={className} style={style} />;
  }

  if (project === "voter-registration-palooza") {
    return <PaloozaMark size={size} className={className} style={style} />;
  }

  if (project === "merch") {
    return <MerchMark size={size} className={className} style={style} />;
  }

  return (
    <Image
      src="/ready2vote-star.svg"
      alt=""
      aria-hidden={true}
      width={size}
      height={size}
      className={className}
      style={{ flexShrink: 0, ...style }}
    />
  );
}

export default ProjectMark;
