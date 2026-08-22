import Image from "next/image";
import type { CSSProperties } from "react";

/**
 * The small identifying mark that sits beside a project's name — in the header
 * menus, on the Our Work cards, and at the head of each project page.
 *
 * The rule this component encodes: **a project shows its own logo where it has
 * one, and a B-59 blue glyph where it doesn't.** ready2vote has a star and
 * Hotline has its signal dot; the Travis County case study has no mark of its
 * own, so it gets one drawn in the house accent rather than no mark at all —
 * a row of names where only some carry art reads as an oversight.
 *
 * Marks are decorative: every place one appears, the project's name is right
 * next to it, so the mark is hidden from assistive tech and adds no second
 * announcement of the same thing.
 *
 * No hooks or state — this renders from both server and client components.
 */
export type ProjectKey = "ready2vote" | "hotline" | "travis-county-vdr";

export interface ProjectMarkProps {
  project: ProjectKey;
  /** Rendered box in px, square. Default 24 — the menu/card size. */
  size?: number;
  /**
   * Hotline only: play the mark's heartbeat — two beats, then rest, with a
   * ripple riding out on the first. This is Hotline's own hero treatment for
   * its logo, and it is opt-in for the reason Hotline makes it opt-in: a mark
   * that breathes says "the line is open", and a page carrying several of them
   * at once says only that something is loading. Use it on the Hotline page's
   * hero mark and nowhere else. It is a no-op under reduced motion, where the
   * mark keeps its static glow and stays exactly as legible.
   */
  beat?: boolean;
  className?: string;
  style?: CSSProperties;
}

function HotlineMark({ size, beat, className, style }: Omit<ProjectMarkProps, "project">) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      aria-hidden={true}
      focusable="false"
      className={[className, beat ? "hotline-mark--beat" : undefined]
        .filter(Boolean)
        .join(" ")}
      style={{ flexShrink: 0, ...style }}
    >
      {/* Hotline's signal dot: a solid Signal Red core inside a soft glow ring.
          The red is Hotline's brand, not a second B-59 accent — a product logo
          carries its product's color, the way the ready2vote star carries the
          house blue because that is ready2vote's own mark. */}
      <circle cx="36" cy="36" r="32" fill="#E5392B" fillOpacity="0.15" />
      {/* The ripple that rides out on the first beat. It rests at zero opacity,
          so with no beat — and under reduced motion, where the animation is
          removed — it is simply not there and the mark is the glow and the
          core, unchanged. Sized to stay inside the box: a mark that painted
          outside its own square would collide with whatever sits beside it. */}
      <circle className="hotline-mark-ripple" cx="36" cy="36" r="14" fill="#E5392B" />
      <circle className="hotline-mark-core" cx="36" cy="36" r="18" fill="#E5392B" />
    </svg>
  );
}

function VdrToolkitMark({ size, className, style }: Omit<ProjectMarkProps, "project" | "beat">) {
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

export function ProjectMark({ project, size = 24, beat, className, style }: ProjectMarkProps) {
  if (project === "hotline") {
    return <HotlineMark size={size} beat={beat} className={className} style={style} />;
  }

  if (project === "travis-county-vdr") {
    return <VdrToolkitMark size={size} className={className} style={style} />;
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
