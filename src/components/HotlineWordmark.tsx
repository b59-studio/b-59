import type { CSSProperties } from "react";

/**
 * Hotline's wordmark: lowercase `hotline` in Geist 700, outlined, with the
 * signal dot standing in for the i's tittle. Use it wherever the site shows
 * Hotline's name as its logo — the header menus, the product cards, and the
 * head of the Hotline page — the way ready2vote's name is set with its blue 2.
 * Body copy, metadata and alt text keep the plain word.
 *
 * The geometry and the live level are Hotline's own (its wordmark spec, level
 * 2). Of its six levels the site needs two, and they follow its rules:
 *
 * - **At rest** — the default, and the only level for chrome or anything set
 *   small. No halos, no motion.
 * - **Live** — the marketing-hero level: two still halos, the brand heartbeat
 *   on the dot, one ripple. One loop per view, so use it on the Hotline page's
 *   hero and nowhere else. Under reduced motion it stops on its halos, which
 *   are the still frame and stay legible on their own.
 *
 * The SVG's box is the letters alone; halos and ripple paint outside it
 * (`overflow: visible`), so the live level never moves the layout.
 *
 * The name reaches assistive tech as text, and the drawing is hidden, so a link
 * or heading built around the wordmark is named "Hotline" exactly as before.
 *
 * Colours are Hotline's — its ink for the letters, its Signal Red for the dot —
 * and switch with the site's theme in globals.css.
 */
export interface HotlineWordmarkProps {
  /** Play the live level. Hotline page hero only. */
  live?: boolean;
  /**
   * Height of the letters' box. Default 0.82em: the ascenders reach 71 of the
   * box's 81.6 units, which lands them at about the cap height of the text
   * around the wordmark.
   */
  height?: string;
  className?: string;
  style?: CSSProperties;
}

const PATH =
  "M0 0V-71H15V-41.1L13 -41.1Q13.8 -45.8 16.2 -48.8Q18.5 -51.8 22.1 -53.3Q25.6 -54.8 29.8 -54.8Q35.8 -54.8 39.8 -52.2Q43.9 -49.6 45.9 -45Q48 -40.4 48 -34.5V0H33V-30.9Q33 -36.9 31.1 -39.9Q29.2 -42.9 24.9 -42.9Q20.3 -42.9 17.6 -39.8Q15 -36.7 15 -30.5V0ZM83.2 1.2Q75 1.2 68.8 -2.3Q62.7 -5.7 59.3 -12Q55.9 -18.3 55.9 -26.8Q55.9 -35.3 59.3 -41.6Q62.7 -47.8 68.8 -51.3Q75 -54.8 83.2 -54.8Q91.4 -54.8 97.5 -51.3Q103.6 -47.8 107 -41.6Q110.4 -35.3 110.4 -26.8Q110.4 -18.3 107 -12Q103.6 -5.7 97.5 -2.3Q91.4 1.2 83.2 1.2ZM83.2 -10.3Q88.8 -10.3 91.8 -14.7Q94.9 -19 94.9 -26.8Q94.9 -34.6 91.8 -38.9Q88.8 -43.3 83.2 -43.3Q77.5 -43.3 74.5 -38.9Q71.4 -34.6 71.4 -26.8Q71.4 -19 74.5 -14.7Q77.5 -10.3 83.2 -10.3ZM139.3 0Q130.9 0 127 -3.9Q123.1 -7.7 123.1 -16.1V-66.2H138.1V-17.9Q138.1 -14 139.8 -12.6Q141.4 -11.2 144.8 -11.2H152.2V0ZM114.5 -42.4V-53.6H152.2V-42.4ZM174.5 0Q168 0 164.2 -3.3Q160.5 -6.6 160.5 -14V-71H175.5V-15.6Q175.5 -13.2 176.6 -12.2Q177.7 -11.2 179.8 -11.2H183.4V0ZM190 0V-53.6H205V0ZM217.7 0V-53.6H231.2L231.8 -37.9L230 -38.4Q230.7 -44.4 233.2 -48Q235.7 -51.6 239.3 -53.2Q243 -54.8 247.4 -54.8Q253.2 -54.8 257.3 -52.3Q261.4 -49.8 263.5 -45.2Q265.7 -40.7 265.7 -34.5V0H250.7V-29.5Q250.7 -33.8 250 -36.8Q249.2 -39.8 247.4 -41.3Q245.6 -42.9 242.4 -42.9Q237.8 -42.9 235.2 -39.4Q232.7 -36 232.7 -29.5V0ZM300.7 1.2Q292.5 1.2 286.4 -2.3Q280.3 -5.7 277 -12Q273.6 -18.3 273.6 -26.8Q273.6 -35.3 277 -41.5Q280.3 -47.8 286.3 -51.3Q292.4 -54.8 300.5 -54.8Q308.5 -54.8 314.4 -51.3Q320.4 -47.8 323.6 -41.3Q326.8 -34.8 326.8 -25.8V-22.8H289.1Q289.5 -16.4 292.6 -13.3Q295.8 -10.2 300.9 -10.2Q304.7 -10.2 307.3 -11.8Q309.9 -13.4 310.9 -16.7L326.1 -15.8Q323.9 -7.8 317.1 -3.3Q310.3 1.2 300.7 1.2ZM289.1 -32H311.5Q311.2 -37.9 308.2 -40.8Q305.2 -43.7 300.5 -43.7Q295.9 -43.7 292.8 -40.6Q289.8 -37.6 289.1 -32Z";

/** The tittle: centre and radius in the outline's units. */
const DOT = { cx: 197.5, cy: -69.68, r: 10.72 } as const;

/** The live level's still halos, as [radius in dot radii, opacity]. */
const LIVE_HALOS = [
  [1.7, 0.2],
  [2.6, 0.1],
] as const;

/** Tight box around the letters and the dot: x, y, width, height. */
const VIEWBOX = [0, -80.4, 326.8, 81.6] as const;

export function HotlineWordmark({ live, height = "0.82em", className, style }: HotlineWordmarkProps) {
  const [vx, vy, vw, vh] = VIEWBOX;
  const { cx, cy, r } = DOT;

  return (
    <span
      className={["hotline-wordmark", live ? "hotline-wordmark--live" : undefined, className]
        .filter(Boolean)
        .join(" ")}
      dir="ltr"
      style={style}
    >
      <span className="sr-only">Hotline</span>
      <svg
        viewBox={`${vx} ${vy} ${vw} ${vh}`}
        aria-hidden={true}
        focusable="false"
        style={{ height, width: "auto", aspectRatio: `${vw} / ${vh}` }}
      >
        {live &&
          LIVE_HALOS.map(([k, opacity]) => (
            <circle key={k} className="hotline-wordmark-signal" cx={cx} cy={cy} r={r * k} opacity={opacity} />
          ))}
        {live && <circle className="hotline-wordmark-signal hotline-wordmark-ripple" cx={cx} cy={cy} r={r} />}
        <path className="hotline-wordmark-ink" d={PATH} />
        <circle className="hotline-wordmark-signal hotline-wordmark-dot" cx={cx} cy={cy} r={r} />
      </svg>
    </span>
  );
}

export default HotlineWordmark;
