import type { Metadata } from "next";
import { resolveSiteUrl } from "@/lib/site-url";

const siteUrl = resolveSiteUrl();

// With i18n routing, the <html>/<body> shell lives in app/[locale]/layout.tsx;
// this root layout only carries global metadata and passes children through.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "B-59 Studio",
    template: "B-59 | %s",
  },
  description:
    "Human-centered design and strategy. We build civic technology, advise on complex decisions, and make things that matter. Public-first.",
  keywords: ["civic technology", "design", "strategy", "government", "public sector", "B-59"],
  authors: [{ name: "B-59" }],
  creator: "B-59",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "B-59",
    title: "B-59 — Human-Centered",
    description:
      "Human-centered design and strategy. We build civic technology, advise on complex decisions, and make things that matter.",
    // Share image is provided by the file-convention card at app/opengraph-image.tsx.
  },
  twitter: {
    card: "summary_large_image",
    title: "B-59 — Human-Centered",
    description:
      "Human-centered design and strategy. We build civic technology, advise on complex decisions, and make things that matter.",
    // Twitter image is derived from the same opengraph-image.tsx card.
  },
  icons: {
    icon: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
