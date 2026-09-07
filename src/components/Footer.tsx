import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { ReactNode } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";

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

export default async function Footer() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");
  const year = new Date().getFullYear();

  return (
    <footer className="footer-container">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="footer-brand">
            <span className="text-xl font-bold footer-heading">
              B<span className="text-b59-blue">-</span>59 Studio
            </span>
            <p className="footer-text text-sm">
              <i>{t.rich("tagline", { blue: (chunks) => <span className="text-b59-blue">{chunks}</span> })}</i>
            </p>
            {/* One of the two homes for these; the other is the foot of the
                mobile menu. Neither belongs on the header bar. */}
            <div className="mt-6 flex items-center gap-2">
              <LanguageSwitcher placement="top" />
              <ThemeToggle />
            </div>
          </div>

          <FooterColumn heading={t("studioHeading")}>
            <li>
              <Link href="/about" className="footer-link">
                {tNav("ourStory")}
              </Link>
            </li>
            <li>
              <Link href="/about/inspirations" className="footer-link">
                {tNav("inspirations")}
              </Link>
            </li>
            <li>
              <Link href="/about/team" className="footer-link">
                {tNav("team")}
              </Link>
            </li>
            <li>
              <Link href="/studio" className="footer-link">
                {tNav("ourWork")}
              </Link>
            </li>
            <li>
              <Link href="/donate" className="footer-link">
                {tNav("donate")}
              </Link>
            </li>
          </FooterColumn>

          <FooterColumn heading={t("connectHeading")}>
            <li>
              <a href="mailto:contact@b-59.com" className="footer-link" dir="ltr">
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
                <span className="sr-only">{t("opensNewWindow")}</span>
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
                <span className="sr-only">{t("opensNewWindow")}</span>
              </a>
            </li>
          </FooterColumn>

          <FooterColumn heading={t("legalHeading")}>
            <li>
              <Link href="/about/privacy" className="footer-link">
                {t("privacyPolicy")}
              </Link>
            </li>
            <li>
              <Link href="/about/terms" className="footer-link">
                {t("terms")}
              </Link>
            </li>
            <li>
              <Link href="/about/sitemap" className="footer-link">
                {t("sitemap")}
              </Link>
            </li>
          </FooterColumn>
        </div>

        <div className="footer-bottom">
          <p className="footer-text text-sm">
            © {year}{" "}
            <span className="font-bold footer-heading">
              B<span className="text-b59-blue">-</span>59 Studio LLC
            </span>
            . {t("rightsReserved")}
          </p>
          <p className="footer-text text-sm">{t("location")}</p>
        </div>
      </div>
    </footer>
  );
}
