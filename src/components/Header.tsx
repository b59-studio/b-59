"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MobileMenu } from "./MobileMenu";
import { useTheme } from "./ThemeProvider";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const solutionsRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();

  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Close the Solutions dropdown on outside click or Escape.
  useEffect(() => {
    if (!solutionsOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (solutionsRef.current && !solutionsRef.current.contains(event.target as Node)) {
        setSolutionsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSolutionsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [solutionsOpen]);

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl">
      <nav className="header-nav" aria-label="Main">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <div className="logo-container" style={{ width: "90px" }} />
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <div className="nav-dropdown" ref={solutionsRef}>
                <button
                  type="button"
                  className="nav-link nav-dropdown-trigger"
                  aria-haspopup="true"
                  aria-expanded={solutionsOpen}
                  onClick={() => setSolutionsOpen((open) => !open)}
                >
                  Solutions
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
                  <div className="nav-dropdown-menu" role="menu">
                    <Link
                      href="/solutions/ready2vote"
                      className="nav-dropdown-item"
                      role="menuitem"
                      onClick={() => setSolutionsOpen(false)}
                    >
                      ready<span className="text-b59-blue">2</span>vote
                    </Link>
                  </div>
                )}
              </div>

              <Link href="/about" className="nav-link">
                About
              </Link>
              {/**
              <Link href="/work" className="nav-link">
                Work
              </Link>
              */}

              <Link href="/donate" className="btn-secondary !py-2 !px-5">
                Donate
              </Link>

              <button
                onClick={toggleTheme}
                className="theme-toggle-btn"
                aria-label="Toggle theme"
                type="button"
              >
                {theme === "light" ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 mobile-menu-btn"
                aria-label="Toggle theme"
                type="button"
              >
                {theme === "light" ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
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
