"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { MobileMenu } from "./MobileMenu";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTheme } from "./ThemeProvider";
import { useDropdownClose } from "@/lib/use-dropdown-close";
import { ProjectMark } from "./ProjectMark";

export default function Header() {
  const t = useTranslations("nav");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const solutionsRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();

  const closeMobileMenu = () => setMobileMenuOpen(false);

  useDropdownClose(solutionsRef, solutionsOpen, () => setSolutionsOpen(false));
  useDropdownClose(aboutRef, aboutOpen, () => setAboutOpen(false));

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl">
      <nav className="header-nav" aria-label="Main">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <div className="logo-container" style={{ width: "90px" }} />
            </Link>

            <div className="hidden md:flex items-center justify-between flex-1 ml-8">
              <div className="flex items-center gap-8">
                <div className="nav-dropdown" ref={solutionsRef}>
                  <button
                    type="button"
                    className="nav-link nav-dropdown-trigger"
                    aria-haspopup="true"
                    aria-expanded={solutionsOpen}
                    onClick={() => {
                      setSolutionsOpen((open) => !open);
                      setAboutOpen(false);
                    }}
                  >
                    {t("studio")}
                    <svg
                      className={`nav-dropdown-chevron ${solutionsOpen ? "open" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {solutionsOpen && (
                    <div className="nav-mega-menu" role="menu">
                      <Link
                        href="/studio"
                        className="nav-mega-featured"
                        role="menuitem"
                        onClick={() => setSolutionsOpen(false)}
                      >
                        <span>
                          {t("ourWork")} <span aria-hidden="true">→</span>
                        </span>
                        <span className="nav-mega-featured-sub">{t("ourWorkSub")}</span>
                      </Link>
                      <p className="nav-mega-heading">{t("solutions")}</p>
                      <Link
                        href="/solutions/ready2vote"
                        className="nav-mega-item"
                        role="menuitem"
                        onClick={() => setSolutionsOpen(false)}
                      >
                        <ProjectMark project="ready2vote" size={22} />
                        <span className="nav-mega-item-text">
                          <span className="nav-mega-item-name">
                            ready<span className="text-b59-blue">2</span>vote
                          </span>
                          <span className="nav-mega-item-sub">{t("ready2voteSub")}</span>
                        </span>
                      </Link>
                      <Link
                        href="/solutions/hotline"
                        className="nav-mega-item"
                        role="menuitem"
                        onClick={() => setSolutionsOpen(false)}
                      >
                        <ProjectMark project="hotline" size={22} />
                        <span className="nav-mega-item-text">
                          <span className="nav-mega-item-name">Hotline</span>
                          <span className="nav-mega-item-sub">{t("hotlineSub")}</span>
                        </span>
                      </Link>

                      <p className="nav-mega-heading nav-mega-heading-mt">{t("caseStudies")}</p>
                      <Link
                        href="/solutions/travis-county-vdr"
                        className="nav-mega-item"
                        role="menuitem"
                        onClick={() => setSolutionsOpen(false)}
                      >
                        <ProjectMark project="travis-county-vdr" size={22} />
                        <span className="nav-mega-item-text">
                          <span className="nav-mega-item-name">Travis County VDR Toolkit</span>
                          <span className="nav-mega-item-sub">{t("travisCountyVdrSub")}</span>
                        </span>
                      </Link>
                      <Link
                        href="/solutions/voter-registration-palooza"
                        className="nav-mega-item"
                        role="menuitem"
                        onClick={() => setSolutionsOpen(false)}
                      >
                        <ProjectMark project="voter-registration-palooza" size={22} />
                        <span className="nav-mega-item-text">
                          <span className="nav-mega-item-name">Voter Registration Palooza</span>
                          <span className="nav-mega-item-sub">{t("voterRegistrationPaloozaSub")}</span>
                        </span>
                      </Link>
                    </div>
                  )}
                </div>

                <div className="nav-dropdown" ref={aboutRef}>
                  <button
                    type="button"
                    className="nav-link nav-dropdown-trigger"
                    aria-haspopup="true"
                    aria-expanded={aboutOpen}
                    onClick={() => {
                      setAboutOpen((open) => !open);
                      setSolutionsOpen(false);
                    }}
                  >
                    {t("about")}
                    <svg
                      className={`nav-dropdown-chevron ${aboutOpen ? "open" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {aboutOpen && (
                    <div className="nav-mega-menu nav-mega-menu-narrow" role="menu">
                      <Link
                        href="/about"
                        className="nav-dropdown-item"
                        role="menuitem"
                        onClick={() => setAboutOpen(false)}
                      >
                        {t("ourStory")}
                      </Link>
                      <Link
                        href="/solutions/brand-design/philosophy"
                        className="nav-dropdown-item"
                        role="menuitem"
                        onClick={() => setAboutOpen(false)}
                      >
                        {t("brandDesignPhilosophy")}
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link href="/donate" className="btn-secondary !py-2 !px-5">
                  {t("donate")}
                </Link>

                <LanguageSwitcher />

                <button
                  onClick={toggleTheme}
                  className="theme-toggle-btn"
                  aria-label={t("toggleTheme")}
                  type="button"
                >
                  {theme === "light" ? (
                    <svg className="theme-toggle-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                      />
                    </svg>
                  ) : (
                    <svg className="theme-toggle-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="md:hidden flex items-center gap-2">
              <LanguageSwitcher />

              <button
                onClick={toggleTheme}
                className="p-2 mobile-menu-btn"
                aria-label={t("toggleTheme")}
                type="button"
              >
                {theme === "light" ? (
                  <svg className="theme-toggle-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                ) : (
                  <svg className="theme-toggle-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                )}
              </button>

              <button
                onClick={() => setMobileMenuOpen((open) => !open)}
                className="mobile-menu-btn"
                aria-label={mobileMenuOpen ? t("closeMenu") : t("openMenu")}
                aria-expanded={mobileMenuOpen}
                type="button"
              >
                {mobileMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <MobileMenu open={mobileMenuOpen} onNavigate={closeMobileMenu} />
        </div>
      </nav>
    </header>
  );
}
