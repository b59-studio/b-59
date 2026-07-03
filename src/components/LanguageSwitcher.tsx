"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, localeNames } from "@/i18n/config";
import { useDropdownClose } from "@/lib/use-dropdown-close";

/**
 * Language selector shown as a globe icon plus the current language in its own
 * name (e.g. "Español") — the proven gov/civic pattern. The trigger gives a
 * non-English reader a recognizable anchor on an otherwise-translated page;
 * the full list of languages (each in its own script) stays behind the click.
 *
 * Selecting a language navigates to the same page under the chosen locale.
 * next-intl rewrites the URL (adding/removing the locale prefix) and persists
 * the choice in its NEXT_LOCALE cookie.
 *
 * `placement` controls which side the menu opens toward: "bottom" for the
 * header, "top" for the footer (where there is no room below).
 */
export function LanguageSwitcher({
  placement = "bottom",
}: {
  placement?: "bottom" | "top";
}) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useDropdownClose(containerRef, open, () => setOpen(false));

  function select(code: (typeof locales)[number]) {
    setOpen(false);
    if (code === locale) return;
    router.replace(pathname, { locale: code });
  }

  const menuPosition = placement === "top" ? "bottom-full mb-2" : "top-full mt-2";

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        id="language-menu-button"
        onClick={() => setOpen((o) => !o)}
        className="lang-switcher-trigger"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="language-menu"
        aria-label={`${t("selectLanguage")}: ${localeNames[locale as (typeof locales)[number]]}`}
      >
        <GlobeIcon />
        <span>{localeNames[locale as (typeof locales)[number]]}</span>
        <ChevronIcon open={open} />
      </button>
      {open && (
        <div
          id="language-menu"
          role="menu"
          aria-labelledby="language-menu-button"
          className={`lang-switcher-menu ${menuPosition}`}
        >
          {locales.map((code) => {
            const isActive = code === locale;
            return (
              <button
                key={code}
                type="button"
                role="menuitem"
                onClick={() => select(code)}
                aria-current={isActive ? "true" : undefined}
                className="nav-dropdown-item lang-switcher-item"
              >
                <span>{localeNames[code]}</span>
                {isActive && <CheckIcon />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function GlobeIcon() {
  return (
    <svg
      className="lang-switcher-icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`lang-switcher-chevron${open ? " is-open" : ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="lang-switcher-check"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}
