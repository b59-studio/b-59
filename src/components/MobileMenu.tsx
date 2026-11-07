"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { NAV_MENUS } from "./nav-menus";
import { NavItemMark, NavItemName } from "./NavMenuParts";

type MobileMenuProps = {
  open: boolean;
  onNavigate: () => void;
};

/**
 * The phone's version of the header dropdowns, laid out in sequence from the
 * same menu definition: each section opens on its linked header and summary,
 * then lists its pages with their marks.
 */
export function MobileMenu({ open, onNavigate }: MobileMenuProps) {
  const t = useTranslations("nav");

  if (!open) {
    return null;
  }

  return (
    <div className="nav-mobile-panel md:hidden py-4 space-y-2 border-t border-b59-gray/20 mt-2">
      {NAV_MENUS.map((menu) => (
        <div key={menu.id} className="nav-mobile-section space-y-2">
          <Link href={menu.header.href} className="nav-mobile-link nav-mobile-section-link" onClick={onNavigate}>
            {t(menu.header.title)}
          </Link>
          <span className="nav-mobile-sub nav-mobile-section-sub">{t(menu.header.sub)}</span>

          {menu.groups.map((group, i) => (
            <div key={group.heading ?? i} className="space-y-2">
              {group.heading && <span className="nav-mobile-heading">{t(group.heading)}</span>}
              {group.items.map((item) => (
                <div key={item.href}>
                  <Link href={item.href} className="nav-mobile-link nav-mobile-sublink" onClick={onNavigate}>
                    <NavItemMark item={item} size={20} />
                    <span>
                      <NavItemName item={item} t={t} />
                    </span>
                  </Link>
                  <span className="nav-mobile-sub nav-mobile-sub-marked">{t(item.sub)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}

      {/* Donations are closed; see src/lib/donations.ts.
      <Link href="/donate" className="nav-mobile-link" onClick={onNavigate}>
        {t("donate")}
      </Link>
      */}

      {/* Last in the panel, under the links: the page already opens in the
          reader's language and their device's mode, so these are the override
          rather than the way in (standards/33). The footer carries the same
          pair. */}
      <div className="flex items-center gap-2 border-t border-b59-gray/20 pt-3 mt-3">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </div>
  );
}
