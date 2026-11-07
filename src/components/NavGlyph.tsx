import type { CSSProperties } from "react";

/**
 * The B-59 blue glyph that stands beside a menu link whose page is not a
 * product. Products carry their own logo (ProjectMark); everything else in a
 * menu gets one of these, so every row in a section reads the same way: mark,
 * name, summary.
 *
 * One set, one stroke weight: 24px outline paths at a 1.75 stroke, drawn in the
 * house accent. Decorative — the link's name is always beside it.
 */
export type GlyphKey = "calculator" | "turnout" | "polls" | "results" | "inspirations" | "team" | "organizing" | "petition";

const PATHS: Record<GlyphKey, string[]> = {
  calculator: [
    "M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z",
    "M8.5 7h7v3h-7z",
    "M8.5 14h.01M12 14h.01M15.5 14h.01M8.5 17.5h.01M12 17.5h.01M15.5 17.5h.01",
  ],
  turnout: ["M4 20h16", "M7 20v-6", "M12 20V8", "M17 20v-9"],
  polls: ["M12 3a9 9 0 1 0 9 9h-9V3Z", "M15 3.5A9 9 0 0 1 20.5 9H15V3.5Z"],
  results: ["M5 21V4", "M5 4h11l-2 4 2 4H5"],
  inspirations: [
    "M9 18h6",
    "M10 21h4",
    "M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z",
  ],
  team: [
    "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z",
    "M3 20a6 6 0 0 1 12 0",
    "M16 4.3a3.5 3.5 0 0 1 0 6.4",
    "M18 14.2A6 6 0 0 1 21 20",
  ],
  organizing: [
    "M4 10v4a1 1 0 0 0 1 1h2l6 4V5L7 9H5a1 1 0 0 0-1 1Z",
    "M16.5 9a4 4 0 0 1 0 6",
    "M19 6.5a7.5 7.5 0 0 1 0 11",
  ],
  petition: [
    "M9 3h6a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z",
    "M8 5H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2",
    "M9 14l2 2 4-4",
  ],
};

export function NavGlyph({
  glyph,
  size = 22,
  className,
  style,
}: {
  glyph: GlyphKey;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={true}
      focusable="false"
      className={["text-b59-blue", className].filter(Boolean).join(" ")}
      style={{ flexShrink: 0, ...style }}
    >
      {PATHS[glyph].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
