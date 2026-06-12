import Link from "next/link";
import { Brand } from "@/components/Brand";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer-container">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="flex flex-wrap justify-center items-baseline gap-x-2 gap-y-1">
            <span className="text-xl font-bold footer-heading">
              <Brand /> Studio
            </span>
            <span className="footer-text" aria-hidden="true">
              {" "}
              /{" "}
            </span>
            <span className="footer-text">
              <i>
                Deliberate design <span className="text-b59-blue">for</span>{" "}
                imperfect systems
              </i>
              .
            </span>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1 text-sm footer-text">
            <Link href="/about/privacy" className="footer-link">
              Privacy Policy
            </Link>
            <span aria-hidden="true"> / </span>
            <Link href="/about/terms" className="footer-link">
              Terms
            </Link>
            <span aria-hidden="true"> / </span>
            <a href="mailto:contact@b-59.com" className="footer-link">
              contact@b-59.com
            </a>
            <span aria-hidden="true"> / </span>
            <a href="https://github.com/b59-studio" className="footer-link">
              GitHub
            </a>
            <span aria-hidden="true"> / </span>
            <a href="https://www.linkedin.com/company/b59studio" className="footer-link">
              LinkedIn
            </a>
            <span aria-hidden="true"> / </span>
            <span>Austin, TX USA</span>
          </div>

          <div className="footer-text text-sm">
            © {year}{" "}
            <span className="font-bold">
              <Brand /> Studio LLC
            </span>
            . All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
