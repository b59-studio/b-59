"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { MobileMenu } from "./MobileMenu";
import { useDropdownClose } from "@/lib/use-dropdown-close";
import { NAV_MENUS, type NavMenu } from "./nav-menus";
import { NavItemMark, NavItemName } from "./NavMenuParts";

/**
 * One header dropdown. Opening another one is a click outside this one, so
 * only one is ever open without the menus having to know about each other.
 */
function NavDropdown({ menu }: { menu: NavMenu }) {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);
  useDropdownClose(ref, open, close);

  return (
    <div className="nav-dropdown" ref={ref}>
      <button
        type="button"
        className="nav-link nav-dropdown-trigger"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {t(menu.trigger)}
        <svg
          className={`nav-dropdown-chevron ${open ? "open" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="nav-mega-menu" role="menu">
          <Link href={menu.header.href} className="nav-mega-featured" role="menuitem" onClick={close}>
            <span>{t(menu.header.title)}</span>
            <span className="nav-mega-featured-sub">{t(menu.header.sub)}</span>
          </Link>
          {menu.groups.map((group, i) => (
            <div key={group.heading ?? i} className="nav-mega-group" role="none">
              {group.heading && (
                <p className="nav-mega-heading" role="none">
                  {t(group.heading)}
                </p>
              )}
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="nav-mega-item"
                  role="menuitem"
                  onClick={close}
                >
                  <NavItemMark item={item} size={22} />
                  <span className="nav-mega-item-text">
                    <span className="nav-mega-item-name">
                      <NavItemName item={item} t={t} />
                    </span>
                    <span className="nav-mega-item-sub">{t(item.sub)}</span>
                  </span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const t = useTranslations("nav");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl">
      <nav className="header-nav" aria-label="Main">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <div className="logo-container" style={{ width: "90px" }} />
            </Link>

            <div className="hidden md:flex items-center justify-between flex-1 ms-8">
              <div className="flex items-center gap-8">
                {NAV_MENUS.map((menu) => (
                  <NavDropdown key={menu.id} menu={menu} />
                ))}
              </div>

              {/* Donations are closed, so the bar has no action on it for now.
                  The language selector and the theme toggle do not move up here
                  to fill the gap: the page already opens in the reader's
                  language and their device's mode, so both stay in the footer
                  and at the foot of the mobile menu (standards/33,
                  standards/25). Uncomment with src/lib/donations.ts.
              <div className="flex items-center gap-2">
                <Link href="/donate" className="btn-secondary !py-2 !px-5">
                  {t("donate")}
                </Link>
              </div>
              */}
            </div>

            <div className="md:hidden flex items-center gap-2">
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
