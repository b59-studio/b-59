"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { MobileMenu } from "./MobileMenu";
import { useDropdownClose } from "@/lib/use-dropdown-close";
import { NAV_MENUS, type NavGroup, type NavMenu } from "./nav-menus";
import { NavItemMark, NavItemName } from "./NavMenuParts";

/** How long the pointer may be outside a hover-opened menu before it closes. */
const HOVER_CLOSE_DELAY_MS = 150;

/**
 * How long the pointer must rest on another section before it replaces the one
 * already open. Long enough that a diagonal path from a section to its panel
 * can cross its neighbours without switching to them; short enough that
 * pointing at a section reads as choosing it.
 */
const SECTION_SWITCH_DELAY_MS = 120;

type Translate = ReturnType<typeof useTranslations<"nav">>;

/** The pages in one group, each with its mark, name and summary. */
function MegaItems({
  items,
  t,
  onNavigate,
}: {
  items: NavGroup["items"];
  t: Translate;
  onNavigate: () => void;
}) {
  return items.map((item) => (
    <Link
      key={item.href}
      href={item.href}
      className="nav-mega-item"
      role="menuitem"
      onClick={onNavigate}
    >
      <NavItemMark item={item} size={22} />
      <span className="nav-mega-item-text">
        <span className="nav-mega-item-name">
          <NavItemName item={item} t={t} />
        </span>
        <span className="nav-mega-item-sub">{t(item.sub)}</span>
      </span>
    </Link>
  ));
}

/**
 * The open panel under a header trigger. A menu whose pages fall into named
 * sections opens on those sections alone, and pointing at one (or focusing or
 * tapping it) opens its pages beside the list. A menu with a single unnamed
 * run of pages lists them straight away, since there is nothing to choose.
 */
function MegaMenu({ menu, onNavigate }: { menu: NavMenu; onNavigate: () => void }) {
  const t = useTranslations("nav");
  const [active, setActive] = useState<number | null>(null);
  const switchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const sectioned = menu.groups.every((g) => g.heading);

  const cancelSwitch = () => {
    if (switchTimer.current) clearTimeout(switchTimer.current);
    switchTimer.current = null;
  };
  useEffect(() => cancelSwitch, []);

  const onSectionPointerEnter = (i: number) => (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    cancelSwitch();
    if (active === null) setActive(i);
    else if (active !== i) switchTimer.current = setTimeout(() => setActive(i), SECTION_SWITCH_DELAY_MS);
  };
  const focusFirstItem = () => {
    // The panel renders on the next paint when the section was not yet open.
    requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>("a")?.focus());
  };
  const onSectionKeyDown = (i: number) => (e: React.KeyboardEvent) => {
    const toPanel = document.dir === "rtl" ? "ArrowLeft" : "ArrowRight";
    if (e.key !== toPanel) return;
    e.preventDefault();
    setActive(i);
    focusFirstItem();
  };

  const featured = (
    <Link href={menu.header.href} className="nav-mega-featured" role="menuitem" onClick={onNavigate}>
      <span>{t(menu.header.title)}</span>
      <span className="nav-mega-featured-sub">{t(menu.header.sub)}</span>
    </Link>
  );

  if (!sectioned) {
    return (
      <div className="nav-mega-menu" role="menu">
        {featured}
        {menu.groups.map((group, i) => (
          <div key={i} className="nav-mega-group" role="none">
            <MegaItems items={group.items} t={t} onNavigate={onNavigate} />
          </div>
        ))}
      </div>
    );
  }

  const open = active === null ? null : menu.groups[active];

  return (
    <div className={`nav-mega-menu nav-mega-split ${open ? "expanded" : ""}`} role="menu">
      <div className="nav-mega-rail" role="none">
        {featured}
        {menu.groups.map((group, i) => (
          <button
            key={group.heading}
            type="button"
            className={`nav-mega-section ${active === i ? "active" : ""}`}
            role="menuitem"
            aria-haspopup="true"
            aria-expanded={active === i}
            onPointerEnter={onSectionPointerEnter(i)}
            onPointerLeave={cancelSwitch}
            onFocus={() => setActive(i)}
            onClick={() => {
              setActive(i);
              focusFirstItem();
            }}
            onKeyDown={onSectionKeyDown(i)}
          >
            <span>{t(group.heading!)}</span>
            <svg
              className="nav-mega-section-chevron"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>
      {open && (
        <div
          ref={panelRef}
          className="nav-mega-panel"
          role="group"
          aria-label={t(open.heading!)}
          onPointerEnter={cancelSwitch}
        >
          <MegaItems items={open.items} t={t} onNavigate={onNavigate} />
        </div>
      )}
    </div>
  );
}

/**
 * One header dropdown. Opening another one is a click outside this one, so
 * only one is ever open without the menus having to know about each other.
 *
 * A mouse also opens it on hover and closes it on leaving, after a short grace
 * period so a diagonal path to the menu does not snap it shut. Hover is mouse
 * only: touch and pen keep tap-to-toggle, and the keyboard keeps the button.
 */
function NavDropdown({ menu }: { menu: NavMenu }) {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Set when hover opened the menu, so the click that usually follows a hover
  // keeps it open instead of toggling it straight back shut.
  const openedByHover = useRef(false);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };
  const close = () => {
    cancelClose();
    openedByHover.current = false;
    setOpen(false);
  };
  useDropdownClose(ref, open, close);
  useEffect(() => cancelClose, []);

  const onPointerEnter = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    cancelClose();
    if (!open) openedByHover.current = true;
    setOpen(true);
  };
  const onPointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    cancelClose();
    closeTimer.current = setTimeout(close, HOVER_CLOSE_DELAY_MS);
  };
  const onTriggerClick = () => {
    if (openedByHover.current) {
      openedByHover.current = false;
      return;
    }
    setOpen((o) => !o);
  };

  return (
    <div
      className="nav-dropdown"
      ref={ref}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <button
        type="button"
        className="nav-link nav-dropdown-trigger"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={onTriggerClick}
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

      {open && <MegaMenu menu={menu} onNavigate={close} />}
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
