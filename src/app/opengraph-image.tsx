import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/**
 * Sitewide share card. Next serves this as both the OpenGraph and Twitter
 * image, so link previews render a proper 1200x630 card instead of the square
 * logo. It embeds the same wordmark asset the header uses (the light variant,
 * for the dark card surface) so the card can never drift from the real logo.
 */
export const alt = "B-59 — Human-centered design and strategy";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const DARK = "#0A0A0A";

// The header wordmark, cropped tight (viewBox 452 721 1016 478 → ~2.126:1).
const LOGO_WIDTH = 720;
const LOGO_HEIGHT = Math.round((LOGO_WIDTH * 478) / 1016);

export default async function OpengraphImage() {
  const svg = await readFile(join(process.cwd(), "public", "v2-yeah-light.svg"));
  const logoSrc = `data:image/svg+xml;base64,${svg.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: DARK,
        }}
      >
        <img src={logoSrc} width={LOGO_WIDTH} height={LOGO_HEIGHT} alt="B-59" />
        <div
          style={{
            display: "flex",
            marginTop: 44,
            fontSize: 42,
            fontWeight: 500,
            color: "#E5E7EB",
          }}
        >
          Human-centered design &amp; strategy
        </div>
      </div>
    ),
    { ...size }
  );
}
