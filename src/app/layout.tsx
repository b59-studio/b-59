import type { Metadata } from "next";
import { BASE_OPEN_GRAPH, SHARE_IMAGE } from "@/lib/share-card";
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
    "B-59 Studio is a civic technology design and strategy studio in Austin, Texas. We build civic software, publish Texas election research, and advise on complex decisions.",
  keywords: [
    "B-59 Studio",
    "civic technology",
    "Austin, Texas",
    "Texas election research",
    "election data",
    "voter registration",
    "design and strategy studio",
  ],
  authors: [{ name: "B-59" }],
  creator: "B-59",
  openGraph: {
    ...BASE_OPEN_GRAPH,
    title: "B-59 — Human-Centered",
    description:
      "Human-centered design and strategy. We build civic technology, advise on complex decisions, and make things that matter.",
  },
  // No title or description here: pages never override `twitter`, so anything
  // set here would label every page. Without them X reads each page's og:title.
  twitter: {
    card: "summary_large_image",
    images: [SHARE_IMAGE],
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
