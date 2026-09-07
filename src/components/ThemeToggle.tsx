"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "./ThemeProvider";

/**
 * Light/dark toggle. The site opens in the mode the reader's device asks for
 * and this offers the other one; pressing it stores a choice, and a stored
 * choice wins from then on (standards/25).
 *
 * It lives in the footer and at the bottom of the mobile menu, not on the
 * header bar — the default is already right for most readers, so this corrects
 * it rather than being the way in.
 */
export function ThemeToggle({ className = "theme-toggle-btn" }: { className?: string }) {
  const t = useTranslations("nav");
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme} className={className} aria-label={t("toggleTheme")} type="button">
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
  );
}
