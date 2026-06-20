import Link from "next/link";
import type { ReactNode } from "react";
import { Brand } from "@/components/Brand";

function FooterColumn({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <nav className="footer-col" aria-label={heading}>
      <h2 className="footer-col-heading">{heading}</h2>
      <ul className="footer-col-list">{children}</ul>
    </nav>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer-container">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="footer-brand">
            <span className="text-xl font-bold footer-heading">
              <Brand /> Studio
            </span>
            <p className="footer-text text-sm">
              <i>
                Deliberate design <span className="text-b59-blue">for</span>{" "}
                imperfect systems
              </i>
              .
            </p>
          </div>

          <FooterColumn heading="Studio">
            <li>
              <Link href="/about" className="footer-link">
                About
              </Link>
            </li>
            <li>
              <Link href="/solutions/ready2vote" className="footer-link">
                ready<span className="text-b59-blue">2</span>vote
              </Link>
            </li>
            <li>
              <Link href="/donate" className="footer-link">
                Donate
              </Link>
            </li>
          </FooterColumn>

          <FooterColumn heading="Connect">
            <li>
              <a href="mailto:contact@b-59.com" className="footer-link">
                contact@b-59.com
              </a>
            </li>
            <li>
              <a
                href="https://github.com/b59-studio"
                className="footer-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
                <span className="sr-only"> (opens in new window)</span>
              </a>
            </li>
            <li>
              <a
                href="https://www.linkedin.com/company/b59studio"
                className="footer-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
                <span className="sr-only"> (opens in new window)</span>
              </a>
            </li>
          </FooterColumn>

          <FooterColumn heading="Legal">
            <li>
              <Link href="/about/privacy" className="footer-link">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/about/terms" className="footer-link">
                Terms
              </Link>
            </li>
            <li>
              <Link href="/about/sitemap" className="footer-link">
                Sitemap
              </Link>
            </li>
          </FooterColumn>
        </div>

        <div className="footer-bottom">
          <p className="footer-text text-sm">
            © {year}{" "}
            <span className="font-bold footer-heading">
              <Brand /> Studio LLC
            </span>
            . All rights reserved.
          </p>
          <p className="footer-text text-sm">Austin, TX USA</p>
        </div>
      </div>
    </footer>
  );
}
