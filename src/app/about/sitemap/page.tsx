import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sitemap",
  description:
    "Navigate B-59's website. Links to our home page, about us, privacy policy, and terms of use. Human-centered design and civic technology.",
  alternates: { canonical: "/about/sitemap" },
  openGraph: {
    title: "Sitemap | B-59",
    description: "Find your way around B-59. Home, about, and legal pages.",
    url: "/about/sitemap",
  },
};

const siteLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/about/privacy", label: "Privacy Policy" },
  { href: "/about/terms", label: "Terms of Use" },
] as const;

export default function SiteMap() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h1 className="heading-xl mb-4">Sitemap</h1>
      <p className="body-lg text-secondary mb-8 max-w-2xl">
        Public pages on b-59.com. Reach out at{" "}
        <a href="mailto:contact@b-59.com" className="text-b59-blue underline">
          contact@b-59.com
        </a>
        .
      </p>
      <ul className="space-y-3">
        {siteLinks.map(({ href, label }) => (
          <li key={href}>
            <Link href={href} className="nav-link text-lg">
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <p className="body-md text-secondary mt-8">
        <span className="text-secondary">Not linked in navigation:</span>{" "}
        <Link href="/work" className="text-b59-blue underline">
          Work
        </Link>{" "}
        (placeholder, in progress).
      </p>
    </div>
  );
}
