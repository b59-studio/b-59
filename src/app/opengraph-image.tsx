import { ImageResponse } from "next/og";

/**
 * Sitewide share card. Next serves this as both the OpenGraph and Twitter
 * image, so link previews render a proper 1200x630 card instead of the square
 * logo. Mirrors the brand: near-black surface, the B-59 wordmark with a blue
 * hyphen, and the studio tagline.
 */
export const alt = "B-59 — Human-centered design and strategy";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const DARK = "#0A0A0A";
const LIGHT = "#FFFFFF";
const BLUE = "#0066FF";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          backgroundColor: DARK,
          padding: "96px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 260,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            color: LIGHT,
            lineHeight: 1,
          }}
        >
          B<span style={{ color: BLUE }}>-</span>59
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 36,
            fontSize: 46,
            fontWeight: 500,
            color: "#E5E7EB",
          }}
        >
          Human-centered design &amp; strategy
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 56,
            height: 8,
            width: 220,
            backgroundColor: BLUE,
            borderRadius: 4,
          }}
        />
      </div>
    ),
    { ...size }
  );
}
